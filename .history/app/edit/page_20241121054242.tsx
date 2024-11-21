"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { useSearchParams } from "next/navigation";
import { useTheme } from "next-themes";

import { updateMessage } from "@/utils/indexedDB";

const Editor = dynamic(() => import("@/components/EditorComponent"), {
  ssr: false,
  loading: () => <div className="text-default-500">Загрузка редактора...</div>,
});

export default function EditPage() {
  const [markdown, setMarkdown] = useState("");
  const [isEditorReady, setIsEditorReady] = useState(false);
  const searchParams = useSearchParams();
  const { theme, resolvedTheme } = useTheme();

  useEffect(() => {
    const content = searchParams.get("content");
    if (content) {
      const decodedContent = decodeURIComponent(content);
      setMarkdown(decodedContent);
      setIsEditorReady(true);
    }
  }, [searchParams]);

  // Эффект для применения темы к document.body
  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.body.classList.remove('light', 'dark');
      document.body.classList.add(resolvedTheme || theme || 'dark');
    }
  }, [theme, resolvedTheme]);

  const handleContentChange = async (content: string) => {
    const messageId = searchParams.get("id");
    if (messageId) {
      try {
        await updateMessage(parseInt(messageId), content);
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
    <div className="h-full">
      <Editor
        key={markdown}
        markdown={markdown}
        onContentChange={handleContentChange}
      />
    </div>
  );
}