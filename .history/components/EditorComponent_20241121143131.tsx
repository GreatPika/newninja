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
        listsPlugin(),
        headingsPlugin({
          allowedHeadingLevels: [1, 2, 3, 4, 5, 6],
        }),
        quotePlugin(),
        tablePlugin({
          disableAutoSelect: true,
        }),
        thematicBreakPlugin(),
        frontmatterPlugin(),
        
        linkPlugin({
          disableAutoLink: false,
        }),
        linkDialogPlugin({
          onClickLinkCallback: (url) => {
            window.open(url, '_blank');
          }
        }),
        imagePlugin({
          disableImageResize: true,
        }),
        
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
          ),
        }),
      ]}
      onChange={(content) => {
        if (onContentChange) {
          onContentChange(content);
        }
      }}
      onError={(error) => {
        console.warn('MDXEditor error:', error);
      }}
    />
  );
};

export default Editor;
