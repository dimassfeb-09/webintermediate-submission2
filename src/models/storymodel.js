import { BASE_URL } from "../utils/config";
import { idbFavorite } from "../scripts/idb";

class StoryModel {
  constructor() {
    this.BASE_URL = BASE_URL;
  }

  async fetchStories(token) {
    try {
      const response = await fetch(`${this.BASE_URL}/stories`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch stories, ${response.status}`);
      }

      const { listStory } = await response.json();
      console.log("Fetched from API:", listStory);
      return listStory;
    } catch (error) {
      console.error(
        "Error fetching stories, falling back to IndexedDB:",
        error
      );

      const offlineFavorites = await idbFavorite.getAll();
      offlineFavorites.forEach((story) => {
        story.offline = true;
      });

      return offlineFavorites || [];
    }
  }

  async addStory(formData, token) {
    try {
      const response = await fetch(`${this.BASE_URL}/stories`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Failed to add story");
      }

      return result;
    } catch (error) {
      console.error("Error adding story:", error);
      return { error: true, message: error.message };
    }
  }
}

export default StoryModel;
