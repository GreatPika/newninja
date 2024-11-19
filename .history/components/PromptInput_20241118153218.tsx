// components/chat/PromptInput.tsx
import { useState } from "react";

import { PromptInputProps } from "@/lib/types";

export function PromptInput({ onSubmit, disabled }: PromptInputProps) {
  const [input, setInput] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim()) {
      onSubmit(input.trim());
      setInput("");
    }
  };

  return (
    <form className="border-t p-4" onSubmit={handleSubmit}>
      <div className="flex gap-2">
        <input
          className="flex-1 p-2 border rounded"
          disabled={disabled}
          placeholder="Type your message..."
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
        <button
          className="px-4 py-2 bg-blue-500 text-white rounded disabled:bg-blue-300"
          disabled={disabled || !input.trim()}
          type="submit"
        >
          Send
        </button>
      </div>
    </form>
  );
}
