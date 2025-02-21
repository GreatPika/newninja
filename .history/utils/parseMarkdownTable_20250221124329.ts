import { marked } from "marked";

export const parseMarkdownTable = async (markdown: string) => {
  try {
    const html = await marked.parse(markdown);
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, "text/html");
    const table = doc.querySelector("table");

    if (!table) return null;

    const headers = Array.from(table.querySelectorAll("thead th")).map(
      (th) => th.textContent?.trim() || ""
    );

    const rows = Array.from(table.querySelectorAll("tbody tr")).map((tr) => {
      const cells = Array.from(tr.querySelectorAll("td"));
      
      while (cells.length < headers.length) {
        cells.push(document.createElement("td"));
      }
      
      return cells.map((td) => {
        const content = td.textContent?.trim() || "";
        return content;
      });
    });

    return { 
      headers: headers.filter(h => h),
      rows: rows.filter(r => r.some(cell => cell))
    };
  } catch (error) {
    console.error("Error parsing markdown table:", error);
    return null;
  }
};
