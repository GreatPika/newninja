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
  role: string;
  timestamp: string; // Хранение как строка ISO
  source: string; // Новое поле
}

export interface ChatContainerProps {
  baseURL: string;
}

export interface MessageConteinerProps {
  messages: Message[];
  loading: boolean;
  onDelete: (id?: number) => void;
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
