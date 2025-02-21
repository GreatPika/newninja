/* eslint-disable no-console */
"use client";

import { useState, useEffect, useMemo } from "react";
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
  const [selectedSentence, setSelectedSentence] = useState<string | null>(null);
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

  const convertSourceToText = (source: string | object) => {
    try {
      const sourceObj = typeof source === "string" ? JSON.parse(source) : source;
      
      // Преобразуем все ключи к строкам
      const stringKeyObj = Object.fromEntries(
        Object.entries(sourceObj).map(([k, v]) => [String(k), v])
      );
      
      console.log('Converted source:', stringKeyObj);
      
      return JSON.stringify(stringKeyObj);
    } catch (e) {
      console.error("Ошибка преобразования source:", e);
      return "";
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

  // Преобразуем sourceContent в объект
  const sourceObject = useMemo(() => {
    try {
      return sourceContent ? JSON.parse(sourceContent) : {};
    } catch {
      return {};
    }
  }, [sourceContent]);

  // Формируем контент для нижнего редактора
  const bottomEditorContent = useMemo(() => {
    console.log('Selected sentence:', selectedSentence);
    console.log('Source object:', sourceObject);
    
    if (!selectedSentence) {
      console.log('No sentence selected');
      return "Выберите строку в таблице для просмотра предложения";
    }
    
    const content = sourceObject[selectedSentence];
    console.log('Found content:', content);
    
    return content || `Предложение с номером ${selectedSentence} не найдено`;
  }, [selectedSentence, sourceObject]);

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
              onSentenceSelect={setSelectedSentence}
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
              markdown={bottomEditorContent}
              showToolbar={false}
              selectedSentence={selectedSentence}
              onSentenceSelect={setSelectedSentence}
              onContentChange={() => {}}
            />
          </div>
        </Panel>
      </PanelGroup>
    </div>
  );
}
