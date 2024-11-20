/* eslint-disable no-console */
import { Message, ApiResponse } from "@/types/index";

export async function getAssistantResponse(
  text: string,
  baseURL: string,
): Promise<Message | null> {
  try {
    const response = await fetch(baseURL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ text }),
    });

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
