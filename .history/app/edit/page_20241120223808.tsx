"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { Suspense } from "react";

const Editor = dynamic(() => import("@/components/EditorComponent"), {
  ssr: false,
});

export default function EditPage() {
  const [markdown] = useState("");

  return (
    <>
      <h1 className="text-2xl font-bold mb-4">Редактор</h1>
      <div style={{ border: '1px solid black' }}>
        <Suspense fallback={null}>
          <Editor markdown={markdown} />
        </Suspense>
      </div>
    </>
  );
}
