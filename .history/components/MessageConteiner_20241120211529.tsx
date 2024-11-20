import { Spinner, Card, CardBody, Button } from "@nextui-org/react";
import { marked } from "marked";
import "@/github-markdown-custom.css";
import { useTheme } from "next-themes";
import { useEffect, useState, useCallback } from "react";
import { Copy, Trash, Edit } from "lucide-react";

import { Message, MessageConteinerProps } from "@/types/index";
import { handleCopyTable } from "@/utils/handleCopyTable";

const TABLE_REGEX = /\|.*\|.*\n\|[-|\s]*\|[-|\s]*\|\n(\|.*\|.*\n)+/g;

export function MessageConteiner({
  messages,
  loading,
  onDelete,
}: MessageConteinerProps) {
  const { theme } = useTheme();
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

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4">
      {messages.map((message: Message) => {
        const messageKey = message.timestamp.toISOString();
        const hasTable = TABLE_REGEX.test(message.text);

        TABLE_REGEX.lastIndex = 0;

        return (
          <Card
            key={message.id ?? messageKey}
            className={`${
              message.role === "user" ? "ml-auto" : "mr-auto"
            } max-w-full`}
            shadow="sm"
          >
            <CardBody>
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className="text-sm font-semibold">
                  {message.role === "user" ? "Вы" : "TenderNinja"}
                </span>
                <div className="flex items-center">
                  {hasTable && (
                    <>
                      <Button
                        isIconOnly
                        radius="md"
                        size="sm"
                        variant="light"
                        onClick={() => onCopyTableHandler(message.text)}
                      >
                        <Copy size={16} />
                      </Button>
                      <Button isIconOnly radius="md" size="sm" variant="light">
                        <Edit size={16} />
                      </Button>
                    </>
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
              </div>
              <div
                dangerouslySetInnerHTML={{
                  __html: renderedMessages[messageKey] || message.text,
                }}
                className="markdown-body"
              />
              <div className="text-xs text-gray-500 mt-2">
                {message.timestamp.toLocaleTimeString()}
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
      <div className="h-16" />
    </div>
  );
}
