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
  ButtonWithTooltip,
} from "@mdxeditor/editor";
import {
  UndoRedo,
  BoldItalicUnderlineToggles,
  InsertTable,
} from "@mdxeditor/editor";
import { FC, useRef, useState, useEffect } from "react";
import { useTheme } from "next-themes";

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
    return theme === "dark" ? "dark-theme dark-editor" : "light-editor";
  };

  const insertSymbolAtCursor = (symbol: string) => {
    const editor = editorRef?.current || localEditorRef.current;

    if (editor) {
      const escapedSymbol =
        symbol === "<" ? "&lt;" : symbol === ">" ? "&gt;" : symbol;

      editor.insertMarkdown(escapedSymbol);
    } else {
    }
  };

  const SymbolButton = ({
    symbol,
    title,
  }: {
    symbol: string;
    title: string;
  }) => (
    <ButtonWithTooltip
      style={{
        margin: "0", // Убираем расстояние между кнопками
        padding: "0", // Убираем внутренние отступы
      }}
      title={title}
      onClick={() => insertSymbolAtCursor(symbol)}
    >
      <span
        style={{
          fontSize: "24px", // Размер символа
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          width: "28px", // Ширина кнопки
          height: "28px", // Высота кнопки
          borderRadius: "4px", // Небольшой радиус для скругления
          color: theme === "dark" ? "white" : "black", // Цвет текста в зависимости от темы
        }}
      >
        {symbol}
      </span>
    </ButtonWithTooltip>
  );

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
      <style jsx global>{`
        .mdxeditor {
          width: 100%;
        }
        .mdxeditor table {
          width: 100%;
          table-layout: fixed;
          border-collapse: collapse;
          margin: 0;
          padding: 0;
        }
        
        /* Явно задаем ширину для первых 4 колонок */
        .mdxeditor table tr th:nth-child(1),
        .mdxeditor table tr td:nth-child(1) {
          width: 25%;
        }
        .mdxeditor table tr th:nth-child(2),
        .mdxeditor table tr td:nth-child(2) {
          width: 25%;
        }
        .mdxeditor table tr th:nth-child(3),
        .mdxeditor table tr td:nth-child(3) {
          width: 25%;
        }
        .mdxeditor table tr th:nth-child(4),
        .mdxeditor table tr td:nth-child(4) {
          width: 25%;
        }
        
        /* Полностью скрываем 5-ю колонку */
        .mdxeditor table tr th:nth-child(5),
        .mdxeditor table tr td:nth-child(5) {
          width: 0 !important;
          padding: 0 !important;
          border: none !important;
          visibility: collapse;
          display: none;
          position: absolute;
          clip: rect(0 0 0 0);
          clip-path: inset(50%);
          max-width: 0;
          max-height: 0;
          overflow: hidden;
        }

        /* Убираем лишние отступы у строк */
        .mdxeditor table tr {
          width: 100%;
          margin: 0;
          padding: 0;
        }
      `}</style>
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
          tablePlugin(),
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
                      <SymbolButton symbol="≥" title="Insert ≥" />
                      <SymbolButton symbol="≤" title="Insert ≤" />
                      <SymbolButton symbol=">" title="Insert >" />
                      <SymbolButton symbol="<" title="Insert <" />
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
