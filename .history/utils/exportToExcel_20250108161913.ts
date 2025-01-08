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
      const instruction = getInstruction(row[0], row[1]);
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
        const cell = worksheet.getCell(`${col}${startRow}`);
        if (!cell.isMerged) {
          worksheet.mergeCells(`${col}${startRow}:${col}${currentRowNumber - 1}`);
          cell.alignment =
            col === "B"
              ? { ...defaultAlignment, vertical: "middle" }
              : defaultAlignment;
        }
      });
    }
  });

  let mergeStart = 2;
  let lastValueC = "";

  for (let row = 2; row <= currentRowNumber; row++) {
    const cellValueC = worksheet.getCell(`C${row}`).value;

    if (cellValueC) {
      if (row - 1 >= mergeStart) {
        const mergeCellC = worksheet.getCell(`C${mergeStart}`);
        const mergeCellF = worksheet.getCell(`F${mergeStart}`);

        if (!mergeCellC.isMerged) {
          // Объединяем ячейки в колонке C
          worksheet.mergeCells(`C${mergeStart}:C${row - 1}`);
          mergeCellC.value = lastValueC;
          
          // Объединяем ячейки в колонке F и устанавливаем специальное значение
          worksheet.mergeCells(`F${mergeStart}:F${row - 1}`);
          mergeCellF.value = "Участник закупки указывает в заявке все значения характеристики";
        }
      }
      mergeStart = row;
      lastValueC = cellValueC as string;
    }

    if (row === currentRowNumber && lastValueC && row > mergeStart) {
      const mergeCellC = worksheet.getCell(`C${mergeStart}`);
      const mergeCellF = worksheet.getCell(`F${mergeStart}`);

      if (!mergeCellC.isMerged) {
        // Объединяем ячейки в колонке C
        worksheet.mergeCells(`C${mergeStart}:C${row}`);
        mergeCellC.value = lastValueC;
        
        // Объединяем ячейки в колонке F и устанавливаем специальное значение
        worksheet.mergeCells(`F${mergeStart}:F${row}`);
        mergeCellF.value = "Участник закупки указывает в заявке все значения характеристики";
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

const getInstruction = (colC, colD) => {
  const containsComparisonOperators = (value) =>
    ["≥", "≤", ">", "<"].some((op) => value.includes(op));

  if (colC && colD) {
    if (!containsComparisonOperators(colC) && !containsComparisonOperators(colD)) {
      return "Значение характеристики не может изменяться участником закупки";
    }

    if (containsComparisonOperators(colD)) {
      return "Участник закупки указывает в заявке конкретное значение характеристики";
    }
  }

  return "Участник закупки указывает в заявке все значения характеристики";
};