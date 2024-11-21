"use client";

import { useState, useEffect } from "react";
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
  const params = useParams();
  const messageId = typeof params.id === 'string' ? parseInt(params.id, 10) : null;

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