// utils/indexedDB.ts
import { openDB, IDBPDatabase } from "idb";

import { MessageDB } from "@/types/index";

const DB_NAME = "ChatDB";
const STORE_NAME = "messages";
const DB_VERSION = 2;

let dbPromise: Promise<IDBPDatabase<MessageDB>>;

export const initializeDB = async () => {
  if (!dbPromise) {
    dbPromise = openDB<MessageDB>(DB_NAME, DB_VERSION, {
      upgrade(db, oldVersion) {
        if (oldVersion < 1) {
          const store = db.createObjectStore(STORE_NAME, {
            keyPath: "id",
            autoIncrement: true,
          });
          store.createIndex("timestamp", "timestamp");
        }
        if (oldVersion < 2) {
          const store = db.transaction.objectStore(STORE_NAME);
          store.createIndex("source", "source");
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
  updates: Partial<Omit<MessageDB, "id">>,
): Promise<void> => {
  const db = await initializeDB();
  const tx = db.transaction(STORE_NAME, "readwrite");
  const message = await tx.store.get(id);

  if (message) {
    if (updates.text !== undefined) message.text = updates.text;
    if (updates.role !== undefined) message.role = updates.role;
    if (updates.source !== undefined) message.source = updates.source;
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
