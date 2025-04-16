import { openDB } from "idb";

const DB_NAME = "story-app";
const STORE_NAME = "offline-stories";

export const initDB = async () => {
  return openDB(DB_NAME, 1, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, {
          keyPath: "id",
          autoIncrement: true,
        });
      }
    },
  });
};

export const addStoryToIDB = async (story) => {
  const db = await initDB();
  await db.add(STORE_NAME, story);
};

export const getAllOfflineStories = async () => {
  const db = await initDB();
  return db.getAll(STORE_NAME);
};

export const deleteStoryFromIDB = async (id) => {
  const db = await initDB();
  return db.delete(STORE_NAME, id);
};
