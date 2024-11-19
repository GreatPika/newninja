import { useState } from "react";
import { Input, Button } from "@nextui-org/react";
import { SendHorizontal } from "lucide-react";

import { PromptInputProps } from "@/types/index";

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
        <Input
          className="flex-1"
          disabled={disabled}
          placeholder="Type your message..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
        <Button
          color="primary"
          endContent={<SendHorizontal className="h-4 w-4" />}
          isDisabled={disabled || !input.trim()}
          type="submit"
        >
          Send
        </Button>
      </div>
    </form>
  );
}
