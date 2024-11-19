// app/page.tsx
"use client";

import { ChatContainer } from "@/components/Container";

export default function HomePage() {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Langflow Chat Interface</h1>
      <ChatContainer
        baseURL="http://95.217.16.106:7860/"
        flowId="6797da8c-e81f-465a-8216-3dc48bfbd59f"
      />
    </div>
  );
}
