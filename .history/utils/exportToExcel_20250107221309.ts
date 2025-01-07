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
  const headers = lines[0]
    .split("|")
    .map((header) => header.trim())
    .filter(Boolean);

  // Пропускаем разделительную строку (---|---|---)
  const rows = lines
    .slice(2)
    .map((line) =>
      line
        .split("|")
        .map((cell) => cell.trim())
        .filter(Boolean),
    )
    .filter((row) => row.length > 0);

  return { headers, rows };
};

export const exportMessagesToExcel = async () => {
  const ExcelJS = await import("exceljs");
  const workbook: Workbook = new ExcelJS.Workbook();
  const worksheet: Worksheet = workbook.addWorksheet("Данные");

  // Получаем все сообщения
  const messages = await getAllMessages();
  const assistantMessages = messages.filter((msg) => msg.role !== "user");

  // Ищем первую markdown таблицу
  let tableData = null;

  for (const msg of assistantMessages) {
    const parsed = parseMarkdownTable(msg.text);

    if (parsed) {
      tableData = parsed;
      break;
    }
  }

  if (!tableData) {
    console.error("Markdown таблица не найдена");

    return;
  }

  // Настраиваем колонки
  worksheet.columns = tableData.headers.map((header) => ({
    header,
    key: header,
    width: 30,
  }));

  // Добавляем данные
  tableData.rows.forEach((row) => {
    const rowData = {};

    tableData.headers.forEach((header, index) => {
      rowData[header] = row[index] || "";
    });
    worksheet.addRow(rowData);
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
