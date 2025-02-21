"use client";
import "@/styles/editor-styles.css";
import {
  MDXEditor,
  MDXEditorMethods,
  headingsPlugin,
  toolbarPlugin,
  listsPlugin,
  quotePlugin,
  linkPlugin,
  linkDialogPlugin,
  imagePlugin,
  tablePlugin,
  thematicBreakPlugin,
  frontmatterPlugin,
  markdownShortcutPlugin,
  StrikeThroughSupSubToggles,
} from "@mdxeditor/editor";
import {
  UndoRedo,
  BoldItalicUnderlineToggles,
  InsertTable,
} from "@mdxeditor/editor";
import { FC, useRef, useState, useEffect } from "react";
import { useTheme } from "next-themes";

import { SymbolButton } from "./SymbolButton";

interface EditorProps {
  markdown: string;
  editorRef?: React.MutableRefObject<MDXEditorMethods | null>;
  onContentChange?: (content: string) => void;
  showToolbar?: boolean;
  sourceData?: Record<string, string>;
  onRowInfoChange?: (rowInfo: {
    activeRow: number | null;
    column4Value: string | null;
  }) => void;
}

const Editor: FC<EditorProps> = ({
  markdown,
  editorRef,
  onContentChange,
  showToolbar = true,
  sourceData,
  onRowInfoChange,
}) => {
  const { theme } = useTheme();
  const localEditorRef = useRef<MDXEditorMethods | null>(null);
  const [, setActiveRow] = useState<number | null>(null);
  const [, setColumn4Value] = useState<string | null>(null);

  const getEditorClassName = () => {
    return `${theme === "dark" ? "dark-theme dark-editor" : "light-editor"} custom-table-styles`;
  };

  const insertSymbolAtCursor = (symbol: string) => {
    const editor = editorRef?.current || localEditorRef.current;

    if (editor) {
      const escapedSymbol =
        symbol === "<" ? "&lt;" : symbol === ">" ? "&gt;" : symbol;

      editor.insertMarkdown(escapedSymbol);
    }
  };

  useEffect(() => {
    const handleClick = (e: Event) => {
      const target = e.target as HTMLElement;
      const cell = target.closest<HTMLTableCellElement>("td, th");

      if (cell) {
        const row = cell.closest("tr");
        const table = row?.closest("table");

        if (row && table) {
          const tbodyRows = Array.from(table.tBodies).flatMap((tbody) =>
            Array.from(tbody.rows),
          );

          const headerRowCount = table.tHead?.rows.length || 0;
          const rowIndex = tbodyRows.indexOf(row) + 1 + headerRowCount;

          // Получаем 5-ю колонку (индекс 4) текущей строки
          const cells = Array.from(row.cells);

          if (cells.length > 4) {
            const column4Content = cells[4]?.textContent?.trim() || null;
            const sourceValue =
              column4Content && sourceData
                ? sourceData[column4Content] || null
                : null;

            setColumn4Value(sourceValue?.toString() || column4Content || "н/д");
            onRowInfoChange?.({
              activeRow: rowIndex,
              column4Value: sourceValue?.toString() || column4Content || "н/д",
            });
          } else {
            setColumn4Value("н/д");
            onRowInfoChange?.({ activeRow: rowIndex, column4Value: "н/д" });
          }

          // Добавили вывод всех ячеек
          setActiveRow(rowIndex);

          return;
        }
      }

      setActiveRow(null);
      setColumn4Value(null);
    };

    const editorElement = document.querySelector<HTMLElement>(".mdxeditor");

    editorElement?.addEventListener("click", handleClick as EventListener);

    return () => {
      editorElement?.removeEventListener("click", handleClick as EventListener);
    };
  }, [sourceData, onRowInfoChange]);

  return (
    <div>
      <MDXEditor
        ref={editorRef || localEditorRef}
        className={getEditorClassName()}
        markdown={markdown || ""}
        plugins={[
          headingsPlugin(),
          listsPlugin(),
          quotePlugin(),
          linkPlugin(),
          linkDialogPlugin(),
          imagePlugin(),
          tablePlugin({ disableDelete: true }),
          thematicBreakPlugin(),
          frontmatterPlugin(),
          markdownShortcutPlugin(),
          ...(showToolbar
            ? [
                toolbarPlugin({
                  toolbarContents: () => (
                    <>
                      <UndoRedo />
                      <BoldItalicUnderlineToggles />
                      <StrikeThroughSupSubToggles />
                      <InsertTable />
                      <SymbolButton
                        symbol="≥"
                        title="Insert ≥"
                        onInsertSymbol={insertSymbolAtCursor}
                      />
                      <SymbolButton
                        symbol="≤"
                        title="Insert ≤"
                        onInsertSymbol={insertSymbolAtCursor}
                      />
                      <SymbolButton
                        symbol=">"
                        title="Insert >"
                        onInsertSymbol={insertSymbolAtCursor}
                      />
                      <SymbolButton
                        symbol="<"
                        title="Insert <"
                        onInsertSymbol={insertSymbolAtCursor}
                      />
                    </>
                  ),
                }),
              ]
            : []),
        ]}
        onChange={onContentChange}
      />
    </div>
  );
};

export default Editor;
