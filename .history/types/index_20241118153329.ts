import { SVGProps } from "react";

export type IconSvgProps = SVGProps<SVGSVGElement> & {
  size?: number;
};

// lib/types.ts

export interface Message {
  text: string;
  role: "user" | "assistant";
  timestamp: Date;
}

// Обновленная структура ответа API
export interface LangflowMessage {
  text: string;
  sender: string;
  sender_name: string;
  session_id: string;
  timestamp: string;
  flow_id: string;
}

export interface LangflowOutput {
  outputs: {
    message: {
      message: LangflowMessage;
      type: string;
    };
  };
}

export interface LangflowResponse {
  session_id: string;
  outputs: Array<{
    outputs: Array<LangflowOutput>;
  }>;
}

export interface ChatContainerProps {
  flowId: string;
  apiKey?: string;
  baseURL: string;
}

export interface PromptInputProps {
  onSubmit: (message: string) => void;
  disabled?: boolean;
}

export interface MessageDisplayProps {
  messages: Message[];
  loading?: boolean;
}

export interface RunFlowParams {
  flowId: string;
  inputValue: string;
  inputType: string;
  outputType: string;
  tweaks: Record<string, unknown>;
}
