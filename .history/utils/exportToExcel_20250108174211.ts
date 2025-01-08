import type { Workbook, Worksheet } from "exceljs";
import { saveAs } from "file-saver";
import { getAllMessages } from "./indexedDB";
import { parseMarkdownTable } from "./parseMarkdownTable";

export const exportMessagesToExcel = async () => {
  const ExcelJS = await import("exceljs");
  const workbook: Workbook = new ExcelJS.Workbook();
  const worksheet: Worksheet = workbook.addWorksheet("1");

  // Получение и обработка всех таблиц из сообщений
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

  // Определение колонок, включая новую колонку F "Инструкция"
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

  let currentRowNumber = 2; // Начинаем со второй строки (первая — заголовок)

  // Добавление строк с данными
  resolvedTables.forEach((table, tableIndex) => {
    const startRow = currentRowNumber;

    table.rows.forEach((row) => {
      worksheet.addRow({
        number: tableIndex + 1,
        productName: table.productName,
        ...Object.fromEntries(
          table.headers.map((header, i) => [header, row[i] || ""]),
        ),
        // instruction будет заполнен позже
      });
      currentRowNumber++;
    });

    if (startRow < currentRowNumber) {
      // Объединение ячеек в колонках A и B для текущей таблицы
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

  // Логика заполнения колонки F "Инструкция"
  // Получаем все объединенные диапазоны в колонке C
  const mergedCellsC = worksheet._merges.filter(
    (merge) => merge.s.col === 2, // Колонка C (индексация с 0)
  );

  // Функция для проверки наличия знаков сравнения
  const hasComparisonSigns = (value: string | null): boolean => {
    if (!value) return false;
    return ["≥", "≤", ">", "<"].some((sign) => value.includes(sign));
  };

  // Обработка объединенных ячеек в колонке C
  for (const merge of mergedCellsC) {
    const startRow = merge.s.r + 1; // exceljs использует нумерацию с 0
    const endRow = merge.e.r + 1;

    // Объединяем соответствующие ячейки в колонке F
    worksheet.mergeCells(`F${startRow}:F${endRow}`);
    const cellF = worksheet.getCell(`F${startRow}`);
    cellF.value =
      "Участник закупки указывает в заявке все значения характеристики";

    // Применяем выравнивание и стиль
    cellF.alignment = { vertical: "middle", horizontal: "center", wrapText: true };
  }

  // Обработка не объединенных ячеек в колонке C
  for (let i = 2; i < currentRowNumber; i++) {
    const cellC = worksheet.getCell(`C${i}`);
    const cellD = worksheet.getCell(`D${i}`);
    const cellF = worksheet.getCell(`F${i}`);

    // Проверяем, является ли ячейка частью объединенного диапазона
    const isMerged = mergedCellsC.some(
      (merge) => i >= merge.s.r + 1 && i <= merge.e.r + 1,
    );

    if (isMerged) {
      // Уже обработано в предыдущем цикле
      continue;
    }

    const valueC = cellC.value as string | null;
    const valueD = cellD.value as string | null;

    if (valueC && valueD) {
      if (
        !hasComparisonSigns(valueC) &&
        !hasComparisonSigns(valueD)
      ) {
        cellF.value =
          "Значение характеристики не может изменяться участником закупки";
      } else if (hasComparisonSigns(valueD)) {
        cellF.value =
          "Участник закупки указывает в заявке конкретное значение характеристики";
      }

      // Применяем выравнивание и стиль
      cellF.alignment = { vertical: "top", horizontal: "center", wrapText: true };
    }
  }

  // Удаление последней строки, если она пустая (по аналогии с макросом)
  worksheet.spliceRows(currentRowNumber, 1);

  // Определение стилей для всех ячеек
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

  // Применение стилей к каждой ячейке
  worksheet.eachRow((row, rowNumber) => {
    row.eachCell((cell) => {
      // Применяем границы и выравнивание
      cell.border = cellStyle.border;
      cell.alignment = cellStyle.alignment;

      if (rowNumber === 1) {
        // Для заголовка: жирный шрифт и центрирование
        cell.font = { bold: true };
        cell.alignment = { horizontal: "center", vertical: "middle", wrapText: true };
      }
    });
  });

  // Запись книги в буфер и сохранение файла
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });

  saveAs(blob, "Новый.xlsx");
};