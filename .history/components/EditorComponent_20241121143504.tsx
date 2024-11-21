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
} from "@mdxeditor/editor";
import {
  UndoRedo,
  BoldItalicUnderlineToggles,
  BlockTypeSelect,
  CreateLink,
  InsertImage,
  InsertTable,
  InsertThematicBreak,
  ListsToggle,
} from "@mdxeditor/editor";
import { FC } from "react";
import { useTheme } from "next-themes";

interface EditorProps {
  markdown: string;
  editorRef?: React.MutableRefObject<MDXEditorMethods | null>;
  messageId?: number;
  onContentChange?: (content: string) => void;
}

const Editor: FC<EditorProps> = ({ markdown, editorRef, onContentChange }) => {
  const { theme } = useTheme();

  const getEditorClassName = () => {
    return theme === "dark" ? "dark-theme dark-editor" : "light-editor";
  };

  return (
    <MDXEditor
      ref={editorRef}
      className={getEditorClassName()}
      markdown={markdown || ""}
      onChange={(content) => {
        if (onContentChange) {
          onContentChange(content);
        }
      }}
      onError={(error) => {
        console.warn('MDXEditor error:', error);
      }}
      plugins={[
        // Базовые плагины для форматирования
        headingsPlugin({
          allowedHeadingLevels: [1, 2, 3, 4, 5, 6]
        }),
        listsPlugin(),
        quotePlugin(),
        frontmatterPlugin(),
        
        // Плагины для работы с таблицами и ссылками
        tablePlugin({
          disableAutoSelect: true,
          // Отключаем автофокус для предотвращения проблем с рендерингом
          shouldRenderAsText: false
        }),
        
        linkPlugin({
          disableAutoLink: true // Отключаем автоматическое создание ссылок
        }),
        linkDialogPlugin({
          // Обработчик для открытия ссылок в новом окне
          onClickLinkCallback: (url) => {
            window.open(url, '_blank');
          }
        }),
        
        // Плагины для изображений и разделителей
        imagePlugin({
          disableImageResize: true,
          imageUploadHandler: async () => {
            return Promise.reject(new Error('Image upload not implemented'));
          }
        }),
        thematicBreakPlugin(),
        
        // Плагин для клавиатурных сокращений
        markdownShortcutPlugin(),
        
        // Плагин панели инструментов должен быть последним
        toolbarPlugin({
          toolbarContents: () => (
            <>
              <UndoRedo />
              <BoldItalicUnderlineToggles />
              <BlockTypeSelect />
              <ListsToggle />
              <CreateLink />
              <InsertImage />
              <InsertTable />
              <InsertThematicBreak />
            </>
          )
        })
      ]}
    />
  );
};

export default Editor;
