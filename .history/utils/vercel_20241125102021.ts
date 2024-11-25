/* eslint-disable no-console */
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

    // Создаём URL с параметрами
    const url = new URL(baseURL);
    url.searchParams.append('text', text);
    url.searchParams.append('authorization', JSON.stringify({
      access_token: session.access_token,
      refresh_token: session.refresh_token,
    }));

    const eventSource = new EventSource(url.toString());

    return new Promise((resolve, reject) => {
      eventSource.onmessage = (event) => {
        try {
          const data: ApiResponse = JSON.parse(event.data);
          if (data.analysis) {
            const message: Message = {
              text: data.analysis,
              role: "assistant",
              timestamp: new Date(),
            };
            eventSource.close();
            resolve(message);
          }
        } catch (error) {
          console.error('Error parsing SSE message:', error);
          eventSource.close();
          reject(error);
        }
      };

      eventSource.onerror = (error) => {
        console.error('SSE error:', error);
        eventSource.close();
        reject(error);
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
