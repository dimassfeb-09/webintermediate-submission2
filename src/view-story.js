import { MAP_SERVICE_API_KEY } from "./utils/config";

class ViewStory {
  constructor(container, mapId) {
    this.container = container;
    this.mapId = mapId;
    this.map = null;
    this.deleteHandler = null;
    this.favoriteHandler = null;
    this.unfavoriteHandler = null;
  }

  setDeleteHandler(handler) {
    this.deleteHandler = handler;
  }

  setFavoriteHandler(handler) {
    this.favoriteHandler = handler;
  }

  setUnfavoriteHandler(handler) {
    this.unfavoriteHandler = handler;
  }

  async render(stories = []) {
    this.container.innerHTML = "";
    if (!stories.length) {
      this.showEmptyMessage();
      return;
    }
    for (const story of stories) {
      const storyElement = await this.createStoryElement(story);
      this.container.appendChild(storyElement);
    }
    this.renderMap(stories);
  }

  async renderFavorites(favoriteStories = []) {
    const markedFavorites = favoriteStories.map((s) => ({
      ...s,
      fromFavoriteList: true,
    }));
    await this.render(markedFavorites);
  }

  renderError(message) {
    const errorElem = document.createElement("p");
    errorElem.textContent = message;
    errorElem.style.color = "red";
    this.container.appendChild(errorElem);
  }

  showEmptyMessage() {
    const message = document.createElement("p");
    message.textContent = "Tidak ada cerita yang tersedia.";
    message.style.fontStyle = "italic";
    this.container.appendChild(message);
  }

  async createStoryElement(story) {
    const storyElement = document.createElement("div");
    storyElement.classList.add("story");

    const date = new Date(story.createdAt).toLocaleString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });

    const nameElem = document.createElement("h2");
    nameElem.textContent = story.name;

    const descElem = document.createElement("p");
    descElem.textContent = story.description;

    const dateElem = document.createElement("p");
    dateElem.textContent = date;

    storyElement.appendChild(nameElem);
    storyElement.appendChild(descElem);
    storyElement.appendChild(dateElem);

    let lastImageElem = null;

    if (story.photoUrl) {
      const img = document.createElement("img");
      img.src = story.photoUrl;
      img.alt = story.name;
      img.width = 200;
      img.height = 200;
      storyElement.appendChild(img);
      lastImageElem = img;
    }

    if (story.offline && this.deleteHandler) {
      const deleteBtn = this.createDeleteButton(story.id);
      storyElement.appendChild(deleteBtn);
    }

    if (!story.offline && this.favoriteHandler) {
      if (story.fromFavoriteList && this.unfavoriteHandler) {
        const unfavBtn = this.createUnfavoriteButton(story.id);
        if (lastImageElem) {
          storyElement.insertBefore(unfavBtn, lastImageElem.nextSibling);
        } else {
          storyElement.appendChild(unfavBtn);
        }
      } else {
        const isFavorited = await window.idbFavorite.isFavorited(story.id);
        const favBtn = this.createFavoriteButton(story, isFavorited);
        if (lastImageElem) {
          storyElement.insertBefore(favBtn, lastImageElem.nextSibling);
        } else {
          storyElement.appendChild(favBtn);
        }
      }
    }

    return storyElement;
  }

  createDeleteButton(storyId) {
    const button = document.createElement("button");
    button.textContent = "Hapus";
    button.classList.add("delete-btn");
    Object.assign(button.style, {
      backgroundColor: "#e74c3c",
      color: "white",
      border: "none",
      padding: "8px 12px",
      cursor: "pointer",
      marginTop: "8px",
      borderRadius: "4px",
    });
    button.addEventListener("click", () => {
      const confirmDelete = confirm("Yakin ingin menghapus story ini?");
      if (confirmDelete && this.deleteHandler) {
        this.deleteHandler(storyId);
      }
    });
    return button;
  }

  createFavoriteButton(story, isFavorited) {
    const button = document.createElement("button");
    button.textContent = isFavorited
      ? "🗑️ Hapus dari Favorit"
      : "💖 Simpan ke Favorit";
    button.classList.add("favorite-btn");
    Object.assign(button.style, {
      backgroundColor: isFavorited ? "#c0392b" : "#27ae60",
      color: "white",
      border: "none",
      padding: "6px 10px",
      marginTop: "8px",
      borderRadius: "4px",
      cursor: "pointer",
    });
    button.addEventListener("click", () => {
      if (this.favoriteHandler) {
        this.favoriteHandler(story, isFavorited);
      }
    });
    return button;
  }

  createUnfavoriteButton(storyId) {
    const button = document.createElement("button");
    button.textContent = "🗑️ Hapus dari Favorit";
    button.classList.add("unfavorite-btn");
    Object.assign(button.style, {
      backgroundColor: "#c0392b",
      color: "white",
      border: "none",
      padding: "6px 10px",
      marginTop: "8px",
      borderRadius: "4px",
      cursor: "pointer",
    });
    button.addEventListener("click", () => {
      const confirmDelete = confirm("Yakin ingin menghapus dari favorit?");
      if (confirmDelete && this.unfavoriteHandler) {
        this.unfavoriteHandler(storyId);
      }
    });
    return button;
  }

  renderMap(stories) {
    const mapContainer = document.getElementById(this.mapId);
    if (!mapContainer) return;
    if (this.map) {
      this.map.remove();
      this.map = null;
    }
    if (mapContainer._leaflet_id) {
      mapContainer._leaflet_id = null;
    }
    const initialCoords = [-6.2088, 106.8456];
    this.map = L.map(this.mapId).setView(initialCoords, 13);
    const apiKey = MAP_SERVICE_API_KEY || "YOUR_MAPTILER_API_KEY";
    L.tileLayer(
      `https://api.maptiler.com/maps/streets/{z}/{x}/{y}.png?key=${apiKey}`,
      {
        attribution: "© OpenStreetMap contributors © MapTiler",
        tileSize: 512,
        zoomOffset: -1,
      }
    ).addTo(this.map);
    setTimeout(() => this.map.invalidateSize(), 300);
    stories.forEach((story) => {
      if (this.isValidCoordinate(story.lat, story.lon)) {
        const marker = L.marker([story.lat, story.lon]).addTo(this.map);
        marker.bindPopup(`<b>${story.name}</b><br>${story.description}`);
      }
    });
  }

  isValidCoordinate(lat, lon) {
    return typeof lat === "number" && typeof lon === "number";
  }
}

export default ViewStory;
