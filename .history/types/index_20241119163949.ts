// types/index.ts
export interface Message {
  id?: number; // Изменено с string на number
  text: string;
  role: 'user' | 'assistant';
  timestamp: Date; // Убедитесь, что timestamp всегда типа Date
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
      message: {
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
  onDelete: (id?: number) => void; // Добавлено свойство onDelete
}
