/* eslint-disable no-console */
import { Message, ApiResponse } from "@/types/index";
import { supabase } from "@/utils/supabase";

export async function getAssistantResponse(
  text: string,
  baseURL: string,
  onStatusUpdate?: (status: string) => void // Колбэк для обновления статуса
): Promise<Message | null> {
  try {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      throw new Error("Не авторизован");
    }

    // Создаем EventSource для SSE
    const eventSource = new EventSource(`${baseURL}?text=${encodeURIComponent(text)}`, {
      withCredentials: true,
    });

    return new Promise((resolve, reject) => {
      // Обработка статусных сообщений
      eventSource.addEventListener('status', (event) => {
        const status = event.data;
        console.log('Статус обработки:', status);
        if (onStatusUpdate) {
          onStatusUpdate(status);
        }
      });

      // Обработка ошибок
      eventSource.addEventListener('error', (event) => {
        console.error('SSE Error:', event);
        eventSource.close();
        reject(new Error('Ошибка SSE соединения'));
      });

      // Обработка результата
      eventSource.addEventListener('result', (event) => {
        const data: ApiResponse = JSON.parse(event.data);
        eventSource.close();

        if (data.analysis) {
          resolve({
            text: data.analysis,
            role: "assistant",
            timestamp: new Date(),
          });
        } else {
          console.warn("No analysis in response");
          resolve(null);
        }
      });
    });

  } catch (error) {
    console.error("Error getting response:", error);
    return null;
  }
}