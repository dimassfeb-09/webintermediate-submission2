import StoryModel from "../../models/StoryModel.js";
import StoryView from "../StoryView.js";
import StoryPresenter from "../../presenters/StoryPresenter.js";
import { getAllOfflineStories } from "../../utils/idb.js";

const HomePage = {
  async render() {
    return `
      <section id="home" class="page-enter">
        <h2>Daftar Cerita</h2>
        <div id="map" style="height: 400px;"></div>
        <div id="storyContainer"></div>
      </section>
    `;
  },

  async afterRender() {
    const token = localStorage.getItem("token");

    const section = document.getElementById("home");
    if (section) {
      requestAnimationFrame(() => {
        section.classList.add("page-enter-active");
      });

      setTimeout(() => {
        section.classList.remove("page-enter");
        section.classList.remove("page-enter-active");
      }, 600);
    }

    const container = document.getElementById("storyContainer");
    if (!container) {
      console.error("Elemen #storyContainer tidak ditemukan!");
      return;
    }

    const model = new StoryModel("https://story-api.dicoding.dev/v1");
    const view = new StoryView(container, "map");
    const presenter = new StoryPresenter(model, view, token);

    // Load online stories
    await presenter.loadStories();

    // Load offline stories
    const offlineStories = await getAllOfflineStories();
    if (offlineStories.length > 0) {
      const offlineSection = document.createElement("div");
      offlineSection.innerHTML = `<h3>Cerita Offline</h3>`;

      offlineStories.forEach((story) => {
        const storyElement = document.createElement("div");
        storyElement.classList.add("story-card");

        const imageUrl = URL.createObjectURL(story.image);

        storyElement.innerHTML = `
          <p>${story.description}</p>
          <img src="${imageUrl}" alt="Gambar Offline" style="max-width: 100%">
          <p><strong>Lokasi:</strong> ${story.lat}, ${story.lng}</p>
        `;

        offlineSection.appendChild(storyElement);
      });

      container.appendChild(offlineSection);
    }
  },
};

export default HomePage;
