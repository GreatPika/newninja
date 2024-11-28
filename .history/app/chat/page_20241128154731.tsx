"use client";

import { AlertTriangle } from "lucide-react";

import { ChatContainer } from "@/components/ChatConteiner";
import AuthGuard from "@/components/AuthGuard";
import { Navbar } from "@/components/navbar";

export default function HomePage() {
  const emptyStateMessage =
    "Все сообщения в этом чате хранятся локально в памяти вашего браузера. " +
    "Обратите внимание, что при очистке данных сайта вся информация будет " +
    "безвозвратно удалена. Чтобы сохранить данные, рекомендуем экспортировать " +
    "документы в формате Excel заранее.";

  return (
    <AuthGuard>
      <div className="h-full">
        <Navbar />
        <ChatContainer
          EmptyStateIcon={AlertTriangle}
          baseURL="https://tenderless-vercel-git-main-sergei-rogov.vercel.app"
          emptyStateMessage={emptyStateMessage}
        />
      </div>
    </AuthGuard>
  );
}
