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

export const EditorToolbar = () => {
  return (
    <div className="flex items-center gap-2">
      <UndoRedo />
      <BoldItalicUnderlineToggles />
      <BlockTypeSelect />
      <ListsToggle />
      <CreateLink />
      <InsertImage />
      <InsertTable />
      <InsertThematicBreak />
    </div>
  );
};
