/* eslint-disable no-console */
import { Message } from "@/types/index";
import { LangflowClient } from "@/utils/langflow-client";
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

export async function getAssistantResponse(
  text: string,
  flowId: string,
  baseURL: string | undefined,
  apiKey: string,
): Promise<Message | null> {
  try {
    const client = new LangflowClient(baseURL || "", apiKey);
    const params = {
      flowId,
      inputValue: text,
      inputType: "chat",
      outputType: "chat",
      tweaks: {},
    };

    const response = await client.runFlow(params);

    console.log("LangflowResponse:", JSON.stringify(response, null, 2));

    const responseMessage =
      response.outputs?.[0]?.outputs?.[0]?.results?.message?.text;

    if (responseMessage) {
      return {
        text: responseMessage,
        role: "assistant",
        timestamp: new Date(),
      };
    }

    console.warn("Не удалось извлечь сообщение от ассистента из ответа.");

    return null;
  } catch (error) {
    console.error("Ошибка при получении ответа от Langflow:", error);

    return null;
  }
}
