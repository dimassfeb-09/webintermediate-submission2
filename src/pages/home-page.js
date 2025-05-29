import StoryModel from "../models/storymodel";
import StoryPresenter from "../models/storypresenter";
import ViewStory from "../view-story";
import {
  showLoading,
  hideLoading,
  registerServiceWorker,
} from "../scripts/index.js";
import {
  subscribeUser,
  unsubscribeUser,
  isSubscribed,
} from "../scripts/notification.js";

const homePage = {
  async render() {
    return `
      <section id="home-section" class="page-enter">
        <div id="map" class="story-map"></div>
        <div class="button-wrapper">
          <button id="btn-load-favorites">⭐Tampilkan Story Favorit🤩</button>
        </div>
        <div id="favorites-container"></div>
        <div id="storyContainer"></div>
      </section>
    `;
  },

  async afterRender() {
    const token = localStorage.getItem("token");
    const section = document.getElementById("home-section");

    if (section) {
      requestAnimationFrame(() => section.classList.add("page-enter-active"));
      setTimeout(() => {
        section.classList.remove("page-enter", "page-enter-active");
      }, 300);
    }

    const model = new StoryModel();
    const view = new ViewStory(
      document.getElementById("storyContainer"),
      "map"
    );
    const presenter = new StoryPresenter(model, view, token);

    try {
      showLoading();
      await presenter.loadStory();
    } catch (err) {
      console.error("Gagal memuat story:", err);
    } finally {
      hideLoading();
    }

    const favoriteBtn = document.getElementById("btn-load-favorites");
    let showingFavorites = false;

    if (favoriteBtn) {
      favoriteBtn.addEventListener("click", async () => {
        try {
          showLoading();

          if (!showingFavorites) {
            const favorites = await window.idbFavorite.getAll();
            favorites.forEach((story) => (story.fromFavoriteList = true));
            await view.renderFavorites(favorites);
            favoriteBtn.textContent = "🔙 Kembali ke Semua Story 🔙";
            showingFavorites = true;
          } else {
            await presenter.loadStory();
            favoriteBtn.textContent = "⭐Tampilkan Story Favorit🤩";
            showingFavorites = false;
          }

          document.getElementById("favorites-container").innerHTML = "";
        } catch (err) {
          console.error("Gagal memuat cerita:", err);
          view.renderError("Gagal memuat cerita.");
        } finally {
          hideLoading();
        }
      });
    }

    if (!token) return;

    let pushBtn = document.getElementById("push-toggle-btn");
    const nav = document.querySelector("header nav");

    if (!pushBtn && nav) {
      pushBtn = document.createElement("button");
      pushBtn.id = "push-toggle-btn";
      pushBtn.className = "push-toggle";
      nav.appendChild(pushBtn);
    }

    const updateBtn = (status) => {
      // status: "granted" | "denied" | "default" | "subscribed" | "unsubscribed"
      if (!pushBtn) return;

      if (status === "denied") {
        pushBtn.textContent = "Notifikasi diblokir";
        pushBtn.disabled = true;
        pushBtn.style.display = "inline-block";
      } else if (status === "subscribed") {
        pushBtn.textContent = "🔕 Notifikasi diaktifkan (klik untuk matikan)";
        pushBtn.disabled = false;
        pushBtn.style.display = "inline-block";
        pushBtn.classList.add("subscribed");
      } else if (status === "unsubscribed") {
        pushBtn.textContent = "🔔 Aktifkan Notifikasi";
        pushBtn.disabled = false;
        pushBtn.style.display = "inline-block";
        pushBtn.classList.remove("subscribed");
      } else {
        pushBtn.textContent = "Minta izin notifikasi";
        pushBtn.disabled = false;
        pushBtn.style.display = "inline-block";
        pushBtn.classList.remove("subscribed");
      }
    };

    if (Notification.permission === "denied") {
      updateBtn("denied");
      return;
    }

    if (Notification.permission === "default") {
      updateBtn("default");
    }

    try {
      await registerServiceWorker();
      const swReg = await navigator.serviceWorker.ready;

      // Jika permission default, coba request permission saat klik tombol
      if (Notification.permission === "default") {
        pushBtn.addEventListener("click", async () => {
          const permission = await Notification.requestPermission();
          if (permission === "granted") {
            // Cek subscribe status dan update tombol
            const subscribed = await isSubscribed(swReg);
            updateBtn(subscribed ? "subscribed" : "unsubscribed");
          } else if (permission === "denied") {
            updateBtn("denied");
          }
        });
        return; // jangan lanjut ke event listener subscribe/unsubscribe dulu
      }

      // Jika permission granted
      const updateSubscriptionStatus = async () => {
        const subscribed = await isSubscribed(swReg);
        updateBtn(subscribed ? "subscribed" : "unsubscribed");
      };

      await updateSubscriptionStatus();

      pushBtn.addEventListener("click", async () => {
        const subscribed = await isSubscribed(swReg);
        if (subscribed) {
          await unsubscribeUser(swReg, token);
          alert("Berhenti berlangganan notifikasi.");
        } else {
          await subscribeUser(swReg, token);
          alert("Berhasil berlangganan notifikasi.");
        }
        await updateSubscriptionStatus();
      });
    } catch (err) {
      console.error("Gagal setup push notification:", err);
      if (pushBtn) {
        pushBtn.style.display = "none";
      }
    }
  },
};

export default homePage;
