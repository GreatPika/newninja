"use client";

import { ChatContainer } from "@/components/ChatConteiner";
import AuthGuard from "@/components/AuthGuard";
import { Navbar } from "@/components/navbar";

export default function HomePage() {
  const emptyStateMessage =
    "1. Все сообщения в этом чате хранятся локально в памяти вашего браузера.\n\n" +
    "2. Обратите внимание, что при очистке данных сайта вся информация будет безвозвратно удалена.\n\n" +
    "3. Чтобы сохранить данные, рекомендуем экспортировать документы в формате Excel заранее.\n\n" +
    "4. Важно! Этот чат предназначен только для отправки технических заданий или характеристик оборудования (например, с веб-сайта производителя). Любые другие сообщения не будут корректно обработаны.";

  return (
    <AuthGuard>
      <div className="h-full">
        <Navbar />
        <ChatContainer
          baseURL="https://tenderless-vercel-git-main-sergei-rogov.vercel.app"
          emptyStateMessage={emptyStateMessage}
        />
      </div>
    </AuthGuard>
  );
}
