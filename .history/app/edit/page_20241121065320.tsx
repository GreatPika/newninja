/* eslint-disable no-console */
"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { useSearchParams } from "next/navigation";

import { updateMessage, getMessage } from "@/utils/indexedDB";

const Editor = dynamic(() => import("@/components/EditorComponent"), {
  ssr: false,
  loading: () => <div className="text-default-500">Загрузка редактора...</div>,
});

export default function EditPage() {
  const [markdown, setMarkdown] = useState("");
  const [isEditorReady, setIsEditorReady] = useState(false);
  const searchParams = useSearchParams();

  useEffect(() => {
    const messageId = searchParams.get("id");
    
    if (messageId) {
      const fetchMessage = async () => {
        const message = await getMessage(parseInt(messageId));
        if (message) {
          setMarkdown(message.text);
          setIsEditorReady(true);
        }
      };
      
      fetchMessage();
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
    <>
      <h1 className="text-2xl font-bold mb-4 text-default-900">Редактор</h1>
      <div>
        <Editor
          key={markdown}
          markdown={markdown}
          onContentChange={handleContentChange}
        />
      </div>
    </>
  );
}
