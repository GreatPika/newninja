import { Message, ApiResponse } from "@/types/index";
import {
  addMessage as dbAddMessage,
  getAllMessages as dbGetAllMessages,
  deleteMessage as dbDeleteMessage,
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

export async function getAssistantResponse(
  text: string,
  baseURL: string,
): Promise<Message | null> {
  try {
    const response = await fetch(baseURL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ text }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data: ApiResponse = await response.json();

    if (data.analysis) {
      return {
        text: data.analysis,
        role: "assistant",
        timestamp: new Date(),
      };
    }

    console.warn("No analysis in response");
    return null;
  } catch (error) {
    console.error("Error getting response:", error);
    return null;
  }
}