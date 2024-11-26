/* eslint-disable no-console */
"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import dynamic from "next/dynamic";
import { useParams } from "next/navigation";

import { updateMessage, getMessageById } from "@/utils/indexedDB";
import ContextMenu from "@/components/ContextMenu";

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

  const editorRef = useRef<any>(null);
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number } | null>(null);
  const [cursorPosition, setCursorPosition] = useState<number | null>(null);

  useEffect(() => {
    const fetchContent = async () => {
      if (messageId) {
        const message = await getMessageById(messageId);

        if (message) {
          setMarkdown(message.text);
          setIsEditorReady(true);
        }
      }
    };

    fetchContent();
  }, [messageId]);

  const handleContentChange = async (content: string) => {
    if (messageId) {
      try {
        await updateMessage(messageId, content);
        console.log("Изменения сохранены");
      } catch (error) {
        console.error("Ошибка при сохранении изменений:", error);
      }
    }
    setMarkdown(content);
  };

  const handleContextMenu = useCallback(
    (event: React.MouseEvent) => {
      event.preventDefault();
      setContextMenu({ x: event.clientX, y: event.clientY });
      // Получаем текущую позицию курсора
      if (editorRef.current) {
        const position = editorRef.current.getCursorPosition();
        setCursorPosition(position);
      }
    },
    []
  );

  const closeContextMenu = useCallback(() => {
    setContextMenu(null);
  }, []);

  const insertSymbol = useCallback(
    (symbol: string) => {
      if (cursorPosition !== null) {
        const newMarkdown =
          markdown.slice(0, cursorPosition) + symbol + markdown.slice(cursorPosition);
        setMarkdown(newMarkdown);
        handleContentChange(newMarkdown);
        // Обновляем позицию курсора
        if (editorRef.current) {
          editorRef.current.setCursorPosition(cursorPosition + symbol.length);
        }
      }
      closeContextMenu();
    },
    [cursorPosition, markdown, handleContentChange, closeContextMenu]
  );

  if (!isEditorReady) {
    return <div className="text-default-500">Загрузка...</div>;
  }

  return (
    <>
      <div onContextMenu={handleContextMenu}>
        <Editor
          ref={editorRef}
          markdown={markdown}
          onContentChange={handleContentChange}
        />
      </div>
      {contextMenu && (
        <ContextMenu
          position={contextMenu}
          onClose={closeContextMenu}
          onSymbolSelect={insertSymbol}
        />
      )}
    </>
  );
}
