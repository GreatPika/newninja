import { useEffect, useState } from "react";
import { marked } from "marked";
import { Message } from "@/types/index";

export function useRenderedMessages(messages: Message[]) {
  const [renderedMessages, setRenderedMessages] = useState<Record<string, string>>({});

  useEffect(() => {
    const renderMessages = async () => {
      const rendered: Record<string, string> = {};

      for (const message of messages) {
        const key = message.timestamp.toISOString();
        rendered[key] = await marked(message.text);
      }
      setRenderedMessages(rendered);
    };

    renderMessages();
  }, [messages]);

  return renderedMessages;
} 