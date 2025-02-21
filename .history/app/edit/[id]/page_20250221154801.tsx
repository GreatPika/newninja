/* eslint-disable no-console */
"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { useParams } from "next/navigation";
import { PanelGroup, Panel, PanelResizeHandle } from "react-resizable-panels";

import { updateMessage, getMessageById } from "@/utils/indexedDB";
import { TableRowInfo } from "@/app/edit/components/TableRowInfo";

const Editor = dynamic(() => import("@/app/edit/components/EditorComponent"), {
  ssr: false,
  loading: () => <div className="text-default-500">Загрузка редактора...</div>,
});

export default function EditPage() {
  const [markdown, setMarkdown] = useState("");
  const [, setSourceContent] = useState("");
  const [isEditorReady, setIsEditorReady] = useState(false);
  const [sourceData, setSourceData] = useState<
    Record<string, string> | undefined
  >();
  const params = useParams();
  const messageId =
    typeof params.id === "string" ? parseInt(params.id, 10) : null;
  const [pageRowInfo, setPageRowInfo] = useState<{
    activeRow: number | null;
    column4Value: string | null;
  }>({ activeRow: null, column4Value: null });

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

          // Парсим source данные
          try {
            const parsed = message.source ? JSON.parse(message.source) : {};

            setSourceData(
              typeof parsed === "object" && !Array.isArray(parsed)
                ? parsed
                : undefined,
            );
          } catch (e) {
            console.error("Ошибка парсинга source:", e);
            setSourceData(undefined);
          }

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

  if (!isEditorReady) {
    return <div className="text-default-500">Загрузка...</div>;
  }

  return (
    <div style={{ height: "100vh", overflow: "hidden" }}>
      <PanelGroup direction="vertical">
        <Panel
          defaultSize={85}
          maxSize={90}
          minSize={10}
          style={{ overflow: "auto" }}
        >
          <div style={{ height: "100%" }}>
            <Editor
              key={markdown}
              markdown={markdown}
              sourceData={sourceData}
              onContentChange={handleContentChange}
              onRowInfoChange={setPageRowInfo}
            />
          </div>
        </Panel>
        <PanelResizeHandle className="resize-handle" />
        <Panel
          defaultSize={15}
          maxSize={90}
          minSize={10}

        >
          <TableRowInfo
            activeRow={pageRowInfo.activeRow}
            column4Value={pageRowInfo.column4Value}
          />
        </Panel>
      </PanelGroup>
    </div>
  );
}
