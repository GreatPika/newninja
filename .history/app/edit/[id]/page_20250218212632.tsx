/* eslint-disable no-console */
"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { useParams } from "next/navigation";
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";
import { updateMessage, getMessageById } from "@/utils/indexedDB";

const Editor = dynamic(() => import("@/components/EditorComponent"), {
  ssr: false,
  loading: () => <div className="text-default-500">Загрузка редактора...</div>,
});

export default function EditPage() {
  const [markdown, setMarkdown] = useState("");
  const [isEditorReady, setIsEditorReady] = useState(false);
  const params = useParams();
  const messageId =
    typeof params.id === "string" ? parseInt(params.id, 10) : null;

  useEffect(() => {
    const fetchContent = async () => {
      if (!messageId) return;

      try {
        const message = await getMessageById(messageId);

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
    <div style={{ height: "100vh" }}>
      <PanelGroup direction="vertical">
        <Panel defaultSize={50} maxSize={90} minSize={10}>
          <Editor
            key={`table-${markdown}`}
            markdown={markdown}
            onContentChange={handleContentChange}
          />
        </Panel>
        <PanelResizeHandle
          style={{
            height: "8px",
            backgroundColor: "var(--nextui-colors-border)",
            cursor: "row-resize",
          }}
        />
        <Panel defaultSize={50} maxSize={90} minSize={10}>
          <Editor
            key={`user-${markdown}`}
            markdown={markdown}
            onContentChange={handleContentChange}
          />
        </Panel>
      </PanelGroup>
    </div>
  );
}
