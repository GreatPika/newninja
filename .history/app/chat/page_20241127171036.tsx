"use client";

import { ChatContainer } from "@/components/ChatConteiner";
import AuthGuard from "@/components/AuthGuard";
import { Navbar } from "@/components/navbar";
import { SnackbarProvider } from 'notistack';

export default function HomePage() {
  return (
    <SnackbarProvider maxSnack={3}>
      <AuthGuard>
        <div className="h-full">
          <Navbar />
          <ChatContainer baseURL="https://tenderless-vercel-git-main-sergei-rogov.vercel.app" />
        </div>
      </AuthGuard>
    </SnackbarProvider>
  );
}
