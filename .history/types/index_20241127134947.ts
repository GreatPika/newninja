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
  role: "user" | "assistant";
  timestamp: Date;
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
