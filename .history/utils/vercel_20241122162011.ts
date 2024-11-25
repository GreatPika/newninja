import { Message, ApiResponse } from "@/types/index";
import { supabase } from "@/utils/supabase";

export async function getAssistantResponse(
  text: string,
  baseURL: string,
): Promise<Message | null> {
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
        return getAssistantResponse(text, baseURL);
      } else {
        throw new Error("Ошибка авторизации");
      }
    }

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data: ApiResponse = await response.json();

    if (data.analysis) {
      return {
        text: data.analysis,
        role: "assistant",
        timestamp: new Date(),
      };
    }

    console.warn("No analysis in response");

    return null;
  } catch (error) {
    console.error("Error getting response:", error);

    return null;
  }
}
