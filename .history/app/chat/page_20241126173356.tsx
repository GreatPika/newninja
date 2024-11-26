"use client";

import { ChatContainer } from "@/components/ChatConteiner";
import AuthGuard from "@/components/AuthGuard";
import { Navbar } from "@/components/navbar";

export default function HomePage() {
  return (
    <AuthGuard>
      <div className="h-full">
        <Navbar />
        <ChatContainer baseURL="https://tenderless-vercel-git-main-sergei-rogov.vercel.app" />
      </div>
    </AuthGuard>
  );
}
