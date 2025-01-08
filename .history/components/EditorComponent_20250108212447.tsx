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
  ButtonWithTooltip, // Импортируем ButtonWithTooltip
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
  const SymbolButton = ({ symbol, title }: { symbol: string; title: string }) => (
    <ButtonWithTooltip
      onClick={() => insertSymbolAtCursor(symbol)}
      title={title} // Используем title для тултипа
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
          boxSizing: "border-box",
        }}
      >
        {symbol}
      </span>
    </ButtonWithTooltip>
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
              <SymbolButton symbol="≥" title="Insert ≥" />
              <SymbolButton symbol="≤" title="Insert ≤" />
              <SymbolButton symbol="<" title="Insert <" />
              <SymbolButton symbol=">" title="Insert >" />
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