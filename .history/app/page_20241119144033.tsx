"use client";

import { ChatContainer } from "@/components/ChatConteiner";

export default function HomePage() {
  return (
    <div className="h-full">
      <ChatContainer
        apiKey="sk-FsYI-vDZljPebnQu95_GwTcLF5nD4hFH-RNLwPWRKPk"
        baseURL="http://95.217.16.106:7860/"
        flowId="4f9cfd17-8b0f-488d-a945-9406448838ca"
      />
    </div>
  );
}
