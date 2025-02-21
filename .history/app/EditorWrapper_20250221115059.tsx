"use client";

import type { ReactNode } from "react";

import { RealmProvider } from "@mdxeditor/editor";

export const EditorWrapper = ({ children }: { children: ReactNode }) => {
  return <RealmProvider>{children}</RealmProvider>;
};
