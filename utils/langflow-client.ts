/* eslint-disable no-console */
// lib/langflow-client.ts
import { RunFlowParams, LangflowResponse } from "@/types/index";

export class LangflowClient {
  private baseURL: string;
  private apiKey?: string;

  constructor(baseURL: string, apiKey?: string) {
    this.baseURL = baseURL.replace(/\/$/, "");
    this.apiKey = apiKey;
  }

  private async post(
    endpoint: string,
    body: Record<string, unknown>,
  ): Promise<LangflowResponse> {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };

    if (this.apiKey) {
      headers.Authorization = `Bearer ${this.apiKey}`;
    }

    const url = `${this.baseURL}${endpoint}`;

    try {
      const response = await fetch(url, {
        method: "POST",
        headers,
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      return data as LangflowResponse;
    } catch (error) {
      console.error("Error during POST request:", error);
      throw error;
    }
  }

  async runFlow(params: RunFlowParams): Promise<LangflowResponse> {
    const endpoint = `/api/v1/run/${params.flowId}`;

    return this.post(endpoint, {
      input_value: params.inputValue,
      input_type: params.inputType,
      output_type: params.outputType,
      tweaks: params.tweaks,
    });
  }
}
