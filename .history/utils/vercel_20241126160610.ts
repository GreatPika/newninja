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

    const data = await response.json();

    // Проверяем наличие ошибки в новом формате
    if (data.error) {
      const { message, code } = data.error;
      console.error(`Ошибка с кодом ${code}: ${message}`);
      throw new Error(`Ошибка: ${message} (Код: ${code})`);
    }

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
    console.error("Ошибка в получении ответа от сервера:", error);

    // Принудительно выбрасываем ошибку, чтобы приложение крашилось
    throw new TypeError(
      "renderedContent.includes is not a function",
    );
  }
}
