"use client";

import { ChatContainer } from "@/components/ChatConteiner";
import AuthGuard from "@/components/AuthGuard";
import { Navbar } from "@/components/navbar";

export default function HomePage() {
  const emptyStateMessage =
    "Все сообщения в этом чате хранятся локально в памяти вашего браузера." +
    " Обратите внимание, что при очистке данных сайта вся информация будет безвозвратно удалена." +
    " Чтобы сохранить данные, рекомендуем экспортировать документы в формате Excel заранее." +
    " Важно! Этот чат предназначен только для отправки технических заданий или характеристик оборудования (например, с веб-сайта производителя оборудования). Любые другие сообщения не будут корректно обработаны.";

  return (
    <AuthGuard>
      <div className="h-full">
        <Navbar />
        <ChatContainer
          baseURL="http://65.109.172.63:8000/"
          emptyStateMessage={emptyStateMessage}
        />
      </div>
    </AuthGuard>
  );
}
