import { useState, useCallback, useEffect } from "react";
import { useSnackbar } from "notistack";
import { Card, CardBody } from "@nextui-org/react";

import { PromptInput } from "@/app/chat/components/PromptInput";
import { MessageConteiner } from "@/app/chat/components/MessageConteiner";
import { Message } from "@/types/index";
import {
  loadMessagesFromDB,
  saveMessageToDB,
  deleteMessageFromDB,
} from "@/utils/messages";
import { getAssistantResponse } from "@/app/chat/utils/getAssistantResponse";

interface ChatContainerProps {
  baseURL: string;
  emptyStateMessage?: string;
}

export function ChatContainer({
  baseURL,
  emptyStateMessage,
}: ChatContainerProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const { enqueueSnackbar } = useSnackbar();

  useEffect(() => {
    const loadMessages = async () => {
      const storedMessages = await loadMessagesFromDB();

      setMessages(storedMessages);
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
      const messageId = await saveMessageToDB(userMessage);

      setMessages((prev) =>
        prev.map((msg, idx) =>
          idx === prev.length - 1 ? { ...msg, id: messageId } : msg,
        ),
      );

      const assistantMessage = await getAssistantResponse(
        text,
        baseURL,
        enqueueSnackbar,
      );

      if (assistantMessage) {
        setMessages((prev) => [...prev, assistantMessage]);
        const assistantMessageId = await saveMessageToDB(assistantMessage);

        setMessages((prev) =>
          prev.map((msg, idx) =>
            idx === prev.length - 1 ? { ...msg, id: assistantMessageId } : msg,
          ),
        );
      }

      setLoading(false);
    },
    [baseURL, enqueueSnackbar],
  );

  const handleDeleteMessage = useCallback(async (id?: number) => {
    if (id === undefined) return;
    await deleteMessageFromDB(id);
    setMessages((prev) => prev.filter((msg) => msg.id !== id));
  }, []);

  return (
    <div className="flex flex-col min-h-screen relative">
      <div className="w-[800px] mx-auto flex flex-col bg-background flex-grow pb-20">
        {messages.length === 0 && emptyStateMessage ? (
          <div className="flex items-center justify-center flex-grow">
            <Card radius="lg">
              <CardBody>
                <p className="text-left text-foreground/80 whitespace-pre-line">
                  {emptyStateMessage}
                </p>
              </CardBody>
            </Card>
          </div>
        ) : (
          <MessageConteiner
            loading={loading}
            messages={messages}
            onDelete={handleDeleteMessage}
          />
        )}
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-background/80 backdrop-blur-sm">
        <div className="w-[800px] mx-auto">
          <PromptInput disabled={loading} onSubmit={handleSubmit} />
        </div>
      </div>
    </div>
  );
}
