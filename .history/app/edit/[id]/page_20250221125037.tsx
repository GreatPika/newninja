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
  const [sourceData, setSourceData] = useState<Record<string, string>>({});
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
          if (message.source) {
            const sourceObj =
              typeof message.source === "string" ? JSON.parse(message.source) : message.source;
            setSourceData(sourceObj);
            setSourceContent(convertSourceToText(sourceObj));
          }
          setIsEditorReady(true);
        }
      } catch (error) {
        console.error("Ошибка при загрузке сообщения:", error);
      }
    };

    fetchContent();
  }, [messageId]);

  const handleActiveRowChange = async ({ column4Value }: { column4Value: string }) => {
    try {
      const sentenceNumber = column4Value.match(/\d+/)?.[0] || '1';
      setSourceContent(sourceData[sentenceNumber] || '');
    } catch (e) {
      console.error('Ошибка обработки номера предложения:', e);
    }
  };

  const convertSourceToText = (source: Record<string, string>) => {
    return Object.entries(source)
      .sort(([a], [b]) => parseInt(a) - parseInt(b))
      .map(([key, value]) => `${key}: ${value}`)
      .join("\n\n");
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
