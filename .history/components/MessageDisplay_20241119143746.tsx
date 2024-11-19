import { Spinner, Card, CardBody } from "@nextui-org/react";
import { marked } from "marked";
import "@/github-markdown-custom.css";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

import { MessageDisplayProps } from "@/types/index";

export function MessageDisplay({ messages, loading }: MessageDisplayProps) {
  const { theme } = useTheme();
  // Specify the type as an object with string keys and string values
  const [renderedMessages, setRenderedMessages] = useState<
    Record<string, string>
  >({});

  useEffect(() => {
    if (theme) {
      document.body.setAttribute("data-theme", theme);
    }
  }, [theme]);

  useEffect(() => {
    const renderMessages = async () => {
      const rendered: Record<string, string> = {};

      for (const message of messages) {
        // Ensure we're using the timestamp string as the key
        const key =
          typeof message.timestamp === "string"
            ? message.timestamp
            : message.timestamp.toISOString();

        rendered[key] = await marked(message.text);
      }
      setRenderedMessages(rendered);
    };

    renderMessages();
  }, [messages]);

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4">
      {messages.map((message, index) => {
        // Get the key in the same way
        const messageKey =
          typeof message.timestamp === "string"
            ? message.timestamp
            : message.timestamp.toISOString();

        return (
          <Card
            key={index}
            className={`${
              message.role === "user" ? "ml-auto" : "mr-auto"
            } max-w-[80%]`}
            shadow="sm"
          >
            <CardBody>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-sm font-semibold">
                  {message.role === "user" ? "Вы" : "TenderNinja"}
                </span>
              </div>
              <div
                dangerouslySetInnerHTML={{
                  __html: renderedMessages[messageKey] || message.text,
                }}
                className="markdown-body"
              />
              <div className="text-xs text-gray-500 mt-2">
                {new Date(message.timestamp).toLocaleTimeString()}
              </div>
            </CardBody>
          </Card>
        );
      })}
      {loading && (
        <Card className="mr-auto max-w-[80%]">
          <CardBody className="flex items-center gap-2">
            <Spinner size="sm" />
            <span>Thinking...</span>
          </CardBody>
        </Card>
      )}
      {/* Add empty space at the bottom for scrolling */}
      <div className="h-16" />
    </div>
  );
}
