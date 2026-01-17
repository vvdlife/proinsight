// Path: src/components/editor/MarkdownEditor.tsx
"use client";

import dynamic from "next/dynamic";
import { forwardRef } from "react";
import { type MDXEditorMethods, type MDXEditorProps } from "@mdxeditor/editor";
import { Skeleton } from "@/components/ui/skeleton";

// Dynamically import the editor to avoid SSR issues
const Editor = dynamic(() => import("./InitializedMDXEditor"), {
    ssr: false,
    loading: () => <Skeleton className="w-full h-[500px] rounded-md" />,
});

// Wrapper component to forward ref
export const MarkdownEditor = forwardRef<MDXEditorMethods, MDXEditorProps>(
    (props, ref) => <Editor {...props} editorRef={ref} />
);

MarkdownEditor.displayName = "MarkdownEditor";
