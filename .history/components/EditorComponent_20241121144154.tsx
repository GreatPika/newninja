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
  useCellValues,
  applyBlockType$,
  applyListType$,
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
import { FC, useCallback } from "react";
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

  const handleContentChange = useCallback((content: string) => {
    if (onContentChange) {
      onContentChange(content);
    }
  }, [onContentChange]);

  return (
    <MDXEditor
      ref={editorRef}
      className={getEditorClassName()}
      markdown={markdown || ""}
      onChange={handleContentChange}
      onError={(error) => {
        console.warn('MDXEditor error:', error);
      }}
      plugins={[
        headingsPlugin({
          allowedHeadingLevels: [1, 2, 3, 4, 5, 6]
        }),
        listsPlugin(),
        quotePlugin(),
        frontmatterPlugin(),
        tablePlugin({
          disableAutoSelect: true,
          shouldRenderAsText: false
        }),
        linkPlugin({
          disableAutoLink: true
        }),
        linkDialogPlugin({
          onClickLinkCallback: (url) => {
            window.open(url, '_blank');
          }
        }),
        imagePlugin({
          disableImageResize: true,
          imageUploadHandler: async () => {
            return Promise.reject(new Error('Image upload not implemented'));
          }
        }),
        thematicBreakPlugin(),
        markdownShortcutPlugin(),
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
