/* eslint-disable no-console */
import { Message } from "@/types/index";
import { supabase } from "@/utils/supabase";

export async function getAssistantResponse(
  text: string,
  baseURL: string,
): Promise<Message | null> {
  try {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      return {
        text: "Ошибка: пользователь не авторизован.",
        role: "assistant",
        timestamp: new Date(),
      };
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
    });

    if (response.status === 401) {
      const {
        data: { session: newSession },
      } = await supabase.auth.refreshSession();

      if (newSession) {
        return getAssistantResponse(text, baseURL);
      } else {
        return {
          text: "Ошибка: не удалось обновить сессию. Авторизация невозможна.",
          role: "assistant",
          timestamp: new Date(),
        };
      }
    }

    const data = await response.json();

    // Проверяем наличие ошибки в новом формате
    if (data.error) {
      const { message } = data.error;

      return {
        text: `Ошибка: ${message}`,
        role: "assistant",
        timestamp: new Date(),
      };
    }

    if (data.analysis) {
      return {
        text: data.analysis,
        role: data.product_name || "assistant",
        timestamp: new Date(),
      };
    }

    return {
      text: "Ответ сервера пуст",
      role: "assistant",
      timestamp: new Date(),
    };
  } catch {
    // Возвращаем ошибку в виде сообщения от assistant
    return {
      text: "Произошла ошибка при обработке запроса. Пожалуйста, попробуйте еще раз.",
      role: "assistant",
      timestamp: new Date(),
    };
  }
}
