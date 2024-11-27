// components/MessageContainer.tsx
import { Spinner, Card, CardBody, CardHeader, CardFooter, Button } from "@nextui-org/react";
import { marked } from "marked";
import "@/styles/github-markdown-custom.css";
import { useTheme } from "next-themes";
import { useEffect, useState, useCallback } from "react";
import { Copy, Trash, Pencil } from "lucide-react";
import { useRouter } from "next/navigation";

import { Message, MessageConteinerProps } from "@/types/index";
import { handleCopyTable } from "@/utils/handleCopyTable";

export function MessageConteiner({
  messages,
  loading,
  onDelete,
}: MessageConteinerProps) {
  const { theme } = useTheme();
  const [renderedMessages, setRenderedMessages] = useState<
    Record<string, string>
  >({});
  const router = useRouter();

  useEffect(() => {
    if (theme) {
      document.body.setAttribute("data-theme", theme);
    }
  }, [theme]);

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

  const onCopyTableHandler = useCallback((messageText: string) => {
    handleCopyTable(messageText);
  }, []);

  const handleEdit = (message: Message) => {
    if (message.id) {
      router.push(`/edit/${message.id}`);
    }
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4">
      {messages.map((message: Message) => {
        const messageKey = message.timestamp.toISOString();
        const renderedContent = renderedMessages[messageKey] || message.text;
        const hasTable = renderedContent.includes("<table");

        return (
          <Card
            key={message.id ?? messageKey}
            className={`${message.role === "user" ? "ml-auto" : "mr-auto"} max-w-full`}
            shadow="sm"
          >
            <CardHeader className="flex justify-between items-center">
              <span className="text-md font-semibold mt-2">
                {message.role === "user" ? "Вы" : message.role}
              </span>
            </CardHeader>
            <CardBody>
              <div
                dangerouslySetInnerHTML={{
                  __html: renderedContent,
                }}
                className="markdown-body"
              />
            </CardBody>
            <CardFooter className="py-2 flex justify-between items-center">
              <div className="text-xs">
                {message.timestamp.toLocaleTimeString()}
              </div>
              <div className="flex items-center">
                <Button
                  isIconOnly
                  radius="md"
                  size="sm"
                  variant="light"
                  onClick={() => handleEdit(message)}
                >
                  <Pencil size={16} />
                </Button>
                {hasTable && (
                  <Button
                    isIconOnly
                    radius="md"
                    size="sm"
                    variant="light"
                    onClick={() => onCopyTableHandler(renderedContent)}
                  >
                    <Copy size={16} />
                  </Button>
                )}
                {message.id !== undefined && (
                  <Button
                    isIconOnly
                    radius="md"
                    size="sm"
                    variant="light"
                    onClick={() => onDelete(message.id)}
                  >
                    <Trash size={16} />
                  </Button>
                )}
              </div>
            </CardFooter>
          </Card>
        );
      })}
      {loading && (
        <div>
          <Spinner size="md" />
        </div>
      )}
      <div className="h-16" />
    </div>
  );
}
