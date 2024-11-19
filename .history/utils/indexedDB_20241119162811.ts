import { openDB, IDBPDatabase } from "idb";

interface Message {
  id: number; // Уникальный идентификатор
  content: string; // Содержание сообщения
  timestamp: number; // Временная метка
}

const DB_NAME = "messagesDB";
const STORE_NAME = "messages";
const DB_VERSION = 1;

let dbPromise: Promise<IDBPDatabase>;

export const initializeDB = async () => {
  dbPromise = openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, {
          keyPath: "id",
          autoIncrement: true,
        });
      }
    },
  });

  return dbPromise;
};

export const addMessage = async (message: Omit<Message, "id">) => {
  const db = await initializeDB();
  const tx = db.transaction(STORE_NAME, "readwrite");

  await tx.objectStore(STORE_NAME).add({
    ...message,
    timestamp: Date.now(),
  });
  await tx.done;
};

export const getAllMessages = async (): Promise<Message[]> => {
  const db = await initializeDB();

  return db.getAll(STORE_NAME);
};

export const deleteMessage = async (id: number) => {
  const db = await initializeDB();
  const tx = db.transaction(STORE_NAME, "readwrite");

  await tx.objectStore(STORE_NAME).delete(id);
  await tx.done;
};
