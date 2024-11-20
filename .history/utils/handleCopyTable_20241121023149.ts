// utils/handleCopyTable.ts

const TABLE_REGEX = /\|.*\|.*\n\|[-|\s]*\|[-|\s]*\|\n(\|.*\|.*\n)+/;

/**
 * Копирует первую найденную Markdown-таблицу из предоставленного текста в буфер обмена в формате TSV.
 *
 * @param {string} messageText - Текст, содержащий Markdown-таблицу.
 */
export function handleCopyTable(messageText: string): void {
  const tableMatch = messageText.match(TABLE_REGEX);

  if (tableMatch) {
    const markdownTable = tableMatch[0];
    const rows = markdownTable
      .split("\n")
      .slice(2) // Пропускаем заголовок и разделитель
      .filter((row) => row.trim()) // Удаляем пустые строки
      .map((row) => row.replace(/^\||\|$/g, "")); // Удаляем ведущие/завершающие символы '|'

    const tsvContent = rows
      .map((row) =>
        row
          .split("|")
          .map((cell) => cell.trim().replace(/^-/, "–")) // Заменяем ведущий дефис на тире
          .join("\t"),
      )
      .join("\n");

    navigator.clipboard.writeText(tsvContent).catch(() => {});
  }
}
