import StoryModel from "../../models/StoryModel.js";
import StoryView from "../StoryView.js";
import StoryPresenter from "../../presenters/StoryPresenter.js";
import { getAllStoriesFromDB } from "../../utils/idb.js";

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
    const onlineStories = await presenter.loadStories();

    // Load offline stories
    const offlineStories = await getAllStoriesFromDB();
    const storyMap = new Map();

    onlineStories.forEach((story) => {
      storyMap.set(story.id, story);
    });

    offlineStories.forEach((story) => {
      if (!storyMap.has(story.id)) {
        storyMap.set(story.id, story);
      }
    });

    const allStories = Array.from(storyMap.values());

    // Fungsi untuk render satu cerita jadi card
    function renderStoryCard(story) {
      const storyElement = document.createElement("div");
      storyElement.classList.add("story-card");

      let imageUrl = "";

      if (story.image instanceof Blob) {
        imageUrl = URL.createObjectURL(story.image);
      } else if (typeof story.image === "string" && story.image.trim() !== "") {
        imageUrl = story.image;
      } else if (
        typeof story.photoUrl === "string" &&
        story.photoUrl.trim() !== ""
      ) {
        imageUrl = story.photoUrl;
      } else {
        imageUrl =
          "data:image/svg+xml;charset=UTF-8," +
          encodeURIComponent(`
        <svg width="400" height="200" xmlns="http://www.w3.org/2000/svg" 
          style="background:#ddd">
          <rect width="400" height="200" fill="#ccc" />
          <text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" 
            fill="#999" font-family="Arial" font-size="20">
            No Image
          </text>
        </svg>
      `);
      }

      storyElement.innerHTML = `
    <div class="card-image" style="max-height: 200px; overflow: hidden;">
      <img src="${imageUrl}" alt="Gambar Cerita" style="width: 100%; object-fit: cover;">
    </div>
    <div class="card-content" style="padding: 10px;">
      <p>${story.description}</p>
      <p><strong>Lokasi:</strong> ${story.lat}, ${story.lng}</p>
    </div>
  `;

      return storyElement;
    }

    // Clear container
    container.innerHTML = "";

    // Render semua cerita sekaligus
    allStories.forEach((story) => {
      container.appendChild(renderStoryCard(story));
    });
  },
};

export default HomePage;
