import type { Workbook, Worksheet } from "exceljs";

import { saveAs } from "file-saver";
import { marked } from "marked";

import { getAllMessages } from "./indexedDB";

const parseMarkdownTable = async (markdown: string) => {
  const html = await marked.parse(markdown);
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, "text/html");
  const table = doc.querySelector("table");

  if (!table) return null;

  const headers = Array.from(table.querySelectorAll("thead th")).map(
    (th) => th.textContent?.trim() || "",
  );

  const rows = Array.from(table.querySelectorAll("tbody tr")).map((tr) =>
    Array.from(tr.querySelectorAll("td")).map(
      (td) => td.textContent?.trim() || "",
    ),
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
      async (tables, msg) => {
        const parsed = await parseMarkdownTable(msg.text);

        return parsed
          ? [...(await tables), { ...parsed, productName: msg.role }]
          : await tables;
      },
      Promise.resolve([]) as Promise<
        { headers: string[]; rows: string[][]; productName: string }[]
      >,
    );

  const resolvedTables = await allTables;

  if (resolvedTables.length === 0) return;

  const defaultAlignment = { vertical: "top", horizontal: "center" } as const;

  worksheet.columns = [
    { header: "№ п.п", key: "number", width: 10 },
    { header: "Наименование товара", key: "productName", width: 30 },
    ...resolvedTables[0].headers.map((header) => ({
      header,
      key: header,
      width: 30,
    })),
    { header: "Инструкция", key: "instruction", width: 30 },
  ];

  let currentRowNumber = 2;

  resolvedTables.forEach((table, tableIndex) => {
    const startRow = currentRowNumber;

    table.rows.forEach((row) => {
      worksheet.addRow({
        number: tableIndex + 1,
        productName: table.productName,
        ...Object.fromEntries(
          table.headers.map((header, i) => [header, row[i] || ""]),
        ),
        instruction: "", // Будет заполнено ниже
      });
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
    }
  });

  let mergeStart = 2;
  let lastValue = "";

  for (let row = 2; row <= currentRowNumber; row++) {
    const cellValue = worksheet.getCell(`C${row}`).value;

    if (cellValue) {
      if (row - 1 >= mergeStart) {
        worksheet.mergeCells(`C${mergeStart}:C${row - 1}`);
        worksheet.mergeCells(`F${mergeStart}:F${row - 1}`);
        const mergedCell = worksheet.getCell(`C${mergeStart}`);
        const mergedInstructionCell = worksheet.getCell(`F${mergeStart}`);

        mergedCell.value = lastValue;
        mergedInstructionCell.value = "Участник закупки указывает в заявке все значения характеристики";
      }
      mergeStart = row;
      lastValue = cellValue as string;
    }

    const colCValue = worksheet.getCell(`C${row}`).value?.toString() || "";
    const colDValue = worksheet.getCell(`D${row}`).value?.toString() || "";

    if (row === currentRowNumber && lastValue && row > mergeStart) {
      worksheet.mergeCells(`C${mergeStart}:C${row}`);
      worksheet.mergeCells(`F${mergeStart}:F${row}`);
      const mergedCell = worksheet.getCell(`C${mergeStart}`);
      const mergedInstructionCell = worksheet.getCell(`F${mergeStart}`);

      mergedCell.value = lastValue;
      mergedInstructionCell.value = "Участник закупки указывает в заявке все значения характеристики";
    }

    // Проверка значений C и D для определения инструкции
    if (
      colCValue &&
      colDValue &&
      !/[≥≤><]/.test(colCValue) &&
      !/[≥≤><]/.test(colDValue)
    ) {
      worksheet.getCell(`F${row}`).value = "Значение характеристики не может изменяться участником закупки";
    } else if (/[≥≤><]/.test(colDValue)) {
      worksheet.getCell(`F${row}`).value = "Участник закупки указывает в заявке конкретное значение характеристики";
    }
  }

  worksheet.spliceRows(currentRowNumber, 1);

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
