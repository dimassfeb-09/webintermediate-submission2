const DB_NAME = "StoryAppDB";
const DB_VERSION = 1;
const STORE_NAME = "stories";

export function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => reject(request.error);

    request.onsuccess = () => resolve(request.result);

    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: "id" });
      }
    };
  });
}

export async function saveStoriesToDB(stories) {
  try {
    const db = await openDB();

    // Ambil data dulu di luar transaksi
    const allStoriesOffline = await getAllStoriesFromDB();

    const existingIds = new Set(allStoriesOffline.map((story) => story.id));

    // Mulai transaksi baru
    const tx = db.transaction(STORE_NAME, "readwrite");
    const store = tx.objectStore(STORE_NAME);

    let savedCount = 0;

    for (const story of stories) {
      if (!existingIds.has(story.id)) {
        store.put(story); // Jangan await di sini, put() itu sync (request async tapi tidak promise)
        savedCount++;
      } else {
        console.info(`Story with id ${story.id} already exists, skipping.`);
      }
    }

    await tx.complete; // tunggu transaksi selesai

    console.info(`Total stories saved: ${savedCount}`);
  } catch (error) {
    console.error("Failed to save stories to IndexedDB:", error);
  }
}

export async function getAllStoriesFromDB() {
  const db = await openDB();
  const tx = db.transaction(STORE_NAME, "readonly");
  const store = tx.objectStore(STORE_NAME);
  return new Promise((resolve, reject) => {
    const request = store.getAll();
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}
