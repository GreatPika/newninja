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
    { header: "Инструкция", key: "instruction", width: 40 }, // Добавляем колонку "Инструкция"
  ];

  let currentRowNumber = 2;

  // Добавляем строки в таблицу и отслеживаем последнюю строку с данными
  resolvedTables.forEach((table, tableIndex) => {
    const startRow = currentRowNumber;

    table.rows.forEach((row) => {
      worksheet.addRow({
        number: tableIndex + 1,
        productName: table.productName,
        ...Object.fromEntries(
          table.headers.map((header, i) => [header, row[i] || ""]),
        ),
        instruction: "", // Инициализируем колонку "Инструкция" пустыми значениями
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

  // Логика объединения ячеек в колонках C и F
  let mergeStart = 2;
  let lastValue = worksheet.getCell(`C${mergeStart}`).value;

  for (let row = mergeStart + 1; row <= currentRowNumber; row++) {
    const currentValue = worksheet.getCell(`C${row}`).value;

    if (currentValue !== lastValue) {
      if (row - 1 > mergeStart) {
        // Объединяем ячейки в колонке C
        worksheet.mergeCells(`C${mergeStart}:C${row - 1}`);
        const mergedCell = worksheet.getCell(`C${mergeStart}`);
        mergedCell.value = lastValue;

        // Объединяем ячейки в колонке F
        worksheet.mergeCells(`F${mergeStart}:F${row - 1}`);
        const instructionCell = worksheet.getCell(`F${mergeStart}`);
        instructionCell.value =
          "Участник закупки указывает в заявке все значения характеристики";
        instructionCell.alignment = defaultAlignment;
      }
      mergeStart = row;
      lastValue = currentValue;
    }
  }

  // Обработка последнего диапазона объединения
  if (mergeStart < currentRowNumber) {
    worksheet.mergeCells(`C${mergeStart}:C${currentRowNumber}`);
    const mergedCell = worksheet.getCell(`C${mergeStart}`);
    mergedCell.value = lastValue;

    worksheet.mergeCells(`F${mergeStart}:F${currentRowNumber}`);
    const instructionCell = worksheet.getCell(`F${mergeStart}`);
    instructionCell.value =
      "Участник закупки указывает в заявке все значения характеристики";
    instructionCell.alignment = defaultAlignment;
  }

  // Обработка не объединенных ячеек
  for (let row = 2; row <= currentRowNumber; row++) {
    const cellC = worksheet.getCell(`C${row}`);
    const cellD = worksheet.getCell(`D${row}`);
    const cellF = worksheet.getCell(`F${row}`);

    if (!cellC.isMerged && cellC.value && cellD.value) {
      const valueD = cellD.value.toString();

      if (!/[≥≤><]/.test(valueD)) {
        cellF.value =
          "Значение характеристики не может изменяться участником закупки";
      } else {
        cellF.value =
          "Участник закупки указывает в заявке конкретное значение характеристики";
      }
    }
  }

  // Применение стилей к ячейкам
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

  // Сохранение файла
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });

  saveAs(blob, "Новый.xlsx");
};