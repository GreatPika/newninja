/* eslint-disable no-console */
import { Message } from "@/types/index";
import { supabase } from "@/utils/supabase";

export async function getAssistantResponse(
  text: string,
  baseURL: string
): Promise<Message | null> {
  try {
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
        Authorization: JSON.stringify({
          access_token: session.access_token,
          refresh_token: session.refresh_token,
        }),
      },
      body: JSON.stringify({ text }),
      credentials: "include",
    });

    if (response.status === 401) {
      const {
        data: { session: newSession },
      } = await supabase.auth.refreshSession();

      if (newSession) {
        return getAssistantResponse(text, baseURL);
      } else {
        throw new Error("Ошибка авторизации");
      }
    }

    if (!response.body) {
      throw new Error("Нет тела ответа");
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder("utf-8");
    let partialData = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      if (value) {
        const chunk = decoder.decode(value);
        partialData += chunk;

        // Разбиваем полученные данные на строки
        const lines = partialData.split("\n");
        partialData = lines.pop() || ""; // Сохраняем неполную строку для следующего чанка

        for (const line of lines) {
          if (line.trim() === "") continue;
          try {
            const message = JSON.parse(line);

            if (message.progress) {
              // Обновляем UI с сообщением о прогрессе
              console.log("Прогресс:", message.progress);
              // updateProgressUI(message.progress);
            } else if (message.result) {
              // Получили финальный результат
              console.log("Результат:", message.result);
              return {
                text: message.result.analysis,
                role: "assistant",
                timestamp: new Date(),
              };
            } else if (message.error) {
              // Обрабатываем ошибку
              console.error("Ошибка:", message.error);
              return {
                text: message.error,
                role: "assistant",
                timestamp: new Date(),
              };
            }
          } catch (e) {
            console.error("Ошибка парсинга JSON:", e);
          }
        }
      }
    }

    console.warn("Не получили финальный результат");
    return null;
  } catch (error) {
    console.error("Ошибка в получении ответа от сервера:", error);
    return null;
  }
}
