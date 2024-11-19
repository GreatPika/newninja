import React, { useState } from "react";
import { Card, CardBody, Textarea, Button } from "@nextui-org/react";
import { ArrowUp } from "lucide-react";

interface PromptInputProps {
  onSubmit: (text: string) => void;
  disabled: boolean;
}

export function PromptInput({ onSubmit, disabled }: PromptInputProps) {
  const [inputMessage, setInputMessage] = useState("");

  const handleSubmit = () => {
    if (inputMessage.trim()) {
      onSubmit(inputMessage);
      setInputMessage("");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  // Точные стили из исходного компонента
  const textareaClassNames = {
    base: "w-full bg-transparent",
    input: [
      "resize-none",
      "text-base",
      "bg-transparent",
      "placeholder:text-default-500/80",
      "!min-h-[40px]",
    ].join(" "),
    inputWrapper: [
      "bg-default-100",
      "backdrop-blur-xl",
      "backdrop-saturate-150",
      "!h-auto",
      "rounded-lg",
      "!py-2",
      "px-3",
      "shadow-small",
      "data-[has-end-content=true]:pr-16",
    ].join(" "),
  };

  return (
    <Card className="bg-background/60 dark:bg-default-100/50 rounded-t-[20px] rounded-b-none backdrop-blur-sm backdrop-saturate-150 border-t-1 border-default-200">
      <CardBody className="p-4 gap-0 overflow-hidden">
        <Textarea
          classNames={textareaClassNames}
          maxRows={30}
          minRows={1}
          placeholder="Введите сообщение..."
          value={inputMessage}
          variant="flat"
          onChange={(e) => setInputMessage(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        <Button
          isIconOnly
          aria-label="Отправить сообщение"
          className="absolute top-4 right-4 w-[34px] h-[34px] min-w-0 bg-primary/90 hover:bg-primary"
          disabled={disabled}
          radius="lg"
          onClick={handleSubmit}
        >
          <ArrowUp className="h-5 w-5" />
        </Button>
      </CardBody>
    </Card>
  );
}