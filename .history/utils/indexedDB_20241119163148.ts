// utils/indexedDB.ts
import { openDB, IDBPDatabase } from "idb";

export interface MessageDB {
  id?: number; // Автоинкрементный ключ
  text: string;
  role: "user" | "assistant";
  timestamp: string; // ISO строка даты
}

const DB_NAME = "ChatDB";
const STORE_NAME = "messages";
const DB_VERSION = 1;

let dbPromise: Promise<IDBPDatabase>;

export const initializeDB = async () => {
  if (!dbPromise) {
    dbPromise = openDB(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          const store = db.createObjectStore(STORE_NAME, {
            keyPath: "id",
            autoIncrement: true,
          });

          store.createIndex("timestamp", "timestamp");
        }
      },
    });
  }

  return dbPromise;
};

export const addMessage = async (message: Omit<MessageDB, "id">) => {
  const db = await initializeDB();
  const tx = db.transaction(STORE_NAME, "readwrite");

  await tx.store.add(message);
  await tx.done;
};

export const getAllMessages = async (): Promise<MessageDB[]> => {
  const db = await initializeDB();

  return db.getAllFromIndex(STORE_NAME, "timestamp");
};

export const deleteMessage = async (id: number) => {
  const db = await initializeDB();
  const tx = db.transaction(STORE_NAME, "readwrite");

  await tx.store.delete(id);
  await tx.done;
};
