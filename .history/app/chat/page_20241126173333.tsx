"use client";

import { ChatContainer } from "@/components/ChatConteiner";
import AuthGuard from "@/components/AuthGuard";
import { Navbar } from "@/components/navbar";
import { ScrollShadow } from "@nextui-org/react";

export default function HomePage() {
  return (
    <AuthGuard>
      <div className="h-full">
        <Navbar />
        <ScrollShadow hideScrollBar className="h-[calc(100vh-48px)]">
          <ChatContainer baseURL="https://tenderless-vercel-git-main-sergei-rogov.vercel.app" />
        </ScrollShadow>
      </div>
    </AuthGuard>
  );
}