/* eslint-disable no-console */
"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import dynamic from "next/dynamic";
import { useParams } from "next/navigation";

import { updateMessage, getMessageById } from "@/utils/indexedDB";

const Editor = dynamic(() => import("@/components/EditorComponent"), {
  ssr: false,
  loading: () => <div className="text-default-500">Загрузка редактора...</div>,
});

export default function EditPage() {
  const [markdown, setMarkdown] = useState("");
  const [isEditorReady, setIsEditorReady] = useState(false);
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number } | null>(null);
  const editorRef = useRef<any>(null);
  const params = useParams();
  const messageId =
    typeof params.id === "string" ? parseInt(params.id, 10) : null;

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
  };

  const handleContextMenu = useCallback((event: React.MouseEvent) => {
    event.preventDefault();
    setContextMenu({ x: event.clientX, y: event.clientY });
  }, []);

  const closeContextMenu = useCallback(() => {
    setContextMenu(null);
  }, []);

  const insertSymbol = useCallback((symbol: string) => {
    if (editorRef.current) {
      const editor = editorRef.current.getInstance();
      const cursorPos = editor.getCursorPosition();
      editor.insertText(cursorPos, symbol);
    }
    closeContextMenu();
  }, [closeContextMenu]);

  if (!isEditorReady) {
    return <div className="text-default-500">Загрузка...</div>;
  }

  return (
    <div onContextMenu={handleContextMenu}>
      <Editor
        ref={editorRef}
        key={markdown}
        markdown={markdown}
        onContentChange={handleContentChange}
      />
      {contextMenu && (
        <ContextMenu
          position={contextMenu}
          onClose={closeContextMenu}
          onSymbolSelect={insertSymbol}
        />
      )}
    </div>
  );
}
