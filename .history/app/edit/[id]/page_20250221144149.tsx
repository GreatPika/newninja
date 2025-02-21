/* eslint-disable no-console */
"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { useParams } from "next/navigation";
import { PanelGroup, Panel, PanelResizeHandle } from "react-resizable-panels";

import { updateMessage, getMessageById } from "@/utils/indexedDB";

const Editor = dynamic(() => import("@/app/edit/components/EditorComponent"), {
  ssr: false,
  loading: () => <div className="text-default-500">Загрузка редактора...</div>,
});

export default function EditPage() {
  const [markdown, setMarkdown] = useState("");
  const [sourceContent, setSourceContent] = useState("");
  const [rawSource, setRawSource] = useState<any>(null);
  const [isEditorReady, setIsEditorReady] = useState(false);
  const params = useParams();
  const messageId =
    typeof params.id === "string" ? parseInt(params.id, 10) : null;

  const convertSourceFullToText = (sourceObj: any) => {
    return Object.keys(sourceObj)
      .sort((a, b) => parseInt(a) - parseInt(b))
      .map((key) => `${key}: ${sourceObj[key]}`)
      .join("\n\n");
  };

  const convertSourceKeyToText = (sourceObj: any, key: string) => {
    return sourceObj[key] ? `${key}: ${sourceObj[key]}` : "н/д";
  };

  useEffect(() => {
    const fetchContent = async () => {
      if (!messageId) return;

      try {
        const message = await getMessageById(messageId);

        if (message) {
          setMarkdown(message.text);
          if (message.source) {
            const sourceObj =
              typeof message.source === "string" ? JSON.parse(message.source) : message.source;
            setRawSource(sourceObj);
            // Изначально отображаем весь source
            setSourceContent(convertSourceFullToText(sourceObj));
          }
          setIsEditorReady(true);
        }
      } catch (error) {
        console.error("Ошибка при загрузке сообщения:", error);
      }
    };

    fetchContent();
  }, [messageId]);

  // Обработчик изменения значения 5-й колонки.
  const handleColumn4ValueChange = (value: string) => {
    // Убираем пробелы и приводим значение к числу, затем обратно в строку для соответствия ключу.
    const key = String(Number(value.trim()));
    if (rawSource) {
      setSourceContent(convertSourceKeyToText(rawSource, key));
    }
  };

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
              onColumn4ValueChange={handleColumn4ValueChange}
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
              markdown={sourceContent}
              showToolbar={false}
              onContentChange={() => {}}
            />
          </div>
        </Panel>
      </PanelGroup>
    </div>
  );
}