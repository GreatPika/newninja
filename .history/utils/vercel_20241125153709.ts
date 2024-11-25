import { Message, ApiResponse } from "@/types/index";
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

    // Создаем URL с токенами авторизации
    const url = new URL(baseURL);
    url.searchParams.append('text', text);
    url.searchParams.append('access_token', session.access_token);
    url.searchParams.append('refresh_token', session.refresh_token);

    return new Promise((resolve, reject) => {
      const eventSource = new EventSource(url.toString(), {
        withCredentials: true
      });

      eventSource.onmessage = (event) => {
        try {
          const data: ApiResponse = JSON.parse(event.data);
          if (data.analysis) {
            const message: Message = {
              text: data.analysis,
              role: "assistant",
              timestamp: new Date(),
            };
            resolve(message);
          } else {
            console.warn("No analysis in response");
            resolve(null);
          }
        } catch (error) {
          console.error("Error parsing SSE data:", error);
          reject(error);
        }
      };

      eventSource.onerror = async (error) => {
        eventSource.close();
        
        // Если ошибка авторизации, пробуем обновить сессию
        if (error instanceof ErrorEvent && error.error === 401) {
          const {
            data: { session: newSession },
          } = await supabase.auth.refreshSession();

          if (newSession) {
            // Повторяем запрос с новым токеном
            try {
              const result = await getAssistantResponse(text, baseURL);
              resolve(result);
            } catch (retryError) {
              reject(retryError);
            }
          } else {
            reject(new Error("Ошибка авторизации"));
          }
        } else {
          reject(error);
        }
      };

      eventSource.addEventListener('complete', () => {
        eventSource.close();
      });
    });

  } catch (error) {
    console.error("Error getting response:", error);
    return null;
  }
}