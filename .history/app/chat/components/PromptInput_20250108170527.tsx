import React, { useState } from "react";
import { Card, CardBody, Textarea, Button } from "@nextui-org/react";
import { ArrowUp, Upload } from "lucide-react";
import * as mammoth from "mammoth";

import { textareaClassNames } from "@/styles/styles";

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

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];

    if (file && file.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document") {
      try {
        // Преобразуем файл в ArrayBuffer
        const arrayBuffer = await file.arrayBuffer();

        // Извлекаем текст с помощью mammoth.js
        const result = await mammoth.extractRawText({ arrayBuffer });
        setInputMessage(result.value); // Устанавливаем извлечённый текст в textarea
      } catch (err) {
        console.error("Ошибка при обработке файла:", err);
        alert("Не удалось извлечь текст из файла. Возможно, файл повреждён или содержит неподдерживаемые элементы.");
      }
    } else {
      alert("Пожалуйста, загрузите файл формата .docx");
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
            className="absolute top-12 right-3 w-[34px] h-[34px] min-w-0"
            color="secondary"
            radius="lg"
            disabled={disabled}
            as="label"
          >
            <input
              type="file"
              accept=".docx"
              hidden
              onChange={handleFileUpload}
            />
            <Upload size={20} />
          </Button>
        </CardBody>
      </Card>
    </div>
  );
}