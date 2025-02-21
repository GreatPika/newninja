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
}

const Editor: FC<EditorProps> = ({
  markdown,
  editorRef,
  onContentChange,
  showToolbar = true,
}) => {
  const { theme } = useTheme();
  const localEditorRef = useRef<MDXEditorMethods | null>(null);
  const [activeRow, setActiveRow] = useState<number | null>(null);
  const [activeCell, setActiveCell] = useState<number | null>(null);

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
      const cell = target.closest<HTMLTableCellElement>('td, th');
      
      if (cell) {
        const row = cell.closest('tr');
        const table = row?.closest('table');
        
        if (row && table) {
          const tbodyRows = Array.from(table.tBodies)
            .flatMap(tbody => Array.from(tbody.rows))
            .filter(row => row.style.display !== 'none'); // Игнорируем скрытые строки

          const headerRowCount = table.tHead?.rows.length || 0;
          const rowIndexInTbody = tbodyRows.indexOf(row);
          
          console.log('Данные для отладки:', {
            table,
            allBodies: table.tBodies,
            tbodyRowsCount: tbodyRows.length,
            headerRowCount,
            rowIndexInTbody,
            cellsInRow: row.cells.length,
            cellIndex: Array.from(row.cells).indexOf(cell)
          });

          const adjustedRowIndex = headerRowCount + rowIndexInTbody + 1;
          const cellIndex = Array.from(row.cells).indexOf(cell) + 1;
          
          setActiveRow(adjustedRowIndex);
          setActiveCell(cellIndex);
          return;
        }
      }
      
      setActiveRow(null);
      setActiveCell(null);
    };

    const editorElement = document.querySelector<HTMLElement>(".mdxeditor");

    editorElement?.addEventListener("click", handleClick as EventListener);

    return () => {
      editorElement?.removeEventListener("click", handleClick as EventListener);
    };
  }, []);

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
      {activeRow !== null && (
        <div
          style={{
            marginTop: "10px",
            padding: "8px",
            backgroundColor: theme === "dark" ? "#333" : "#f0f0f0",
            color: theme === "dark" ? "#fff" : "#000",
            borderRadius: "4px",
          }}
        >
          Активная строка: {activeRow}, Ячейка: {activeCell}
        </div>
      )}
    </div>
  );
};

export default Editor;
