/* eslint-disable no-console */
import { Message } from "@/types/index";
import {
  addMessage as dbAddMessage,
  getAllMessages as dbGetAllMessages,
  deleteMessage as dbDeleteMessage,
  updateMessage as dbUpdateMessage,
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
    console.error("Ошибка при загрузке сообщений из IndexedDB:", error);

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
    console.error("Ошибка при сохранении сообщения:", error);
  }
}

export async function deleteMessageFromDB(id: number): Promise<void> {
  try {
    await dbDeleteMessage(id);
  } catch (error) {
    console.error("Ошибка при удалении сообщения:", error);
  }
}

export async function updateMessageRole(id: number, newRole: string): Promise<void> {
  try {
    await dbUpdateMessage(id, newRole);
  } catch (error) {
    console.error("Ошибка при обновлении роли сообщения:", error);
  }
}
