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
    { header: "Инструкция", key: "instruction", width: 50 }, // Новая колонка F
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

  // Логика заполнения колонки "Инструкция"
  const lastRow = currentRowNumber - 1;
  let mergeStart = null;

  for (let i = 2; i <= lastRow; i++) {
    const cellC = worksheet.getCell(`C${i}`);
    const cellD = worksheet.getCell(`D${i}`);
    const cellF = worksheet.getCell(`F${i}`); // Новая колонка F ("Инструкция")

    if (cellC.isMerged) {
      const mergeArea = cellC.master; // Главная ячейка объединенного диапазона
      if (!mergeStart || mergeStart.row !== mergeArea.row) {
        mergeStart = mergeArea;
        const mergeEndRow = mergeStart.row + (mergeStart.rowSpan || 1) - 1;

        // Объединяем ячейки в колонке F
        worksheet.mergeCells(`F${mergeStart.row}:F${mergeEndRow}`);
        worksheet.getCell(`F${mergeStart.row}`).value =
          "Участник закупки указывает в заявке все значения характеристики";
      }
      i = mergeStart.row + (mergeStart.rowSpan || 1) - 1; // Пропускаем объединенные строки
    } else {
      if (
        cellC.value &&
        cellD.value &&
        !["≥", "≤", ">", "<"].some((sign) => cellC.value.includes(sign)) &&
        !["≥", "≤", ">", "<"].some((sign) => cellD.value.includes(sign))
      ) {
        cellF.value = "Значение характеристики не может изменяться участником закупки";
      } else if (
        ["≥", "≤", ">", "<"].some((sign) => cellD.value.includes(sign))
      ) {
        cellF.value = "Участник закупки указывает в заявке конкретное значение характеристики";
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