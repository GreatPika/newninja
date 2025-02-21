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
import { ActiveRowInfo } from "./ActiveRowInfo";

interface EditorProps {
  markdown: string;
  editorRef?: React.MutableRefObject<MDXEditorMethods | null>;
  onContentChange?: (content: string) => void;
  showToolbar?: boolean;
  sourceData?: Record<string, string>;
  onActiveRowChange?: (row: number | null) => void;
  onColumn4ValueChange?: (value: string | null) => void;
}

const Editor: FC<EditorProps> = ({
  markdown,
  editorRef,
  onContentChange,
  showToolbar = true,
  sourceData,
  onActiveRowChange,
  onColumn4ValueChange,
}) => {
  const { theme } = useTheme();
  const localEditorRef = useRef<MDXEditorMethods | null>(null);
  const [activeRow, setActiveRow] = useState<number | null>(null);
  const [column4Value, setColumn4Value] = useState<string | null>(null);

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

            setColumn4Value(
              sourceValue?.toString() ||
              column4Content ||
              null
            );
          } else {
            setColumn4Value(null);
          }

          // Добавили вывод всех ячеек
          setActiveRow(rowIndex);

          if (onActiveRowChange) onActiveRowChange(rowIndex);
          if (onColumn4ValueChange) onColumn4ValueChange(column4Value);

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
  }, [sourceData, onActiveRowChange, onColumn4ValueChange]);

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
