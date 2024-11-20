/* eslint-disable no-console */
"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { useSearchParams } from "next/navigation";
import { useTheme } from "next-themes";

import { updateMessage } from "@/utils/indexedDB";

const Editor = dynamic(() => import("@/components/EditorComponent"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-screen bg-background text-default-500">
      Загрузка редактора...
    </div>
  ),
});

export default function EditPage() {
  const [markdown, setMarkdown] = useState("");
  const [isEditorReady, setIsEditorReady] = useState(false);
  const [mounted, setMounted] = useState(false);
  const searchParams = useSearchParams();
  const { theme, resolvedTheme } = useTheme();

  // Обработка гидратации
  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const content = searchParams.get("content");

    if (content) {
      const decodedContent = decodeURIComponent(content);

      setMarkdown(decodedContent);
      setIsEditorReady(true);
    }
  }, [searchParams]);

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

  if (!mounted || !isEditorReady) {
    return (
      <div className="w-full h-screen bg-background text-default-500">
        Загрузка...
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-background">
      <div className="container mx-auto px-4">
        <h1 className="text-2xl font-bold mb-4 text-default-900">Редактор</h1>
        <div className="bg-background">
          <Editor
            key={`${markdown}-${theme}`}
            markdown={markdown}
            onContentChange={handleContentChange}
          />
        </div>
      </div>
    </div>
  );
}