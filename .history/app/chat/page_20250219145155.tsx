"use client";

import { ChatContainer } from "@/app/chat/components/ChatConteiner";
import AuthGuard from "@/app/login/AuthGuard";
import { NavBar } from "@/app/chat/components/NavBar";

export default function HomePage() {
  const emptyStateMessage =
    "Все сообщения в этом чате хранятся локально в памяти вашего браузера." +
    " Обратите внимание, что при очистке данных сайта вся информация будет безвозвратно удалена." +
    " Чтобы сохранить данные, рекомендуем экспортировать документы в формате Excel заранее." +
    " Важно! Этот чат предназначен только для отправки технических заданий или характеристик оборудования (например, с веб-сайта производителя оборудования). Любые другие сообщения не будут корректно обработаны.";

  return (
    <AuthGuard>
      <div className="h-full">
        <NavBar />
        <ChatContainer
          baseURL="https://api.tenderninja.co"
          //baseURL="http://127.0.0.1:8000"
          emptyStateMessage={emptyStateMessage}
        />
      </div>
    </AuthGuard>
  );
}
