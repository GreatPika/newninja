/* eslint-disable no-console */
import { Message, MessageDB } from "@/types/index";
import {
  addMessage as dbAddMessage,
  getAllMessages as dbGetAllMessages,
  deleteMessage as dbDeleteMessage,
} from "@/utils/indexedDB";
import { updateMessage as dbUpdateMessage } from "@/utils/indexedDB";
export async function loadMessagesFromDB(): Promise<Message[]> {
  try {
    const storedMessages = await dbGetAllMessages();

    return storedMessages.map((msg) => ({
      id: msg.id,
      text: msg.text,
      role: msg.role,
      timestamp: new Date(msg.timestamp),
      source: msg.source,
    }));
  } catch (error) {
    console.error("Error loading messages from IndexedDB:", error);

    return [];
  }
}

export async function saveMessageToDB(
  message: Omit<Message, "id">,
): Promise<number | undefined> {
  try {
    return await dbAddMessage({
      text: message.text,
      role: message.role,
      timestamp: message.timestamp.toISOString(),
      source: message.source,
    });
  } catch (error) {
    console.error("Error saving message:", error);
  }
}

export async function deleteMessageFromDB(id: number): Promise<void> {
  try {
    await dbDeleteMessage(id);
  } catch (error) {
    console.error("Error deleting message:", error);
  }
}

export async function updateMessageInDB(
  id: number,
  updates: Partial<Omit<Message, "id">>,
): Promise<void> {
  // Преобразуем объект updates в формат подходящий для MessageDB
  const dbUpdates: Partial<Omit<MessageDB, "id">> = {};

  if (updates.text !== undefined) {
    dbUpdates.text = updates.text;
  }

  if (updates.role !== undefined) {
    dbUpdates.role = updates.role;
  }

  if (updates.timestamp !== undefined) {
    // Здесь явно преобразуем Date в строку
    dbUpdates.timestamp = updates.timestamp.toISOString();
  }

  if (updates.source !== undefined) {
    dbUpdates.source = updates.source;
  }

  await dbUpdateMessage(id, dbUpdates);
}
