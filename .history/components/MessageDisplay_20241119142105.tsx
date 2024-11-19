import { Avatar, Spinner } from "@nextui-org/react";
import { marked } from "marked";
import "@/github-markdown-custom.css";
import { useTheme } from "next-themes";
import { useEffect } from "react";

import { MessageDisplayProps } from "@/types/index";

export function MessageDisplay({ messages, loading }: MessageDisplayProps) {
  const { theme } = useTheme();

  useEffect(() => {
    if (theme) {
      document.body.setAttribute("data-theme", theme);
    }
  }, [theme]);

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4">
      {messages.map((message, index) => {
        const renderedContent = marked(message.text);

        return (
          <div
            key={index}
            className={`${
              message.role === "user" ? "ml-auto" : "mr-auto"
            } max-w-[80%] bg-content1 rounded-lg p-3`}
          >
            <div className="flex items-center gap-2 mb-2">
              <span className="text-sm font-semibold">
                {message.role === "user" ? "Вы" : "TenderNinja"}
              </span>
            </div>
            <div
              dangerouslySetInnerHTML={{ __html: renderedContent }}
              className="markdown-body"
            />
            <div className="text-xs text-gray-500 mt-2">
              {new Date(message.timestamp).toLocaleTimeString()}
            </div>
          </div>
        );
      })}
      {loading && (
        <div className="mr-auto max-w-[80%] bg-content1 rounded-lg p-3 flex items-center gap-2">
          <Spinner size="sm" />
          <span>Thinking...</span>
        </div>
      )}
      {/* Добавляем пустое пространство внизу для прокрутки */}
      <div className="h-16" />
    </div>
  );
}