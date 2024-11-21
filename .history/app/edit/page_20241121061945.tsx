/* eslint-disable no-console */
"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { useSearchParams } from "next/navigation";
import { Spinner } from "@nextui-org/react";

import { updateMessage } from "@/utils/indexedDB";

const Editor = dynamic(() => import("@/components/EditorComponent"), {
  ssr: false,
  loading: () => (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
      <Spinner size="lg" />
    </div>
  ),
});

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
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
      <div style={{ width: "80%", maxWidth: "1000px" }}>
        <Editor
          key={markdown}
          markdown={markdown}
          onContentChange={handleContentChange}
        />
      </div>
    </div>
  );
}
