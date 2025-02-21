/* eslint-disable no-console */
"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { useParams } from "next/navigation";
import { PanelGroup, Panel, PanelResizeHandle } from "react-resizable-panels";

import { TableRowInfo } from "@/app/edit/components/TableRowInfo";
import { useDisableScroll } from "@/app/hooks/useDisableScroll";
import { useMessageLoader } from "@/app/hooks/useMessageLoader";
import { useMessageUpdater } from "@/app/hooks/useMessageUpdater";

const Editor = dynamic(() => import("@/app/edit/components/EditorComponent"), {
  ssr: false,
  loading: () => <div className="text-default-500">Загрузка редактора...</div>,
});

export default function EditPage() {
  const params = useParams();
  const messageId =
    typeof params.id === "string" ? parseInt(params.id, 10) : null;

  useDisableScroll();
  const { markdown, sourceData, isReady } = useMessageLoader(messageId);
  const { handleContentChange } = useMessageUpdater();

  const [pageRowInfo, setPageRowInfo] = useState<{
    activeRow: number | null;
    column4Value: string | null;
  }>({ activeRow: null, column4Value: null });

  if (!isReady) {
    return <div className="text-default-500">Загрузка...</div>;
  }

  return (
    <div style={{ height: "100vh", overflow: "hidden" }}>
      <PanelGroup direction="vertical">
        <Panel
          defaultSize={85}
          maxSize={90}
          minSize={10}
          style={{ overflow: "auto" }}
        >
          <div style={{ height: "100%" }}>
            <Editor
              key={markdown}
              markdown={markdown}
              sourceData={sourceData}
              onContentChange={handleContentChange(messageId)}
              onRowInfoChange={setPageRowInfo}
            />
          </div>
        </Panel>
        <PanelResizeHandle className="resize-handle" />
        <Panel
          defaultSize={30}
          maxSize={90}
          minSize={10}
          style={{ overflow: "auto" }}
        >
          <TableRowInfo
            activeRow={pageRowInfo.activeRow}
            column4Value={pageRowInfo.column4Value}
          />
        </Panel>
      </PanelGroup>
    </div>
  );
}
