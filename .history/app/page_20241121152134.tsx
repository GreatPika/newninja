"use client";

import { ChatContainer } from "@/components/ChatConteiner";
import { NextUIProvider } from "@nextui-org/react";

export default function HomePage() {
  return (
    <NextUIProvider>
      <div className="h-full">
        <ChatContainer baseURL="https://tenderless-vercel-git-main-sergei-rogov.vercel.app" />
      </div>
    </NextUIProvider>
  );
}
