"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import dynamic from "next/dynamic";

import { updateMessage } from "@/utils/indexedDB";

// Динамически импортируем только сам Editor
const DynamicEditor = dynamic(() => import("@/components/EditorComponent"), {
  ssr: false,
  loading: () => <div className="text-default-500">Загрузка редактора...</div>,
});

// Основная страница без dynamic
export default function EditPage() {
  const [markdown, setMarkdown] = useState("");
  const [isEditorReady, setIsEditorReady] = useState(false);
  const searchParams = useSearchParams();

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

  if (!isEditorReady) {
    return <div className="text-default-500">Загрузка...</div>;
  }

  return (
    <div className="h-full">
      <DynamicEditor
        key={markdown}
        markdown={markdown}
        onContentChange={handleContentChange}
      />
    </div>
  );
}