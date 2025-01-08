import React, { useState } from "react";
import { Card, CardBody, Textarea, Button } from "@nextui-org/react";
import { ArrowUp, Upload } from "lucide-react"; // Иконка для загрузки файла
import * as mammoth from "mammoth"; // Импортируем библиотеку mammoth для работы с .docx

import { textareaClassNames } from "@/styles/styles";

interface PromptInputProps {
  onSubmit: (text: string) => void;
  disabled: boolean;
}

export function PromptInput({ onSubmit, disabled }: PromptInputProps) {
  const [inputMessage, setInputMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

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

  // Функция для обработки загрузки .docx файла и извлечения текста с помощью mammoth
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document") {
      try {
        setErrorMessage(""); // Сброс ошибки перед новой загрузкой
        const arrayBuffer = await file.arrayBuffer();
        
        // Попробуем открыть файл и проверить его содержимое перед использованием
        const fileBlob = new Blob([arrayBuffer]);
        const fileURL = URL.createObjectURL(fileBlob);
        const response = await fetch(fileURL);
        const data = await response.blob();
        
        // Используем mammoth для извлечения текста
        mammoth.extractRawText({ arrayBuffer })
          .then((result) => {
            setInputMessage(result.value); // Устанавливаем текст в textarea
          })
          .catch((err) => {
            console.error("Ошибка при извлечении текста:", err);
            setErrorMessage("Не удалось извлечь текст из файла.");
          });
      } catch (err) {
        console.error("Ошибка при обработке файла:", err);
        setErrorMessage("Произошла ошибка при загрузке файла.");
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
          {/* Кнопка для загрузки файла */}
          <Button
            isIconOnly
            aria-label="Загрузить файл"
            className="absolute top-12 right-3 w-[34px] h-[34px] min-w-0"
            color="secondary"
            radius="lg"
            disabled={disabled}
            as="label" // Делаем кнопку элементом <label> для выбора файла
          >
            <input
              type="file"
              accept=".docx"
              hidden
              onChange={handleFileUpload} // Обработчик для загрузки файла
            />
            <Upload size={20} />
          </Button>
          {errorMessage && (
            <div className="text-red-600 mt-2">{errorMessage}</div> // Показать сообщение об ошибке
          )}
        </CardBody>
      </Card>
    </div>
  );
}
