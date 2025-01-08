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
        instruction: "Участник закупки указывает в заявке все значения характеристики",
      });
      currentRowNumber++;
    });

    if (startRow < currentRowNumber) {
      ["A", "B"].forEach((col) => {
        const cell = worksheet.getCell(`${col}${startRow}`);
        if (!cell.isMerged) {
          worksheet.mergeCells(`${col}${startRow}:${col}${currentRowNumber - 1}`);
          cell.alignment =
            col === "B"
              ? { ...defaultAlignment, vertical: "middle" }
              : defaultAlignment;
        }
      });

      const instructionCell = worksheet.getCell(`F${startRow}`);
      if (!instructionCell.isMerged) {
        worksheet.mergeCells(`F${startRow}:F${currentRowNumber - 1}`);
        instructionCell.value = "Участник закупки указывает в заявке все значения характеристики";
        instructionCell.alignment = { ...defaultAlignment, wrapText: true };
      }
    }
  });

  let mergeStart = 2;
  let lastValueC = "";

  for (let row = 2; row <= currentRowNumber; row++) {
    const cellValueC = worksheet.getCell(`C${row}`).value;

    if (cellValueC) {
      if (row - 1 >= mergeStart) {
        const mergeCellC = worksheet.getCell(`C${mergeStart}`);

        if (!mergeCellC.isMerged) {
          worksheet.mergeCells(`C${mergeStart}:C${row - 1}`);
          mergeCellC.value = lastValueC;
        }
      }
      mergeStart = row;
      lastValueC = cellValueC as string;
    }

    if (row === currentRowNumber && lastValueC && row > mergeStart) {
      const mergeCellC = worksheet.getCell(`C${mergeStart}`);

      if (!mergeCellC.isMerged) {
        worksheet.mergeCells(`C${mergeStart}:C${row}`);
        mergeCellC.value = lastValueC;
      }
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
