// components/chat/PromptInput.tsx
import { useState } from 'react';
import { PromptInputProps } from '@/lib/types';

export function PromptInput({ onSubmit, disabled }: PromptInputProps) {
  const [input, setInput] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim()) {
      onSubmit(input.trim());
      setInput('');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="border-t p-4">
      <div className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={disabled}
          className="flex-1 p-2 border rounded"
          placeholder="Type your message..."
        />
        <button
          type="submit"
          disabled={disabled || !input.trim()}
          className="px-4 py-2 bg-blue-500 text-white rounded disabled:bg-blue-300"
        >
          Send
        </button>
      </div>
    </form>
  );
}