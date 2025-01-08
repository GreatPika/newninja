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

  const defaultAlignment = { vertical: "top", horizontal: "center" } as const;

  worksheet.columns = [
    { header: "№ п.п", key: "number", width: 10 },
    { header: "Наименование товара", key: "productName", width: 30 },
    ...resolvedTables[0].headers.map((header) => ({
      header,
      key: header,
      width: 30,
    })),
    { header: "Инструкция", key: "instruction", width: 50 }, // Добавляем колонку F
  ];

  let currentRowNumber = 2;
  const mergeInfo: { startRow: number; endRow: number }[] = []; // Храним информацию об объединениях в колонке C

  resolvedTables.forEach((table, tableIndex) => {
    const startRow = currentRowNumber;

    table.rows.forEach((row) => {
      worksheet.addRow({
        number: tableIndex + 1,
        productName: table.productName,
        ...Object.fromEntries(
          table.headers.map((header, i) => [header, row[i] || ""]),
        ),
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

  // Объединение ячеек в колонке C и запись данных о диапазонах
  let mergeStart = 2;
  let lastValue = "";

  for (let row = 2; row <= currentRowNumber; row++) {
    const cellValue = worksheet.getCell(`C${row}`).value;

    if (cellValue) {
      if (row - 1 >= mergeStart) {
        worksheet.mergeCells(`C${mergeStart}:C${row - 1}`);
        mergeInfo.push({ startRow: mergeStart, endRow: row - 1 }); // Сохраняем диапазон объединения
      }
      mergeStart = row;
      lastValue = cellValue as string;
    }

    if (row === currentRowNumber && lastValue && row > mergeStart) {
      worksheet.mergeCells(`C${mergeStart}:C${row}`);
      mergeInfo.push({ startRow: mergeStart, endRow: row }); // Сохраняем диапазон объединения
    }
  }

  worksheet.spliceRows(currentRowNumber, 1);

  // Заполняем колонку F на основе правил
  mergeInfo.forEach(({ startRow, endRow }) => {
    worksheet.mergeCells(`F${startRow}:F${endRow}`);
    const mergedCellF = worksheet.getCell(`F${startRow}`);
    mergedCellF.value =
      "Участник закупки указывает в заявке все значения характеристики";
  });

  for (let row = 2; row <= currentRowNumber; row++) {
    const cellC = worksheet.getCell(`C${row}`);
    const cellD = worksheet.getCell(`D${row}`);
    const cellF = worksheet.getCell(`F${row}`);

    // Пропускаем строки, которые уже объединены
    if (mergeInfo.some(({ startRow, endRow }) => row >= startRow && row <= endRow)) {
      continue;
    }

    const valueC = cellC.value?.toString() || "";
    const valueD = cellD.value?.toString() || "";

    if (valueC && valueD) {
      if (!/[≥≤><]/.test(valueC)) {
        // Нет знаков сравнения
        cellF.value =
          "Значение характеристики не может изменяться участником закупки";
      } else {
        // Есть знаки сравнения
        cellF.value =
          "Участник закупки указывает в заявке конкретное значение характеристики";
      }
    }
  }

  // Применяем стили к колонке F
  worksheet.eachRow((row) => {
    row.eachCell((cell) => {
      Object.assign(cell, {
        border: {
          top: { style: "thin" },
          bottom: { style: "thin" },
          left: { style: "thin" },
          right: { style: "thin" },
        },
        alignment: { ...defaultAlignment, wrapText: true },
      });
      if (row.number === 1) {
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
