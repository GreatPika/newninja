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
    { header: "Инструкция", key: "instruction", width: 50 },
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
        instruction: "", // Будет заполнено позже
      });
      currentRowNumber++;
    });

    if (startRow < currentRowNumber) {
      ["A", "B"].forEach((col) => {
        const range = `${col}${startRow}:${col}${currentRowNumber - 1}`;
        if (!isAlreadyMerged(worksheet, range)) {
          worksheet.mergeCells(range);
        }
        const cell = worksheet.getCell(`${col}${startRow}`);

        cell.alignment =
          col === "B"
            ? { ...defaultAlignment, vertical: "middle" }
            : defaultAlignment;
      });
    }
  });

  const mergedRanges = Object.values((worksheet as any)._merges).map(
    (merge: any) => merge.range
  );

  for (let row = 2; row < currentRowNumber; row++) {
    const colCValue = worksheet.getCell(`C${row}`).value?.toString() || "";
    const colDValue = worksheet.getCell(`D${row}`).value?.toString() || "";

    // Проверяем, находится ли текущая строка в объединенном диапазоне
    const isMerged = mergedRanges.some((range: string) => {
      const [start, end] = range.split(':');
      const startRow = Number(start.replace(/\D/g, ""));
      const endRow = Number(end.replace(/\D/g, ""));
      return row >= startRow && row <= endRow;
    });

    // Условие 1: Если значения в колонках C и D не содержат знаков ≥, ≤, >, <
    if (
      colCValue &&
      colDValue &&
      !/[≥≤><]/.test(colCValue) &&
      !/[≥≤><]/.test(colDValue)
    ) {
      worksheet.getCell(`F${row}`).value =
        "Значение характеристики не может изменяться участником закупки";
    }
    // Условие 2: Если значение в колонке D содержит знаки ≥, ≤, >, <
    else if (/[≥≤><]/.test(colDValue)) {
      worksheet.getCell(`F${row}`).value =
        "Участник закупки указывает в заявке конкретное значение характеристики";
    }
    // Условие 3: Если ячейка C объединена
    else if (isMerged) {
      const mergedRange = mergedRanges.find((range: string) => {
        const [start, end] = range.split(':');
        const startRow = Number(start.replace(/\D/g, ""));
        const endRow = Number(end.replace(/\D/g, ""));
        return row >= startRow && row <= endRow;
      });

      if (mergedRange) {
        const [start] = mergedRange.split(':');
        const startRow = Number(start.replace(/\D/g, ""));

        const instructionRange = `F${startRow}:${mergedRange.split(':')[1]}`;
        if (!isAlreadyMerged(worksheet, instructionRange)) {
          worksheet.mergeCells(instructionRange);
        }
        worksheet.getCell(`F${startRow}`).value =
          "Участник закупки указывает в заявке все значения характеристики";
      }
    }
  }

  worksheet.eachRow((row, rowNumber) => {
    row.eachCell((cell) => {
      cell.border = {
        top: { style: "thin" },
        bottom: { style: "thin" },
        left: { style: "thin" },
        right: { style: "thin" },
      };
      cell.alignment = { ...defaultAlignment, wrapText: true };

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

// Проверка, является ли диапазон уже объединенным
function isAlreadyMerged(worksheet: Worksheet, range: string): boolean {
  const mergedRanges = Object.values((worksheet as any)._merges).map(
    (merge: any) => merge.range
  );
  return mergedRanges.includes(range);
}
