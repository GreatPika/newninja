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
      fetch(baseURL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: JSON.stringify({
            access_token: session.access_token,
            refresh_token: session.refresh_token,
          }),
        },
        credentials: 'include', // Добавляем поддержку credentials
        mode: 'cors', // Явно указываем режим CORS
        body: JSON.stringify({ text })
      }).then(async response => {
        // Добавляем логирование для отладки
        console.log('Response status:', response.status);
        console.log('Response headers:', response.headers);

        if (response.status === 401) {
          throw new Error('Unauthorized');
        }

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        if (!response.body) {
          throw new Error('Response body is not readable');
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = '';

        function processText(text: string) {
          const lines = text.split('\n');
          
          // Добавляем логирование для отладки
          console.log('Processing lines:', lines);
          
          for (const line of lines) {
            if (line.startsWith('data: ')) {
              try {
                const data = JSON.parse(line.slice(6));
                console.log('Parsed SSE data:', data); // Логируем parsed данные
                
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
                console.warn('Failed to parse SSE data:', line, e);
              }
            }
          }
        }

        async function pump(): Promise<void> {
          try {
            const { done, value } = await reader.read();
            
            if (done) {
              if (buffer) {
                processText(buffer);
              }
              return;
            }

            const chunk = decoder.decode(value, { stream: true });
            console.log('Received chunk:', chunk); // Логируем полученные чанки

            buffer += chunk;
            const lines = buffer.split('\n\n');
            buffer = lines.pop() || '';
            
            for (const line of lines) {
              processText(line);
            }

            return pump();
          } catch (error) {
            console.error('Pump error:', error); // Логируем ошибки pump
            reject(error);
            return;
          }
        }

        pump().catch(error => {
          console.error('Pump chain error:', error); // Логируем ошибки в цепочке
          reject(error);
        });
      }).catch(async (error) => {
        console.error('Fetch error:', error); // Логируем ошибки fetch

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