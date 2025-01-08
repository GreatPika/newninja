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

  const topAlignment = { vertical: "top", horizontal: "center" } as const;
  const middleAlignment = { vertical: "middle", horizontal: "center" } as const;

  const mergeCellsInColumn = (
    sheet: Worksheet,
    column: string,
    startRow: number,
    endRow: number,
    value: any,
    alignment: { vertical: "top" | "middle"; horizontal: "center" },
  ) => {
    sheet.mergeCells(`${column}${startRow}:${column}${endRow}`);
    const cell = sheet.getCell(`${column}${startRow}`);
    cell.value = value;
    cell.alignment = alignment;
  };

  worksheet.columns = [
    { header: "№ п.п", key: "number", width: 10 },
    { header: "Наименование товара", key: "productName", width: 30 },
    ...resolvedTables[0].headers.map((header) => ({
      header,
      key: header,
      width: 30,
    })),
    { header: "Инструкция", key: "instruction", width: 40 },
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
        instruction: "",
      });
      currentRowNumber++;
    });

    if (startRow < currentRowNumber) {
      ["A", "B"].forEach((col) => {
        mergeCellsInColumn(
          worksheet,
          col,
          startRow,
          currentRowNumber - 1,
          worksheet.getCell(`${col}${startRow}`).value,
          col === "B" ? middleAlignment : topAlignment,
        );
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
        mergeCellsInColumn(
          worksheet,
          "C",
          mergeStart,
          row - 1,
          lastValue,
          topAlignment,
        );

        if (!worksheet.getCell(`F${mergeStart}`).isMerged) {
          mergeCellsInColumn(
            worksheet,
            "F",
            mergeStart,
            row - 1,
            "Участник закупки указывает в заявке все значения характеристики",
            topAlignment,
          );
        }
      }
      mergeStart = row;
      lastValue = cellValue as string;
    }

    if (row === lastDataRow && lastValue && row > mergeStart) {
      mergeCellsInColumn(
        worksheet,
        "C",
        mergeStart,
        row,
        lastValue,
        topAlignment,
      );

      if (!worksheet.getCell(`F${mergeStart}`).isMerged) {
        mergeCellsInColumn(
          worksheet,
          "F",
          mergeStart,
          row,
          "Участник закупки указывает в заявке все значения характеристики",
          topAlignment,
        );
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
      ...topAlignment,
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