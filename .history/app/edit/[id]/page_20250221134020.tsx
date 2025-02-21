/* eslint-disable no-console */
"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { useParams } from "next/navigation";
import { PanelGroup, Panel, PanelResizeHandle } from "react-resizable-panels";
import { marked } from "marked";

import { updateMessage, getMessageById } from "@/utils/indexedDB";

const Editor = dynamic(() => import("@/app/edit/components/EditorComponent"), {
  ssr: false,
  loading: () => <div className="text-default-500">Загрузка редактора...</div>,
});

export default function EditPage() {
  const [markdown, setMarkdown] = useState("");
  const [sourceContent, setSourceContent] = useState("");
  const [isEditorReady, setIsEditorReady] = useState(false);
  const [selectedSentence, setSelectedSentence] = useState("");
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

  const handleRowSelect = (rowNumber: number) => {
    const tokens = marked.lexer(markdown);
    const tableToken = tokens.find((token) => token.type === "table") as any;
    
    if (!tableToken) return;
    
    const row = tableToken.cells[rowNumber - 1];
    if (!row || row.length < 4) return;

    const numberStr = row[3];
    const targetNumber = parseInt(numberStr, 10);
    
    try {
      const sourceObj = typeof sourceContent === 'string' 
        ? JSON.parse(sourceContent) 
        : sourceContent;
        
      const sentence = sourceObj.numbered_sentences?.find(
        (item: { number: number }) => item.number === targetNumber
      )?.sentence || '';
      
      setSelectedSentence(sentence);
    } catch (e) {
      console.error('Ошибка парсинга:', e);
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
              onRowSelect={handleRowSelect}
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
              markdown={selectedSentence}
              showToolbar={false}
              onContentChange={() => {}}
            />
          </div>
        </Panel>
      </PanelGroup>
    </div>
  );
}
