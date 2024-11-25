/* eslint-disable no-console */
import { Message } from "@/types/index";
import { supabase } from "@/utils/supabase";

export async function getAssistantResponse(
  text: string,
  baseURL: string,
  onDataChunk: (chunk: string) => void,
): Promise<void> {
  try {
    // Получаем текущую сессию пользователя
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      throw new Error("Не авторизован");
    }

    const response = await fetch(baseURL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        // Отправляем оба токена в заголовке
        Authorization: JSON.stringify({
          access_token: session.access_token,
          refresh_token: session.refresh_token,
        }),
      },
      body: JSON.stringify({ text }),
    });

    if (response.status === 401) {
      // Попытка обновить сессию при ошибке авторизации
      const {
        data: { session: newSession },
      } = await supabase.auth.refreshSession();

      if (newSession) {
        // Повторяем запрос с новым токеном
        return getAssistantResponse(text, baseURL, onDataChunk);
      } else {
        throw new Error("Ошибка авторизации");
      }
    }

    if (!response.ok) {
      throw new Error(`Ошибка HTTP! Статус: ${response.status}`);
    }

    // Обрабатываем поток SSE
    if (!response.body) {
      throw new Error("Нет тела ответа");
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder("utf-8");
    let receivedText = "";

    while (true) {
      const { value, done } = await reader.read();
      if (done) break;

      receivedText += decoder.decode(value, { stream: true });

      // Разбираем SSE-сообщения
      const lines = receivedText.split("\n");
      receivedText = lines.pop()!; // Оставляем неполную строку для следующей итерации

      for (const line of lines) {
        if (line.startsWith("data:")) {
          const data = line.slice("data:".length).trim();
          if (data) {
            onDataChunk(data);
          }
        } else if (line.startsWith("event: end")) {
          // Сообщение о завершении передачи
          onDataChunk("[Конец передачи]");
          return;
        } else if (line.startsWith("event: error")) {
          const data = line.slice("event: error".length).trim();
          throw new Error(`Ошибка сервера: ${data}`);
        }
      }
    }

  } catch (error) {
    console.error("Ошибка при получении ответа:", error);
    throw error;
  }
}