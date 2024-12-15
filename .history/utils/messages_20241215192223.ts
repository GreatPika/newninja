/* eslint-disable no-console */
import { Message } from "@/types/index";
import {
  addMessage as dbAddMessage,
  getAllMessages as dbGetAllMessages,
  deleteMessage as dbDeleteMessage,
  updateMessageRole as dbUpdateMessageRole,
} from "@/utils/indexedDB";

export async function loadMessagesFromDB(): Promise<Message[]> {
  try {
    const storedMessages = await dbGetAllMessages();

    return storedMessages.map((msg) => ({
      id: msg.id,
      text: msg.text,
      role: msg.role,
      timestamp: new Date(msg.timestamp),
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

export async function updateMessageRole(id: number, role: string): Promise<void> {
  try {
    await dbUpdateMessageRole(id, role);
  } catch (error) {
    console.error("Error updating message role:", error);
    throw error;
  }
}
