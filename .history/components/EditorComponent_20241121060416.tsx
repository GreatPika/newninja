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
              <CreateLink />
              <InsertTable />
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
