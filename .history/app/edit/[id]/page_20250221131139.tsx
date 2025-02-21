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
  const [isEditorReady, setIsEditorReady] = useState(false);
  const params = useParams();
  const messageId =
    typeof params.id === "string" ? parseInt(params.id, 10) : null;
  const [activeSentenceNumber, setActiveSentenceNumber] = useState<number>();

  useEffect(() => {
    const fetchContent = async () => {
      if (!messageId) return;

      try {
        const message = await getMessageById(messageId);

        if (message) {
          setMarkdown(message.text);
          setSourceContent(
            message.source ? convertSourceToText(message.source) : "",
          );
          setIsEditorReady(true);
        }
      } catch (error) {
        console.error("Ошибка при загрузке сообщения:", error);
      }
    };

    fetchContent();
  }, [messageId]);

  const convertSourceToText = (source: string | object, sentenceNumber?: number) => {
    try {
      if (!source) return '';
      
      // Нормализуем входные данные
      const sourceObj = typeof source === "string" 
        ? source.trim().startsWith('{') || source.trim().startsWith('[')
          ? JSON.parse(source)
          : { '0': source } // Создаем fallback объект
        : source;

      if (typeof sentenceNumber === 'number') {
        return sourceObj[sentenceNumber] || `Нет данных для предложения #${sentenceNumber}`;
      }
      
      return Object.entries(sourceObj)
        .sort(([a], [b]) => parseInt(a) - parseInt(b))
        .map(([key, value]) => `${key}: ${value}`)
        .join("\n\n");
    } catch (e) {
      console.error("Ошибка преобразования source:", e);
      return "Некорректный формат исходных данных";
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

  const handleSentenceChange = (sentenceNumber: number) => {
    setActiveSentenceNumber(sentenceNumber);
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
              onActiveSentenceChange={handleSentenceChange}
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
              markdown={convertSourceToText(sourceContent, activeSentenceNumber)}
              showToolbar={false}
              onContentChange={() => {}}
            />
          </div>
        </Panel>
      </PanelGroup>
    </div>
  );
}
