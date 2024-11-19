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

  // Стили для textarea, аналогичные textareaClassNames
  const textareaClassNames = {
    base: "w-full",
    input: "resize-none !text-base",
    inputWrapper: "!h-auto data-[has-end-content=true]:pr-16",
  };

  return (
    <div className="relative">
      <Card className="rounded-t-[20px] rounded-b-none shadow-none">
        <CardBody className="min-h-[90px]">
          <Textarea
            classNames={textareaClassNames}
            maxRows={30}
            minRows={1}
            placeholder="Введите сообщение..."
            style={{ fontSize: "16px" }}
            value={inputMessage}
            variant="flat"
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          <Button
            isIconOnly
            aria-label="Отправить сообщение"
            className="absolute top-3 right-3 w-[34px] h-[34px] min-w-0"
            color="primary"
            disabled={disabled}
            radius="lg"
            onClick={handleSubmit}
          >
            <ArrowUp size={20} />
          </Button>
        </CardBody>
      </Card>
    </div>
  );
}