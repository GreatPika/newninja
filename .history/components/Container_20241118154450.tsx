/* eslint-disable no-console */
// components/chat/Container.tsx
import { useState, useCallback } from "react";

import { PromptInput } from "@/components/PromptInput";
import { MessageDisplay } from "@/components/MessageDisplay";
import {
  Message,
  ChatContainerProps,
  RunFlowParams,
  LangflowResponse,
} from "@/types/index";
import { LangflowClient } from "@/utils/langflow-client";

export function ChatContainer({ flowId, apiKey, baseURL }: ChatContainerProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);

  const handleSubmit = useCallback(
    async (text: string) => {
      setLoading(true);

      const userMessage: Message = {
        text,
        role: "user",
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, userMessage]);

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

        // Извлекаем текст сообщения из вложенной структуры
        const responseMessage =
          response?.outputs?.[0]?.outputs?.[0]?.outputs?.message?.message?.text;

        if (responseMessage) {
          const assistantMessage: Message = {
            text: responseMessage,
            role: "assistant",
            timestamp: new Date(),
          };

          setMessages((prev) => [...prev, assistantMessage]);
        }
      } catch (error) {
        console.error("Failed to get response:", error);
      } finally {
        setLoading(false);
      }
    },
    [flowId, apiKey, baseURL],
  );

  return (
    <div className="flex flex-col h-[600px] border rounded-lg">
      <MessageDisplay loading={loading} messages={messages} />
      <PromptInput disabled={loading} onSubmit={handleSubmit} />
    </div>
  );
}
