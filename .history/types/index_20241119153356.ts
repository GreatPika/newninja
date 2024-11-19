import { SVGProps } from "react";

export type IconSvgProps = SVGProps<SVGSVGElement> & {
  size?: number;
};
export interface Message {
  id?: string;
  role: "user" | "assistant";
  text: string;
  timestamp: string | Date;
}
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

export interface MessageConteinerProps {
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
