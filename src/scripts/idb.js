import { openDB } from "idb";

const DB_NAME = "story-db";
const FAVORITE_STORE = "favorites";

const dbPromise = openDB(DB_NAME, 2, {
  upgrade(db) {
    if (!db.objectStoreNames.contains(FAVORITE_STORE)) {
      db.createObjectStore(FAVORITE_STORE, { keyPath: "id" });
    }
  },
});

export const idbFavorite = {
  async save(story) {
    try {
      const db = await dbPromise;
      const tx = db.transaction(FAVORITE_STORE, "readwrite");
      const store = tx.objectStore(FAVORITE_STORE);
      await store.put(story);
      await tx.done;
    } catch (error) {
      console.error("Failed to save favorite:", error);
    }
  },

  async delete(id) {
    try {
      const db = await dbPromise;
      const tx = db.transaction(FAVORITE_STORE, "readwrite");
      const store = tx.objectStore(FAVORITE_STORE);
      await store.delete(id);
      await tx.done;
    } catch (error) {
      console.error(`Failed to delete favorite with id ${id}:`, error);
    }
  },

  async getAll() {
    try {
      const db = await dbPromise;
      return await db.getAll(FAVORITE_STORE);
    } catch (error) {
      console.error("Failed to get favorites:", error);
      return [];
    }
  },

  async isFavorited(id) {
    try {
      const db = await dbPromise;
      return !!(await db.get(FAVORITE_STORE, id));
    } catch (error) {
      console.error("Failed to check if favorited:", error);
      return false;
    }
  },
};

window.idbFavorite = idbFavorite;
