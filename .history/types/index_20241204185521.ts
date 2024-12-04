import { SVGProps } from "react";

export type IconSvgProps = SVGProps<SVGSVGElement> & {
  size?: number;
};

export interface ApiResponse {
  product_name: string;
  structure: Array<{
    name: string;
    sentences: Record<string, string>;
  }>;
  analysis: string;
}

export interface Message {
  id?: number;
  text: string;
  role: "user" | string;
  timestamp: Date;
}

export interface MessageDB {
  id?: number; // Автоинкрементный ключ
  text: string;
  role: "user" | "assistant";
  timestamp: string; // Хранение как строка ISO
}
export interface ChatContainerProps {
  baseURL: string;
}

export interface MessageConteinerProps {
  messages: Message[];
  loading: boolean;
  onDelete: (id?: number) => void;
}

export interface MessageDB {
  id?: number;
  text: string;
  role: "user" | "assistant";
  timestamp: string;
}

export interface TokenUsageData {
  id: number;
  created_at: string;
  total_cost: number;
}

export interface UserProfile {
  balance: number;
  email: string;
}
