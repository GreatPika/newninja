import type { Workbook, Worksheet, Cell } from "exceljs";

import { saveAs } from "file-saver";

import { getAllMessages } from "./indexedDB";

const parseMarkdownTable = (markdown: string) => {
  const lines = markdown.trim().split("\n");

  // Пропускаем, если это не похоже на таблицу
  if (lines.length < 2 || !lines[0].includes("|")) {
    return null;
  }

  // Получаем заголовки и данные
  const headers = lines[0].split("|").map((header) => header.trim());

  // Пропускаем разделительную строку (---|---|---)
  const rows = lines
    .slice(2)
    .map((line) => line.split("|").map((cell) => cell.trim()));

  return { headers, rows };
};

export const exportMessagesToExcel = async () => {
  const ExcelJS = await import("exceljs");
  const workbook: Workbook = new ExcelJS.Workbook();
  const worksheet: Worksheet = workbook.addWorksheet("Данные");

  // Получаем все сообщения
  const messages = await getAllMessages();
  const assistantMessages = messages.filter((msg) => msg.role !== "user");

  // Собираем все таблицы из сообщений
  const allTables: { headers: string[]; rows: string[][] }[] = [];

  for (const msg of assistantMessages) {
    const parsed = parseMarkdownTable(msg.text);

    if (parsed) {
      allTables.push(parsed);
    }
  }

  if (allTables.length === 0) {
    return;
  }

  // Настраиваем колонки
  worksheet.columns = allTables[0].headers.map((header, index) => ({
    header: index === 0 ? "№ п.п" : header,
    key: header,
    width: index === 0 ? 10 : 30,
  }));

  // Добавляем данные из всех таблиц
  let tableNumber = 1;
  let currentRowNumber = 2; // Начинаем с 2, так как 1-я строка - это заголовки

  allTables.forEach((table) => {
    const startRow = currentRowNumber;
    let rowNumber = 1; // Счетчик для строк внутри таблицы
    
    table.rows.forEach((row) => {
      const rowData: Record<string, string | number> = {
        "№ п.п": `${tableNumber}.${rowNumber}` // Формат: "1.1", "1.2", "2.1", "2.2" и т.д.
      };
      
      table.headers.forEach((header, index) => {
        rowData[header] = row[index] || "";
      });
      worksheet.addRow(rowData);
      currentRowNumber++;
      rowNumber++;
    });

    // Объединять ячейки больше не нужно, так как у каждой строки свой номер
    tableNumber++;
  });

  // Стилизация
  const setCellStyle = (cell: Cell) => {
    cell.border = {
      top: { style: "thin" },
      bottom: { style: "thin" },
      left: { style: "thin" },
      right: { style: "thin" },
    };
    cell.alignment = {
      vertical: "top",
      horizontal: "left",
      wrapText: true,
    };
  };

  // Применяем стили к каждой ячейке
  worksheet.eachRow((row, rowNumber) => {
    row.eachCell((cell) => {
      setCellStyle(cell);
      if (rowNumber === 1) {
        cell.font = { bold: true };
        cell.alignment = { horizontal: "center" };
      }
    });
  });

  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });

  saveAs(blob, "table-export.xlsx");
};
