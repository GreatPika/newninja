// components/MessageContainer.tsx

import {
  Spinner,
  Card,
  CardBody,
  CardHeader,
  CardFooter,
  Input,
  Button,
} from "@nextui-org/react";
import "@/styles/github-markdown-custom.css";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { PencilIcon } from "lucide-react";

import { useThemeManager } from "../hooks/useThemeManager";
import { useRenderedMessages } from "../hooks/useRenderedMessages";
import { useRoleManager } from "../hooks/useRoleManager";
import { useCopyTable } from "../hooks/useCopyTable";

import { MessageActions } from "./MessageActions";

import { formatDate } from "@/utils/formatDate";
import { Message, MessageConteinerProps } from "@/types/index";

export function MessageConteiner({
  messages,
  loading,
  onDelete,
}: MessageConteinerProps) {
  useThemeManager();
  const renderedMessages = useRenderedMessages(messages);
  const {
    editingRoles,
    handleRoleChange,
    handleRoleBlur: onRoleBlur,
  } = useRoleManager(messages);
  const onCopyTableHandler = useCopyTable();
  const router = useRouter();
  const [editingMessageId, setEditingMessageId] = useState<number | null>(null);

  const handleEdit = (message: Message) => {
    if (message.id) {
      router.push(`/edit/${message.id}`);
    }
  };

  const handleEditClick = (messageId: number) => {
    setEditingMessageId(messageId);
  };

  const handleRoleBlur = (messageId: number) => {
    setEditingMessageId(null);
    onRoleBlur(messageId);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;

      if (!target.closest("input") && editingMessageId !== null) {
        handleRoleBlur(editingMessageId);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [editingMessageId]);

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
            <CardHeader className="w-full">
              <span className="text-lg font-semibold mt-2 w-full">
                {message.role === "user" ? (
                  "Вы"
                ) : message.id !== undefined ? (
                  <div className="flex items-center gap-2">
                    {editingMessageId === message.id ? (
                      <Input
                        isRequired
                        placeholder="Название продукта"
                        radius="sm"
                        size="lg"
                        value={editingRoles[message.id] ?? message.role}
                        variant="bordered"
                        onBlur={() => handleRoleBlur(message.id as number)}
                        onChange={(e) =>
                          handleRoleChange(message.id as number, e.target.value)
                        }
                      />
                    ) : (
                      <>
                        <span>{editingRoles[message.id] ?? message.role}</span>
                        <Button
                          isIconOnly
                          className="self-start"
                          radius="md"
                          size="sm"
                          variant="light"
                          onPress={() => handleEditClick(message.id as number)}
                        >
                          <PencilIcon size={16} />
                        </Button>
                      </>
                    )}
                  </div>
                ) : null}
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
              <MessageActions
                hasTable={hasTable}
                message={message}
                renderedContent={renderedContent}
                onCopyTable={onCopyTableHandler}
                onDelete={onDelete}
                onEdit={handleEdit}
              />
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
