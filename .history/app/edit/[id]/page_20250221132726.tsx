/* eslint-disable no-console */
"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { useParams } from "next/navigation";
import { PanelGroup, Panel, PanelResizeHandle } from "react-resizable-panels";

import { updateMessage, getMessageById } from "@/utils/indexedDB";
import { parseMarkdownTable } from "@/utils/parseMarkdownTable";

const Editor = dynamic(() => import("@/app/edit/components/EditorComponent"), {
  ssr: false,
  loading: () => <div className="text-default-500">Загрузка редактора...</div>,
});

export default function EditPage() {
  const [markdown, setMarkdown] = useState("");
  const [sourceContent, setSourceContent] = useState("");
  const [isEditorReady, setIsEditorReady] = useState(false);
  const [activeSourceKey, setActiveSourceKey] = useState<string | null>(null);
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
      const sourceObj =
        typeof source === "string" ? JSON.parse(source) : source;

      return Object.keys(sourceObj)
        .sort((a, b) => parseInt(a) - parseInt(b))
        .map((key) => `${key}: ${sourceObj[key]}`)
        .join("\n\n");
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

  const handleActiveRowChange = async (rowIndex: number) => {
    if (!messageId) return;

    try {
      const message = await getMessageById(messageId);
      if (!message?.text) return;

      // Парсим таблицу
      const tableData = await parseMarkdownTable(message.text);
      console.log('Parsed table data:', tableData);
      if (!tableData) return;

      // Проверяем индексы
      const targetRow = tableData.rows[rowIndex - 1];
      console.log(`Selected row ${rowIndex}:`, targetRow);
      if (!targetRow || targetRow.length < 4) return;
      
      const sourceKey = targetRow[3].trim();
      console.log('Extracted source key:', sourceKey);
      setActiveSourceKey(sourceKey);

      if (message.source) {
        // Парсим source
        const sourceObj = typeof message.source === 'string' 
          ? JSON.parse(message.source) 
          : message.source;
        console.log('Source object:', sourceObj);
        
        const content = sourceObj[sourceKey] || "";
        console.log('Selected content:', content);
        setSourceContent(content);
      }
    } catch (error) {
      console.error("Ошибка при обработке активной строки:", error);
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
              onActiveRowChange={handleActiveRowChange}
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
