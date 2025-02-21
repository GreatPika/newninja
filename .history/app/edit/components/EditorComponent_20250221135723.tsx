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
  TableNode,
} from "@mdxeditor/editor";
import {
  UndoRedo,
  BoldItalicUnderlineToggles,
  InsertTable,
} from "@mdxeditor/editor";
import { FC, useRef, useState, useEffect } from "react";
import { useTheme } from "next-themes";
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { $getNodeByKey } from 'lexical';

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
  const [editor] = useLexicalComposerContext();
  const [activeCoords, setActiveCoords] = useState<{row: number; col: number} | null>(null);

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

  const handleCellClick = (cell: HTMLTableCellElement, rowIndex: number, colIndex: number) => {
    try {
      const table = cell.closest('table');
      const tableNodeKey = table?.dataset.nodeKey;
      
      if (tableNodeKey) {
        // Используем внутренний API MDX Editor через ref
        const editorInstance = editorRef?.current || localEditorRef.current;
        const rootNode = editorInstance?.rootNode;
        
        if (rootNode) {
          const tableNode = rootNode.getNodeByKey(tableNodeKey) as InstanceType<typeof TableNode>;
          const adjustedRow = rowIndex + 1; // Корректировка индекса
          const adjustedCol = colIndex + 1;
          
          console.log('Координаты:', {row: adjustedRow, col: adjustedCol});
          setActiveCoords({row: adjustedRow, col: adjustedCol});
        }
      }
    } catch (error) {
      console.error('Ошибка при обработке клика:', error);
    }
  };

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
          tablePlugin({
            cellAttributes: [
              (cell: HTMLTableCellElement, rowIndex: number, colIndex: number) => ({
                onClick: () => handleCellClick(cell, rowIndex, colIndex),
                'data-rowindex': rowIndex,
                'data-colindex': colIndex,
                style: { cursor: 'pointer' }
              })
            ]
          }),
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
      {activeCoords && (
        <div
          style={{
            marginTop: "10px",
            padding: "8px",
            backgroundColor: theme === "dark" ? "#333" : "#f0f0f0",
            color: theme === "dark" ? "#fff" : "#000",
            borderRadius: "4px",
          }}
        >
          Строка: {activeCoords.row}, Ячейка: {activeCoords.col}
        </div>
      )}
    </div>
  );
};

export default Editor;
