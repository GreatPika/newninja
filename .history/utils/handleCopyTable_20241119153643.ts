// utils/handleCopyTable.ts

const TABLE_REGEX = /\|.*\|.*\n\|[-|\s]*\|[-|\s]*\|\n(\|.*\|.*\n)+/g;

/**
 * Copies the first markdown table found in the provided text as TSV to the clipboard.
 *
 * @param {string} messageText - The text containing the markdown table.
 */
export function handleCopyTable(messageText: string): void {
  const tableMatch = TABLE_REGEX.exec(messageText);

  if (tableMatch) {
    const markdownTable = tableMatch[0];
    const rows = markdownTable
      .split("\n")
      .slice(2) // Skip header and separator rows
      .filter((row) => row.trim()) // Remove empty rows
      .map((row) => row.replace(/^\||\|$/g, "")); // Remove leading/trailing pipes

    const tsvContent = rows
      .map((row) =>
        row
          .split("|")
          .map((cell) => cell.trim().replace(/^-/, "–")) // Replace leading hyphen with en dash
          .join("\t"),
      )
      .join("\n");

    navigator.clipboard.writeText(tsvContent).catch(() => {});
  }
}
