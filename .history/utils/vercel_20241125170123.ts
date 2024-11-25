/* eslint-disable no-console */
import { Message } from "@/types/index";
import { supabase } from "@/utils/supabase";

export async function getAssistantResponse(
  text: string,
  baseURL: string,
  onProgress?: (message: string) => void
): Promise<Message | null> {
  try {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      throw new Error("Не авторизован");
    }

    return new Promise((resolve, reject) => {
      // Используем fetch для установки соединения
      fetch(baseURL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: JSON.stringify({
            access_token: session.access_token,
            refresh_token: session.refresh_token,
          }),
        },
        body: JSON.stringify({ text })
      }).then(response => {
        if (response.status === 401) {
          throw new Error('Unauthorized');
        }

        const reader = response.body?.getReader();
        const decoder = new TextDecoder();
        let buffer = '';

        function processText(text: string) {
          const lines = text.split('\n');
          
          for (const line of lines) {
            if (line.startsWith('data: ')) {
              try {
                const data = JSON.parse(line.slice(6));
                
                if (data.error) {
                  reject(new Error(data.error));
                } else if (data.status === 'progress' && onProgress) {
                  onProgress(data.message || "Обработка...");
                } else if (data.message === 'done') {
                  resolve({
                    text: data.analysis || "Обработка завершена",
                    role: "assistant",
                    timestamp: new Date(),
                  });
                }
              } catch (e) {
                console.warn('Failed to parse SSE data:', line);
              }
            }
          }
        }

        function pump(): Promise<void> {
          return reader?.read().then(({ done, value }) => {
            if (done) {
              if (buffer) {
                processText(buffer);
              }
              return;
            }

            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split('\n\n');
            buffer = lines.pop() || '';
            
            for (const line of lines) {
              processText(line);
            }

            return pump();
          });
        }

        if (!reader) {
          throw new Error('Response body is not readable');
        }

        return pump();
      }).catch(async (error) => {
        if (error.message === 'Unauthorized') {
          // Попытка обновить сессию
          const {
            data: { session: newSession },
          } = await supabase.auth.refreshSession();

          if (newSession) {
            // Повторный запрос с новой сессией
            const result = await getAssistantResponse(text, baseURL, onProgress);
            resolve(result);
          } else {
            reject(new Error("Ошибка авторизации"));
          }
        } else {
          reject(error);
        }
      });
    });

  } catch (error) {
    console.error("Error getting response:", error);
    return null;
  }
}
