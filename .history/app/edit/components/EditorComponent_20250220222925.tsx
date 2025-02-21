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
import { FC, useRef, useCallback } from "react";
import { useTheme } from "next-themes";
import { $getSelection, $isRangeSelection, $getNodeByKey, $findMatchingParent, $isTableNode, $isTableCellNode } from "@lexical/markdown";

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

  const handleEditorChange = useCallback((markdown: string) => {
    onContentChange?.(markdown);
    
    const editor = editorRef?.current || localEditorRef.current;
    editor?.focus(() => {
      const selection = $getSelection();
      
      if (selection && $isRangeSelection(selection)) {
        const node = $getNodeByKey(selection.focus.key);
        const tableNode = $findMatchingParent(node, $isTableNode);
        
        if (tableNode) {
          const [rowIndex, cellIndex] = tableNode.getCordsFromCellNode(
            $findMatchingParent(node, $isTableCellNode)
          );
          console.log(`Cursor in table cell: [${rowIndex}, ${cellIndex}]`);
        }
      }
    });
  }, [onContentChange, editorRef]);

  return (
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
      onChange={handleEditorChange}
    />
  );
};

export default Editor;
