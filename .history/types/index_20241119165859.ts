
export interface Message {
  id?: number;
  text: string;
  role: "user" | "assistant";
  timestamp: Date;
}

export interface ChatContainerProps {
  flowId: string;
  apiKey: string;
  baseURL: string;
}

export interface RunFlowParams {
  flowId: string;
  inputValue: string;
  inputType: string;
  outputType: string;
  tweaks: Record<string, any>;
}

export interface LangflowResponse {
  outputs: Array<{
    outputs: Array<{
      results: {
        message: {
          text: string;
        };
      };
    }>;
  }>;
}

export interface MessageConteinerProps {
  messages: Message[];
  loading: boolean;
  onDelete: (id?: number) => void;
}
