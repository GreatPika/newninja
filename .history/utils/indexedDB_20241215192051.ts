// utils/indexedDB.ts
import { openDB, IDBPDatabase } from "idb";

import { MessageDB } from "@/types/index";

const DB_NAME = "ChatDB";
const STORE_NAME = "messages";
const DB_VERSION = 1;

let dbPromise: Promise<IDBPDatabase<MessageDB>>;

export const initializeDB = async () => {
  if (!dbPromise) {
    dbPromise = openDB<MessageDB>(DB_NAME, DB_VERSION, {
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

export const addMessage = async (
  message: Omit<MessageDB, "id">,
): Promise<number> => {
  const db = await initializeDB();
  const tx = db.transaction(STORE_NAME, "readwrite");
  const id = await tx.store.add(message);

  await tx.done;

  return id as number; // Приведение к типу number
};

export const getAllMessages = async (): Promise<MessageDB[]> => {
  const db = await initializeDB();

  return db.getAllFromIndex(STORE_NAME, "timestamp");
};

export const deleteMessage = async (id: number): Promise<void> => {
  const db = await initializeDB();
  const tx = db.transaction(STORE_NAME, "readwrite");

  await tx.store.delete(id);
  await tx.done;
};

export const updateMessage = async (
  id: number,
  content: string,
): Promise<void> => {
  const db = await initializeDB();
  const tx = db.transaction(STORE_NAME, "readwrite");
  const message = await tx.store.get(id);

  if (message) {
    message.text = content;
    await tx.store.put(message);
  }

  await tx.done;
};

export const getMessageById = async (id: number) => {
  const db = await initializeDB();
  const tx = db.transaction(STORE_NAME, "readonly");
  const message = await tx.store.get(id);

  await tx.done;

  return message;
};

export const updateMessageRole = async (
  id: number,
  role: string
): Promise<void> => {
  const db = await initializeDB();
  const tx = db.transaction(STORE_NAME, "readwrite");
  const message = await tx.store.get(id);

  if (message) {
    message.role = role;
    await tx.store.put(message);
  }

  await tx.done;
};
