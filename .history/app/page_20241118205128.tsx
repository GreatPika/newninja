// app/page.tsx
"use client";

import { ChatContainer } from "@/components/Container";

export default function HomePage() {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Langflow Chat Interface</h1>
      <ChatContainer
        baseURL="http://95.217.16.106:7860/"
        flowId="2cc45f6d-6e58-493c-a2c3-b10b7033b4cd"
      />
    </div>
  );
}
