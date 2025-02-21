import type { Workbook, Worksheet } from "exceljs";

import { saveAs } from "file-saver";

import { getAllMessages } from "./indexedDB";
import { parseMarkdownTable } from "./parseMarkdownTable";

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

  // Исключаем последнюю колонку из заголовков
  const headers = resolvedTables[0].headers.slice(0, -1);

  worksheet.columns = [
    { header: "№ п.п", key: "number", width: 10 },
    { header: "Наименование товара", key: "productName", width: 30 },
    ...headers.map((header) => ({
      header,
      key: header,
      width: 30,
    })),
    {
      header: "Инструкция по заполнению заявки",
      key: "instruction",
      width: 40,
    },
  ];

  let currentRowNumber = 2;

  resolvedTables.forEach((table, tableIndex) => {
    const startRow = currentRowNumber;

    table.rows.forEach((row) => {
      // Исключаем последний элемент из каждой строки
      const rowData = row.slice(0, -1);
      worksheet.addRow({
        number: tableIndex + 1,
        productName: table.productName,
        ...Object.fromEntries(
          headers.map((header, i) => [header, rowData[i] || ""]),
        ),
        instruction: "",
      });
      currentRowNumber++;
    });

    if (startRow < currentRowNumber) {
      // Объединение ячеек в колонках A и B для каждой таблицы
      ["A", "B"].forEach((col) => {
        worksheet.mergeCells(`${col}${startRow}:${col}${currentRowNumber - 1}`);
        const cell = worksheet.getCell(`${col}${startRow}`);

        cell.alignment =
          col === "B"
            ? { vertical: "middle", horizontal: "center" }
            : { vertical: "top", horizontal: "center" };
      });
    }
  });

  let mergeStart = 2;
  let lastValue = "";
  const lastDataRow = currentRowNumber - 1;

  for (let row = 2; row <= lastDataRow; row++) {
    const cellValue = worksheet.getCell(`C${row}`).value;

    if (cellValue) {
      if (row - 1 >= mergeStart) {
        worksheet.mergeCells(`C${mergeStart}:C${row - 1}`);
        const mergedCell = worksheet.getCell(`C${mergeStart}`);

        mergedCell.value = lastValue;
        if (!worksheet.getCell(`F${mergeStart}`).isMerged) {
          worksheet.mergeCells(`F${mergeStart}:F${row - 1}`);
          const instructionCell = worksheet.getCell(`F${mergeStart}`);

          instructionCell.value =
            "Участник закупки указывает в заявке все значения характеристики";
          instructionCell.alignment = { vertical: "top", horizontal: "center" };
        }
      }
      mergeStart = row;
      lastValue = cellValue as string;
    }

    if (row === lastDataRow && lastValue && row > mergeStart) {
      worksheet.mergeCells(`C${mergeStart}:C${row}`);
      const mergedCell = worksheet.getCell(`C${mergeStart}`);

      mergedCell.value = lastValue;
      if (!worksheet.getCell(`F${mergeStart}`).isMerged) {
        worksheet.mergeCells(`F${mergeStart}:F${row}`);
        const instructionCell = worksheet.getCell(`F${mergeStart}`);

        instructionCell.value =
          "Участник закупки указывает в заявке все значения характеристики";
        instructionCell.alignment = { vertical: "top", horizontal: "center" };
      }
    }
  }

  for (let row = 2; row <= lastDataRow; row++) {
    const cellC = worksheet.getCell(`C${row}`);
    const cellD = worksheet.getCell(`D${row}`);
    const cellF = worksheet.getCell(`F${row}`);

    if (!cellC.isMerged && cellC.value && cellD.value) {
      const valueD = cellD.value.toString();

      cellF.value = !/[≥≤><]/.test(valueD)
        ? "Значение характеристики не может изменяться участником закупки"
        : "Участник закупки указывает в заявке конкретное значение характеристики";
    }
  }

  const cellStyle = {
    border: {
      top: { style: "thin" },
      bottom: { style: "thin" },
      left: { style: "thin" },
      right: { style: "thin" },
    },
    alignment: {
      vertical: "top",
      horizontal: "center",
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
