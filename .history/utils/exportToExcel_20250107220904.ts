import type { Workbook, Worksheet, Cell, Alignment } from "exceljs";
import { saveAs } from "file-saver";
import { MessageDB } from "@/types";
import { getAllMessages } from "./indexedDB";

export const exportMessagesToExcel = async () => {
  const ExcelJS = await import("exceljs");
  const workbook: Workbook = new ExcelJS.Workbook();
  const worksheet: Worksheet = workbook.addWorksheet("Сообщения");

  // Настройка колонок
  worksheet.columns = [
    { header: "№", key: "index", width: 10 },
    { header: "Сообщение", key: "message", width: 100 },
    { header: "Роль", key: "role", width: 20 },
    { header: "Дата", key: "timestamp", width: 20 },
  ];

  // Получаем все сообщения
  const messages = await getAllMessages();
  const filteredMessages = messages.filter(msg => msg.role !== "user");

  // Заполняем данные
  filteredMessages.forEach((msg, index) => {
    worksheet.addRow({
      index: index + 1,
      message: msg.text,
      role: msg.role,
      timestamp: new Date(msg.timestamp).toLocaleString(),
    });
  });

  // Стилизация
  worksheet.getRow(1).eachCell((cell) => {
    cell.font = { bold: true };
    cell.alignment = { vertical: 'middle', horizontal: 'center' };
  });

  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });

  saveAs(blob, "chat-messages.xlsx");
}; 