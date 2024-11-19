import { Card, CardBody, Avatar, Spinner } from "@nextui-org/react";
import { marked } from "marked";
import "@/github-markdown-custom.css"; // Подключаем стили GitHub Markdown
import { useTheme } from "next-themes"; // Подключаем для поддержки тем
import { useEffect } from "react";

import { MessageDisplayProps } from "@/types/index";

export function MessageDisplay({ messages, loading }: MessageDisplayProps) {
  const { theme } = useTheme(); // Получение текущей темы

  useEffect(() => {
    if (theme) {
      document.body.setAttribute("data-theme", theme);
    }
  }, [theme]);

  return (
    <div className="flex-1 overflow-auto p-4 space-y-4">
      {messages.map((message, index) => {
        const renderedContent = marked(message.text); // Конвертируем Markdown в HTML

        return (
          <Card
            key={index}
            className={`${
              message.role === "user" ? "ml-auto" : "mr-auto"
            } max-w-[80%]`}
          >
            <CardBody className="p-3">
              <div className="flex items-center gap-2 mb-2">
                <Avatar
                  fallback={message.role === "user" ? "U" : "A"}
                  size="sm"
                  src={
                    message.role === "user"
                      ? "/user-avatar.png"
                      : "/assistant-avatar.png"
                  }
                />
                <span className="text-sm font-semibold">
                  {message.role === "user" ? "You" : "Assistant"}
                </span>
              </div>
              {/* Используем dangerouslySetInnerHTML для рендера HTML */}
              <div
                dangerouslySetInnerHTML={{ __html: renderedContent }}
                className="markdown-body"
                style={{ maxWidth: "774px" }}
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
          <CardBody className="p-3 flex items-center gap-2">
            <Spinner size="sm" />
            <span>Thinking...</span>
          </CardBody>
        </Card>
      )}
    </div>
  );
}
