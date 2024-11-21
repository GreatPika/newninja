// components/MessageContainer.tsx
import { Spinner, Card, CardBody, Button, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter } from "@nextui-org/react";
import { marked } from "marked";
import "@/styles/github-markdown-custom.css";
import { useTheme } from "next-themes";
import { useEffect, useState, useCallback, useRef } from "react";
import { Copy, Trash, Pencil } from "lucide-react";
import { useRouter } from "next/navigation";
import Editor from "./EditorComponent";
import { MDXEditorMethods } from "@mdxeditor/editor";

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
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMessage, setEditingMessage] = useState<Message | null>(null);
  const editorRef = useRef<MDXEditorMethods | null>(null);

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
    setEditingMessage(message);
    setIsModalOpen(true);
  };

  const handleSave = () => {
    // Здесь добавьте логику сохранения изменений
    setIsModalOpen(false);
    setEditingMessage(null);
  };

  return (
    <>
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message: Message) => {
          const messageKey = message.timestamp.toISOString();
          const renderedContent = renderedMessages[messageKey] || message.text;

          // Проверяем наличие таблицы в отрендеренном HTML
          const hasTable = renderedContent.includes("<table");

          return (
            <Card
              key={message.id ?? messageKey}
              className={`${message.role === "user" ? "ml-auto" : "mr-auto"} max-w-full`}
              shadow="sm"
            >
              <CardBody>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="text-sm font-semibold">
                    {message.role === "user" ? "Вы" : "TenderNinja"}
                  </span>
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
                </div>
                <div
                  dangerouslySetInnerHTML={{
                    __html: renderedContent,
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

      <Modal 
        isOpen={isModalOpen} 
        onOpenChange={(open) => setIsModalOpen(open)}
        size="3xl"
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader>Редактировать сообщение</ModalHeader>
              <ModalBody>
                {editingMessage && (
                  <Editor
                    markdown={editingMessage.text}
                    editorRef={editorRef}
                  />
                )}
              </ModalBody>
              <ModalFooter>
                <Button variant="light" onPress={onClose}>
                  Отмена
                </Button>
                <Button color="primary" onPress={handleSave}>
                  Сохранить
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  );
}
