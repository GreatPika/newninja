import type { Workbook, Worksheet } from "exceljs";

import { saveAs } from "file-saver";

import { getAllMessages } from "./indexedDB";

const parseMarkdownTable = (markdown: string) => {
  const lines = markdown.trim().split("\n");

  if (lines.length < 2 || !lines[0].includes("|")) return null;

  const headers = lines[0]
    .split("|")
    .map((header) => header.trim())
    .filter((header) => header !== "");

  const rows = lines.slice(2).map((line) =>
    line
      .split("|")
      .map((cell) => cell.trim())
      .filter((_, index) => lines[0].split("|")[index].trim() !== ""),
  );

  return { headers, rows };
};

export const exportMessagesToExcel = async () => {
  const ExcelJS = await import("exceljs");
  const workbook: Workbook = new ExcelJS.Workbook();
  const worksheet: Worksheet = workbook.addWorksheet("1");

  const allTables = (await getAllMessages())
    .filter((msg) => msg.role !== "user")
    .reduce(
      (tables, msg) => {
        const parsed = parseMarkdownTable(msg.text);

        return parsed
          ? [...tables, { ...parsed, productName: msg.role }]
          : tables;
      },
      [] as { headers: string[]; rows: string[][]; productName: string }[],
    );

  if (allTables.length === 0) return;

  const defaultAlignment = { vertical: "top", horizontal: "center" } as const;

  worksheet.columns = [
    { header: "№ п.п", key: "number", width: 10 },
    { header: "Наименование товара", key: "productName", width: 30 },
    ...allTables[0].headers.map((header) => ({
      header,
      key: header,
      width: 30,
    })),
  ];

  let currentRowNumber = 2;

  allTables.forEach((table, tableIndex) => {
    const startRow = currentRowNumber;
    let lastNonEmptyRow = startRow;

    table.rows.forEach((row) => {
      const newRow = worksheet.addRow({
        number: tableIndex + 1,
        productName: table.productName,
        ...Object.fromEntries(
          table.headers.map((header, i) => [header, row[i] || ""]),
        ),
      });

      if (row[0]) {
        lastNonEmptyRow = currentRowNumber;
      }

      currentRowNumber++;
    });

    if (startRow < currentRowNumber) {
      ["A", "B"].forEach((col) => {
        worksheet.mergeCells(`${col}${startRow}:${col}${currentRowNumber - 1}`);
        const cell = worksheet.getCell(`${col}${startRow}`);

        cell.alignment =
          col === "B"
            ? { ...defaultAlignment, vertical: "middle" }
            : defaultAlignment;
      });

      worksheet.mergeCells(`C${lastNonEmptyRow}:C${currentRowNumber - 1}`);
    }
  });

  const cellStyle = {
    border: {
      top: { style: "thin" },
      bottom: { style: "thin" },
      left: { style: "thin" },
      right: { style: "thin" },
    },
    alignment: {
      ...defaultAlignment,
      wrapText: true,
    },
  };

  worksheet.eachRow((row, rowNumber) => {
    row.eachCell((cell) => {
      Object.assign(cell, cellStyle);
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

  saveAs(blob, "Новый.xlsx");
};
