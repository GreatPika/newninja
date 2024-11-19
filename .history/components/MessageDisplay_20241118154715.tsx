// components/chat/MessageDisplay.tsx
import { MessageDisplayProps } from "@/types/index";

export function MessageDisplay({ messages, loading }: MessageDisplayProps) {
  return (
    <div className="flex-1 overflow-auto p-4 space-y-4">
      {messages.map((message, index) => (
        <div
          key={index}
          className={`p-3 rounded-lg ${
            message.role === "user"
              ? "bg-blue-100 ml-auto max-w-[80%]"
              : "bg-gray-100 mr-auto max-w-[80%]"
          }`}
        >
          <div className="text-sm font-semibold mb-1">
            {message.role === "user" ? "You" : "Assistant"}
          </div>
          <div className="prose prose-sm max-w-none">{message.text}</div>
          <div className="text-xs text-gray-500 mt-1">
            {message.timestamp.toLocaleTimeString()}
          </div>
        </div>
      ))}
      {loading && (
        <div className="bg-gray-100 p-3 rounded-lg mr-auto max-w-[80%]">
          <div className="animate-pulse">Thinking...</div>
        </div>
      )}
    </div>
  );
}
