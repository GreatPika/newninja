export function handleCopyTable(messageText: string): void {
  // Создаем временный DOM элемент для парсинга HTML
  const parser = new DOMParser();
  const doc = parser.parseFromString(messageText, "text/html");
  const table = doc.querySelector("table");

  if (table) {
    // Получаем все строки таблицы
    const rows = Array.from(table.querySelectorAll("tr"));

    // Преобразуем каждую строку в массив ячеек, исключая последнюю колонку
    const tsvContent = rows
      .map((row) => {
        const cells = Array.from(row.querySelectorAll("td, th"));
        return cells
          .slice(0, -1) // Пропускаем последнюю ячейку
          .map((cell) => cell.textContent?.trim() || "")
          .join("\t");
      })
      .join("\n");

    navigator.clipboard.writeText(tsvContent).catch(() => {});
  }
}
