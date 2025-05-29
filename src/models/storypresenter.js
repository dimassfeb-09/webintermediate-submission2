import { idbFavorite } from "../scripts/idb";

class StoryPresenter {
  constructor(model, view, token) {
    this.model = model;
    this.view = view;
    this.token = token;

    this.view.setDeleteHandler(this.deleteOfflineStory.bind(this));
    this.view.setFavoriteHandler(this.toggleFavorite.bind(this));
    this.view.setUnfavoriteHandler(this.removeFromFavorite.bind(this));

    if (this.view.setLoadFavoritesHandler) {
      this.view.setLoadFavoritesHandler(this.loadFavoriteStories.bind(this));
    }
  }

  async loadStory() {
    try {
      const stories = await this.model.fetchStories(this.token);
      const validStories = stories.filter(
        (story) => story && story.lat !== null && story.lon !== null
      );
      console.log("[DEBUG] Valid stories:", validStories);
      this.view.render(validStories);
    } catch (error) {
      console.error(
        "Error fetching stories, falling back to favorites:",
        error
      );
      const favorites = await idbFavorite.getAll();
      const storiesWithFlag = favorites.map((s) => ({
        ...s,
        offline: true,
      }));
      this.view.render(storiesWithFlag);
      this.view.renderError(
        "Gagal memuat cerita dari server. Menampilkan favorit offline."
      );
    }
  }

  async toggleFavorite(story, isCurrentlyFavorited) {
    try {
      if (!story || !story.id) throw new Error("Story tidak valid");

      if (isCurrentlyFavorited) {
        await idbFavorite.delete(story.id);
        alert("Dihapus dari Favorit");
      } else {
        await idbFavorite.save(story);
        alert("Disimpan ke Favorit");
      }

      this.loadStory();
    } catch (err) {
      console.error("Gagal mengatur favorit:", err);
      this.view.renderError("Gagal mengubah status favorit.");
    }
  }

  async removeFromFavorite(storyId) {
    try {
      if (!storyId) throw new Error("ID tidak valid");
      await idbFavorite.delete(storyId);
      alert("Dihapus dari Favorit");
    } catch (error) {
      console.error("Gagal menghapus dari favorit:", error);
      this.view.renderError("Gagal menghapus dari favorit.");
    }
  }

  async deleteOfflineStory(id) {
    try {
      await idbFavorite.delete(id);
      const updatedFavorites = await idbFavorite.getAll();
      const withOfflineFlag = updatedFavorites.map((s) => ({
        ...s,
        offline: true,
      }));
      this.view.render(withOfflineFlag);
    } catch (error) {
      console.error("Error deleting offline favorite:", error);
      this.view.renderError("Gagal menghapus cerita favorit offline.");
    }
  }

  async loadFavoriteStories() {
    try {
      const favorites = await idbFavorite.getAll();
      this.view.renderFavorites(favorites);
    } catch (error) {
      console.error("Gagal memuat favorit:", error);
      this.view.renderError("Gagal memuat daftar favorit.");
    }
  }
}

export default StoryPresenter;
