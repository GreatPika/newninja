"use client";

import { ChatContainer } from "@/components/ChatConteiner";

export default function HomePage() {
  return (
    <div className="h-full">
      <ChatContainer baseURL="https://tenderless-vercel-git-main-sergei-rogov.vercel.app" />
    </div>
  );
}
