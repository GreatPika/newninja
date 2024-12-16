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
import "@/styles/github-markdown-custom.css";
import { useRouter } from "next/navigation";
import { Pencil, Copy, Trash } from "lucide-react";

import { useThemeManager } from "../hooks/useThemeManager";
import { useRenderedMessages } from "../hooks/useRenderedMessages";
import { useRoleManager } from "../hooks/useRoleManager";
import { useCopyTable } from "../hooks/useCopyTable";

import { formatDate } from "@/utils/formatDate";
import { Message, MessageConteinerProps } from "@/types/index";

export function MessageConteiner({
  messages,
  loading,
  onDelete,
}: MessageConteinerProps) {
  useThemeManager();
  const renderedMessages = useRenderedMessages(messages);
  const { editingRoles, handleRoleChange, handleRoleBlur } =
    useRoleManager(messages);
  const onCopyTableHandler = useCopyTable();
  const router = useRouter();

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
            className={`${
              message.role === "user" ? "ml-auto" : "mr-auto"
            } max-w-full`}
            shadow="sm"
          >
            <CardHeader className="flex justify-between items-center">
              <span className="text-md font-semibold mt-2">
                {message.role === "user"
                  ? "Вы"
                  : message.id !== undefined && (
                      <Input
                        placeholder="Роль"
                        size="sm"
                        value={editingRoles[message.id] ?? message.role}
                        width="150px"
                        onBlur={() => handleRoleBlur(message.id as number)}
                        onChange={(e) =>
                          handleRoleChange(message.id as number, e.target.value)
                        }
                      />
                    )}
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
