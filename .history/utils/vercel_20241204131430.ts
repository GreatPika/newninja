/* eslint-disable no-console */
import { Message } from "@/types/index";
import { supabase } from "@/utils/supabase";

export async function getAssistantResponse(
  text: string,
  baseURL: string,
  enqueueSnackbar: (message: string, options: any) => void,
): Promise<Message | null> {
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

    const reader = response.body?.getReader();
    const decoder = new TextDecoder("utf-8");
    let analysis = "";
    let productName = "assistant";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value, { stream: true });
      const lines = chunk.split("\n").filter(line => line.trim() !== "");

      for (const line of lines) {
        if (line.startsWith("data:")) {
          const data = JSON.parse(line.substring(5));

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
      }
    }

    if (analysis) {
      return {
        text: analysis,
        role: productName,
        timestamp: new Date(),
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
  }
}