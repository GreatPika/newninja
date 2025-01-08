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
      console.log(`Обработка строки: ${JSON.stringify(row)}`);

      const instruction = determineInstruction(row);
      worksheet.addRow({
        number: tableIndex + 1,
        productName: table.productName,
        ...Object.fromEntries(
          table.headers.map((header, i) => [header, row[i] || ""]),
        ),
        instruction,
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

    if (cellValue && lastValue === "") {
      if (row - 1 > mergeStart) {
        worksheet.mergeCells(`C${mergeStart}:C${row - 1}`);
      }
      mergeStart = row;
    } else if (!cellValue && lastValue) {
      mergeStart = row;
    }

    lastValue = cellValue as string;
  }

  if (lastValue === "" && currentRowNumber > mergeStart) {
    worksheet.mergeCells(`C${mergeStart}:C${currentRowNumber - 1}`);
  }

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

function determineInstruction(row: string[]): string {
  const valueC = row[2] || "";
  const valueD = row[3] || "";

  console.log(`Значения C: ${valueC}, D: ${valueD}`);

  if (valueC && valueD) {
    if (!/[≥≤><]/.test(valueC) && !/[≥≤><]/.test(valueD)) {
      return "Значение характеристики не может изменяться участником закупки";
    } else if (/[≥≤><]/.test(valueD)) {
      return "Участник закупки указывает в заявке конкретное значение характеристики";
    }
  }

  return "";
}
