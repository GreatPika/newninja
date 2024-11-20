"use client";

import { useState } from "react";

import Editor from "@/components/EditorComponent";

export default function EditPage() {
  const [markdown] = useState("");

  return (
    <div className="container max-w">
      <h1 className="text-2xl font-bold mb-4">Редактор</h1>
      <div className="w-full">
        <Editor markdown={markdown} />
      </div>
    </div>
  );
}
