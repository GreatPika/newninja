// components/ChatContainer.tsx
/* eslint-disable no-console */
import { useState, useCallback, useEffect } from "react";

import { PromptInput } from "@/components/PromptInput";
import { MessageConteiner } from "@/components/MessageConteiner";
import {
  Message,
  ChatContainerProps,
  RunFlowParams,
  LangflowResponse,
} from "@/types/index";
import { LangflowClient } from "@/utils/langflow-client";
import { addMessage as dbAddMessage, getAllMessages as dbGetAllMessages, deleteMessage as dbDeleteMessage, MessageDB } from "@/utils/indexedDB";

export function ChatContainer({ flowId, apiKey, baseURL }: ChatContainerProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);

  // Загрузка сообщений из IndexedDB при монтировании
  useEffect(() => {
    const loadMessages = async () => {
      if (typeof window !== 'undefined') { // Проверка на клиентскую сторону
        try {
          const storedMessages = await dbGetAllMessages();
          // Преобразуем сообщения из базы данных в формат, используемый в состоянии
          const formattedMessages: Message[] = storedMessages.map((msg) => ({
            id: msg.id,
            text: msg.text,
            role: msg.role,
            timestamp: new Date(msg.timestamp),
          }));
          setMessages(formattedMessages);
        } catch (error) {
          console.error("Ошибка при загрузке сообщений из IndexedDB:", error);
        }
      }
    };

    loadMessages();
  }, []);

  const handleSubmit = useCallback(
    async (text: string) => {
      setLoading(true);
      const userMessage: Message = {
        text,
        role: "user",
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, userMessage]);

      // Сохранение пользовательского сообщения в IndexedDB
      try {
        const id = await dbAddMessage({
          text: userMessage.text,
          role: userMessage.role,
          timestamp: userMessage.timestamp.toISOString(),
        });
        // Добавляем ID, полученный из IndexedDB, в состояние
        setMessages((prev) =>
          prev.map((msg, idx) =>
            idx === prev.length - 1 ? { ...msg, id } : msg
          )
        );
      } catch (error) {
        console.error("Ошибка при сохранении сообщения пользователя:", error);
      }

      try {
        const client = new LangflowClient(baseURL || "", apiKey);
        const params: RunFlowParams = {
          flowId,
          inputValue: text,
          inputType: "chat",
          outputType: "chat",
          tweaks: {},
        };

        const response: LangflowResponse = await client.runFlow(params);
        
        // Логирование ответа для отладки
        console.log("LangflowResponse:", JSON.stringify(response, null, 2));

        // Корректный путь к сообщению ассистента
        const responseMessage =
          response?.outputs?.[0]?.outputs?.[0]?.message?.message?.text;

        if (responseMessage) {
          const assistantMessage: Message = {
            text: responseMessage,
            role: "assistant",
            timestamp: new Date(),
          };

          setMessages((prev) => [...prev, assistantMessage]);

          // Сохранение сообщения ассистента в IndexedDB
          try {
            const id = await dbAddMessage({
              text: assistantMessage.text,
              role: assistantMessage.role,
              timestamp: assistantMessage.timestamp.toISOString(),
            });
            // Добавляем ID, полученный из IndexedDB, в состояние
            setMessages((prev) =>
              prev.map((msg, idx) =>
                idx === prev.length - 1 ? { ...msg, id } : msg
              )
            );
          } catch (error) {
            console.error("Ошибка при сохранении сообщения ассистента:", error);
          }
        } else {
          console.warn("Не удалось извлечь сообщение от ассистента из ответа.");
        }
      } catch (error) {
        console.error("Failed to get response:", error);
      } finally {
        setLoading(false);
      }
    },
    [flowId, apiKey, baseURL],
  );

  // Функция удаления сообщения
  const handleDeleteMessage = useCallback(
    async (id?: number) => {
      if (id === undefined) return;
      try {
        await dbDeleteMessage(id);
        // Обновляем состояние, удаляя сообщение с заданным ID
        setMessages((prev) => prev.filter((msg) => msg.id !== id));
      } catch (error) {
        console.error("Ошибка при удалении сообщения:", error);
      }
    },
    [],
  );

  return (
    <div className="flex flex-col min-h-screen relative">
      {/* Сообщения */}
      <div className="w-[800px] mx-auto flex flex-col bg-background flex-grow pb-20">
        <MessageConteiner loading={loading} messages={messages} onDelete={handleDeleteMessage} />
      </div>

      {/* Фиксированный промпт внизу */}
      <div className="fixed bottom-0 left-0 right-0 bg-background/80 backdrop-blur-sm">
        <div className="w-[800px] mx-auto">
          <PromptInput disabled={loading} onSubmit={handleSubmit} />
        </div>
      </div>
    </div>
  );
}
