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
  TooltipWrap, // Импортируем TooltipWrap
} from "@mdxeditor/editor";
import {
  UndoRedo,
  BoldItalicUnderlineToggles,
  InsertTable,
} from "@mdxeditor/editor";
import { FC, useRef } from "react";
import { useTheme } from "next-themes";

interface EditorProps {
  markdown: string;
  editorRef?: React.MutableRefObject<MDXEditorMethods | null>;
  onContentChange?: (content: string) => void;
}

const Editor: FC<EditorProps> = ({ markdown, editorRef, onContentChange }) => {
  const { theme } = useTheme();
  const localEditorRef = useRef<MDXEditorMethods | null>(null);

  const getEditorClassName = () => {
    return theme === "dark" ? "dark-theme dark-editor" : "light-editor";
  };

  // Функция для вставки символа в позицию курсора
  const insertSymbolAtCursor = (symbol: string) => {
    const editor = editorRef?.current || localEditorRef.current;
    if (editor) {
      const escapedSymbol = symbol === "<" ? "&lt;" : symbol === ">" ? "&gt;" : symbol;
      editor.insertMarkdown(escapedSymbol);
    } else {
      console.error("Editor reference is not available.");
    }
  };

  // Компонент кнопки с тултипом
  const SymbolButton = ({ symbol, tooltip }: { symbol: string; tooltip: string }) => (
    <TooltipWrap title={tooltip}>
      <button
        onClick={() => insertSymbolAtCursor(symbol)}
        style={{
          backgroundColor: "transparent",
          border: "none",
          cursor: "pointer",
          padding: "5px",
          fontSize: "24px", // Размер символа на кнопке
        }}
      >
        {symbol}
      </button>
    </TooltipWrap>
  );

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
        toolbarPlugin({
          toolbarContents: () => (
            <>
              <UndoRedo />
              <BoldItalicUnderlineToggles />
              <StrikeThroughSupSubToggles />
              <InsertTable />
              {/* Добавляем кнопки с символами и тултипами */}
              <SymbolButton symbol="≥" tooltip="Вставить ≥" />
              <SymbolButton symbol="≤" tooltip="Вставить ≤" />
              <SymbolButton symbol="<" tooltip="Вставить <" />
              <SymbolButton symbol=">" tooltip="Вставить >" />
            </>
          ),
        }),
      ]}
      onChange={(content) => {
        if (onContentChange) {
          onContentChange(content);
        }
      }}
    />
  );
};

export default Editor;