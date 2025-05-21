import { saveStoriesToDB } from "../utils/idb";

class StoryPresenter {
  constructor(model, view, token) {
    this.model = model;
    this.view = view;
    this.token = token;
  }

  async loadStories() {
    try {
      const stories = await this.model.fetchStories(this.token);
      const validStories = stories.filter(
        (story) => story.lat !== null && story.lon !== null
      );

      this.view.renderStories(validStories);

      await saveStoriesToDB(validStories);

      return validStories;
    } catch (error) {
      console.error("❌ Gagal memuat cerita:", error);
      this.view.renderError("Gagal memuat cerita. Silakan coba lagi.");
      return [];
    }
  }
}

export default StoryPresenter;
