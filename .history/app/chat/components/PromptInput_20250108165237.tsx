import React, { useState, useRef } from "react";
import { Card, CardBody, Textarea, Button } from "@nextui-org/react";
import { ArrowUp, Upload } from "lucide-react";
import mammoth from "mammoth";

import { textareaClassNames } from "@/styles/styles";

interface PromptInputProps {
  onSubmit: (text: string) => void;
  disabled: boolean;
}

export function PromptInput({ onSubmit, disabled }: PromptInputProps) {
  const [inputMessage, setInputMessage] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Проверка типа файла
    if (file.type !== "application/vnd.openxmlformats-officedocument.wordprocessingml.document") {
      alert("Пожалуйста, загрузите файл в формате .docx");
      return;
    }

    const reader = new FileReader();
    reader.onload = async (e) => {
      const arrayBuffer = e.target?.result as ArrayBuffer;
      try {
        const result = await mammoth.extractRawText({ arrayBuffer });
        setInputMessage(result.value);
      } catch (error) {
        console.error("Ошибка при извлечении текста из файла:", error);
        alert("Не удалось извлечь текст из файла. Убедитесь, что файл не поврежден и имеет формат .docx.");
      }
    };
    reader.onerror = () => {
      console.error("Ошибка при чтении файла");
      alert("Ошибка при чтении файла. Пожалуйста, попробуйте еще раз.");
    };
    reader.readAsArrayBuffer(file);
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
            onPress={() => fileInputRef.current?.click()}
          >
            <Upload size={20} />
          </Button>
          <input
            type="file"
            ref={fileInputRef}
            style={{ display: "none" }}
            accept=".docx"
            onChange={handleFileUpload}
          />
        </CardBody>
      </Card>
    </div>
  );
}