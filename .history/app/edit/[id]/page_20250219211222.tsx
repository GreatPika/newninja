/* eslint-disable no-console */
"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { useParams } from "next/navigation";
import { PanelGroup, Panel, PanelResizeHandle } from "react-resizable-panels";

import {
  updateMessage,
  getMessageById,
  getAllMessages,
} from "@/utils/indexedDB";

const Editor = dynamic(() => import("@/app/edit/components/EditorComponent"), {
  ssr: false,
  loading: () => <div className="text-default-500">Загрузка редактора...</div>,
});

export default function EditPage() {
  const [markdown, setMarkdown] = useState("");
  const [previousUserMessage, setPreviousUserMessage] = useState("");
  const [isEditorReady, setIsEditorReady] = useState(false);
  const params = useParams();
  const messageId =
    typeof params.id === "string" ? parseInt(params.id, 10) : null;

  useEffect(() => {
    const fetchContent = async () => {
      if (!messageId) return;

      try {
        // Получаем текущее сообщение
        const message = await getMessageById(messageId);

        // Получаем все сообщения
        const allMessages = await getAllMessages();

        // Находим индекс текущего сообщения
        const currentIndex = allMessages.findIndex(
          (msg) => msg.id === messageId,
        );

        // Ищем предыдущее сообщение с ролью user
        for (let i = currentIndex - 1; i >= 0; i--) {
          if (allMessages[i].role === "user") {
            setPreviousUserMessage(allMessages[i].text);
            break;
          }
        }

        if (message) {
          setMarkdown(message.text);
          setIsEditorReady(true);
        }
      } catch (error) {
        console.error("Ошибка при загрузке сообщения:", error);
      }
    };

    fetchContent();
  }, [messageId]);

  const handleContentChange = async (content: string) => {
    if (messageId) {
      try {
        await updateMessage(messageId, { text: content });
        console.log("Изменения сохранены");
      } catch (error) {
        console.error("Ошибка при сохранении изменений:", error);
      }
    }
  };

  if (!isEditorReady) {
    return <div className="text-default-500">Загрузка...</div>;
  }

  return (
    <div style={{ height: "100vh", overflow: "hidden" }}>
      <PanelGroup direction="vertical">
        <Panel
          defaultSize={70}
          maxSize={90}
          minSize={10}
          style={{ overflow: "auto" }}
        >
          <div style={{ height: "100%" }}>
            <Editor
              key={markdown}
              markdown={markdown}
              onContentChange={handleContentChange}
            />
          </div>
        </Panel>
        <PanelResizeHandle className="resize-handle" />
        <Panel
          defaultSize={30}
          maxSize={90}
          minSize={10}
          style={{ overflow: "auto" }}
        >
          <div style={{ height: "100%" }}>
            <Editor
              markdown={previousUserMessage}
              showToolbar={false}
              onContentChange={() => {}}
            />
          </div>
        </Panel>
      </PanelGroup>
    </div>
  );
}
