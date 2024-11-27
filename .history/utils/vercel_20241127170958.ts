/* eslint-disable no-console */
import { Message } from "@/types/index";
import { supabase } from "@/utils/supabase";
import { useSnackbar } from 'notistack';

export async function getAssistantResponse(
  text: string,
  baseURL: string,
  enqueueSnackbar: (message: string, options: any) => void
): Promise<Message | null> {
  try {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      enqueueSnackbar("Ошибка: пользователь не авторизован.", { variant: 'error' });
      return null;
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
        return getAssistantResponse(text, baseURL, enqueueSnackbar);
      } else {
        enqueueSnackbar("Ошибка: не удалось обновить сессию. Авторизация невозможна.", { variant: 'error' });
        return null;
      }
    }

    const data = await response.json();

    if (data.error) {
      const { message } = data.error;
      enqueueSnackbar(`Ошибка: ${message}`, { variant: 'error' });
      return null;
    }

    if (data.analysis) {
      return {
        text: data.analysis,
        role: data.product_name || "assistant",
        timestamp: new Date(),
      };
    }

    enqueueSnackbar("Ответ сервера пуст", { variant: 'error' });
    return null;
  } catch {
    enqueueSnackbar("Произошла ошибка при обработке запроса. Пожалуйста, попробуйте еще раз.", { variant: 'error' });
    return null;
  }
}
