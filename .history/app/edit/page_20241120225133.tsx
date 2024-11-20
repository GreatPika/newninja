"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { Suspense } from "react";
import { useSearchParams } from "next/navigation";

const Editor = dynamic(() => import("@/components/EditorComponent"), {
  ssr: false,
});

export default function EditPage() {
  const [markdown, setMarkdown] = useState("");
  const searchParams = useSearchParams();

  useEffect(() => {
    const content = searchParams.get("content");
    if (content) {
      setMarkdown(decodeURIComponent(content));
    }
  }, [searchParams]);

  return (
    <>
      <h1 className="text-2xl font-bold mb-4">Редактор</h1>
      <div>
        <Suspense fallback={null}>
          <Editor markdown={markdown} />
        </Suspense>
      </div>
    </>
  );
}
