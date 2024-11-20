"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { useSearchParams, useRouter } from "next/navigation";
import { updateMessageInDB } from "@/utils/messages";

const Editor = dynamic(() => import("@/components/EditorComponent"), {
  ssr: false,
  loading: () => <div>Загрузка редактора...</div>
});

export default function EditPage() {
  const [markdown, setMarkdown] = useState("");
  const [messageId, setMessageId] = useState<number | null>(null);
  const [isEditorReady, setIsEditorReady] = useState(false);
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    const content = searchParams.get("content");
    const id = searchParams.get("id");
    
    if (content && id) {
      const decodedContent = decodeURIComponent(content);
      setMarkdown(decodedContent);
      setMessageId(Number(id));
      setIsEditorReady(true);
    }
  }, [searchParams]);

  const handleSave = async (newContent: string) => {
    if (messageId) {
      await updateMessageInDB(messageId, newContent);
    }
  };

  if (!isEditorReady) {
    return <div>Загрузка...</div>;
  }

  return (
    <>
      <h1 className="text-2xl font-bold mb-4">Редактор</h1>
      <div>
        <Editor 
          key={markdown} 
          markdown={markdown} 
          messageId={messageId ?? undefined}
          onSave={handleSave}
        />
      </div>
    </>
  );
}
