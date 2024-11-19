/* eslint-disable no-console */
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
    <div className="flex flex-col h-screen">
      {/* Сообщения */}
      <div className="w-[800px] mx-auto flex-1 overflow-y-auto">
        <MessageDisplay loading={loading} messages={messages} />
      </div>

      {/* Фиксированный промпт внизу */}
      <div className="sticky bottom-0 left-0 right-0 bg-background/80 backdrop-blur-sm">
        <div className="w-[800px] mx-auto">
          <PromptInput disabled={loading} onSubmit={handleSubmit} />
        </div>
      </div>
    </div>
  );
}