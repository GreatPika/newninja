import React, { useState } from "react";
import { Card, CardBody, Textarea, Button } from "@nextui-org/react";
import { ArrowUp, Upload } from "lucide-react";
import { textareaClassNames } from "@/styles/styles";
import { getTextExtractor } from "office-text-extractor";

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

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      try {
        // Чтение файла как ArrayBuffer
        const arrayBuffer = await file.arrayBuffer();
        // Преобразование ArrayBuffer в Buffer
        const buffer = Buffer.from(arrayBuffer);

        const extractor = getTextExtractor();
        const text = await extractor.extractText({ input: buffer, type: "buffer" }); // Используем тип "buffer"
        setInputMessage(text);
      } catch (error) {
        console.error("Ошибка при извлечении текста из файла:", error);
      }
    }
  };

  return (
    <div className="relative">
      <Card className="rounded-[20px] mb-8 z-50">
        <CardBody className="min-h-[90px]">
          <Textarea
            classNames={textareaClassNames}
            maxRows={30}
            minRows={1}
            placeholder="Вставьте текст сюда"
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
            onPress={handleSubmit}
          >
            <ArrowUp size={20} />
          </Button>
          <Button
            isIconOnly
            aria-label="Загрузить файл"
            className="absolute top-14 right-3 w-[34px] h-[34px] min-w-0"
            color="secondary"
            radius="lg"
          >
            <label htmlFor="file-upload" className="cursor-pointer">
              <Upload size={20} />
            </label>
          </Button>
          <input
            id="file-upload"
            type="file"
            style={{ display: "none" }}
            onChange={handleFileUpload}
          />
        </CardBody>
      </Card>
    </div>
  );
}