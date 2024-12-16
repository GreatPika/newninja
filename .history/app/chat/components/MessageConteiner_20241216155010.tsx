// components/MessageContainer.tsx
import {
  Spinner,
  Card,
  CardBody,
  CardHeader,
  CardFooter,
  Button,
  Input,
} from "@nextui-org/react";
import { marked } from "marked";
import "@/styles/github-markdown-custom.css";
import { useTheme } from "next-themes";
import { useEffect, useState, useCallback } from "react";
import { Copy, Trash, Pencil } from "lucide-react";
import { useRouter } from "next/navigation";
import { useSnackbar } from "notistack";

import { Message, MessageConteinerProps } from "@/types/index";
import { handleCopyTable } from "@/utils/handleCopyTable";
import { formatDate } from "@/utils/formatDate";
import { updateMessage } from "@/utils/messages";

export function MessageConteiner({
  messages,
  loading,
  onDelete,
}: MessageConteinerProps) {
  const { theme } = useTheme();
  const { enqueueSnackbar } = useSnackbar();
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

  const onCopyTableHandler = useCallback(
    (messageText: string) => {
      handleCopyTable(messageText);
      enqueueSnackbar("Таблица скопирована в буфер обмена", {
        variant: "success",
      });
    },
    [enqueueSnackbar],
  );

  const handleEdit = (message: Message) => {
    if (message.id) {
      router.push(`/edit/${message.id}`);
    }
  };

  const handleRoleChange = async (id: number, newRole: string) => {
    const updatedMessages = messages.map((msg) =>
      msg.id === id ? { ...msg, role: newRole } : msg
    );
    setRenderedMessages((prev) => ({ ...prev }));
    await updateMessage(id, newRole);
    enqueueSnackbar("Роль сообщения обновлена", { variant: "success" });
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4">
      {messages.map((message: Message) => {
        const messageKey = message.timestamp.toISOString();
        const renderedContent = renderedMessages[messageKey] || message.text;
        const hasTable = renderedContent.includes("<table");
        const isUser = message.role === "user";

        return (
          <Card
            key={message.id ?? messageKey}
            className={`${isUser ? "ml-auto" : "mr-auto"} max-w-full z-0`}
            shadow="sm"
          >
            <CardHeader className="flex justify-between items-center">
              {isUser ? (
                <span className="text-md font-semibold mt-2">Вы</span>
              ) : (
                <Input
                  initialValue={message.role}
                  clearable
                  underlined
                  onBlur={(e) => {
                    const newRole = e.target.value.trim();
                    if (newRole !== message.role && message.id) {
                      handleRoleChange(message.id, newRole);
                    }
                  }}
                  className="w-32"
                />
              )}
            </CardHeader>
            <CardBody>
              <div
                dangerouslySetInnerHTML={{
                  __html: renderedContent,
                }}
                className="markdown-body"
              />
            </CardBody>
            <CardFooter className="flex justify-between items-center">
              <div className="text-xs">{formatDate(message.timestamp)}</div>
              <div className="flex items-center">
                <Button
                  isIconOnly
                  radius="md"
                  size="sm"
                  variant="light"
                  onPress={() => handleEdit(message)}
                >
                  <Pencil size={16} />
                </Button>
                {hasTable && (
                  <Button
                    isIconOnly
                    radius="md"
                    size="sm"
                    variant="light"
                    onPress={() => onCopyTableHandler(renderedContent)}
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
                    onPress={() => onDelete(message.id)}
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
