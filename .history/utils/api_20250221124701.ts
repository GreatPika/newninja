/* eslint-disable no-console */
import { Message } from "@/types/index";
import { supabase } from "@/utils/supabase";

export async function getAssistantResponse(
  text: string,
  baseURL: string,
  enqueueSnackbar: (message: string, options: any) => void,
): Promise<Message | null> {
  let reader: ReadableStreamDefaultReader<Uint8Array> | undefined;
  let buffer = ""; // Добавляем буфер для хранения неполных данных
  let analysis = "";
  let productName = "assistant";
  let sourceData: any = null; // Добавляем переменную для хранения source данных

  try {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      enqueueSnackbar("Ошибка: пользователь не авторизован.", {
        variant: "error",
      });

      return null;
    }

    const response = await fetch(`${baseURL}/process`, {
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
        return getAssistantResponse(text, baseURL, enqueueSnackbar);
      } else {
        enqueueSnackbar(
          "Ошибка: не удалось обновить сессию. Авторизация невозможна.",
          { variant: "error" },
        );

        return null;
      }
    }

    if (!response.body) {
      enqueueSnackbar("Ошибка: не удалось получить тело ответа", {
        variant: "error",
      });

      return null;
    }

    reader = response.body.getReader();
    const decoder = new TextDecoder("utf-8");

    while (true) {
      const { done, value } = await reader.read();

      if (done) break;

      const chunk = decoder.decode(value, { stream: true });

      buffer += chunk; // Добавляем данные в буфер

      const lines = buffer.split("\n");

      buffer = lines.pop() || ""; // Сохраняем последнюю (возможно, неполную) строку обратно в буфер

      for (const line of lines) {
        if (line.startsWith("data:")) {
          try {
            const cleanLine = line.substring(5).trim(); // Добавляем trim()
            if (!cleanLine) continue; // Пропускаем пустые данные
            
            const data = JSON.parse(cleanLine); // Парсим очищенные данные

            if (data.type === "status") {
              enqueueSnackbar(data.message, { variant: "info" });
            } else if (data.type === "error") {
              enqueueSnackbar(`Ошибка: ${data.message}`, { variant: "error" });

              return null;
            } else if (data.type === "result") {
              analysis = data.data.analysis;
              productName = data.data.product_name || "assistant";
            } else if (data.type === "numbered_sentences") {
              // Нормализуем структуру данных
              sourceData = typeof data.data === 'object' 
                ? data.data 
                : { 1: data.data?.toString() || '' };
            }
          } catch (e) {
            console.error("Ошибка при разборе JSON:", e, line);
          }
        }
      }
    }

    // Обрабатываем оставшиеся данные в буфере
    if (buffer?.startsWith("data:")) {
      try {
        const cleanBuffer = buffer.substring(5).trim();
        if (cleanBuffer) {
          const data = JSON.parse(cleanBuffer);
          if (data.type === "numbered_sentences") {
            sourceData = data.data;
          }
          if (data.type === "status") {
            enqueueSnackbar(data.message, { variant: "info" });
          } else if (data.type === "error") {
            enqueueSnackbar(`Ошибка: ${data.message}`, { variant: "error" });

            return null;
          } else if (data.type === "result") {
            analysis = data.data.analysis;
            productName = data.data.product_name || "assistant";
          }
        }
      } catch (e) {
        console.error("Ошибка финального парсинга:", e, buffer);
      }
    }

    if (analysis) {
      return {
        text: analysis,
        role: productName,
        timestamp: new Date(),
        // Гарантируем правильный формат source
        source: sourceData ? JSON.stringify(sourceData) : '{}',
      };
    }

    enqueueSnackbar("Ответ сервера пуст", { variant: "error" });

    return null;
  } catch (error) {
    console.error("Ошибка при обработке запроса:", error);
    enqueueSnackbar(
      "Произошла ошибка при обработке запроса. Пожалуйста, попробуйте еще раз.",
      { variant: "error" },
    );

    return null;
  } finally {
    // Убедимся, что reader закрыт
    try {
      if (reader) {
        reader.releaseLock();
      }
    } catch (e) {
      console.error("Ошибка при освобождении reader:", e);
    }
  }
}
