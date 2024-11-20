"use client";

import { useState } from "react";
import dynamic from "next/dynamic";

const Editor = dynamic(() => import("@/components/EditorComponent"), {
  ssr: false,
});

export default function EditPage() {
  const [markdown] = useState("");

  return (
    <div className="w-full">
      <h1 className="text-2xl font-bold mb-4">Редактор</h1>
      <div style={{border: '1px solid black'}}>
        <Editor markdown={markdown} />
      </div>
    </div>
  );
}
