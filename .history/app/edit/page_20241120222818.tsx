"use client";

import { useState } from "react";
import dynamic from "next/dynamic";

// Динамический импорт с отключенным SSR
const Editor = dynamic(() => import("@/components/EditorComponent"), {
  ssr: false,
});

export default function EditPage() {
  const [markdown] = useState("");

  return (
    <div className="container max-w-7xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Редактор</h1>
      <div className="w-full">
        <Editor markdown={markdown} />
      </div>
    </div>
  );
}
