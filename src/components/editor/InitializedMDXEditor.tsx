// Path: src/components/editor/InitializedMDXEditor.tsx
"use client";

import {
    headingsPlugin,
    listsPlugin,
    quotePlugin,
    thematicBreakPlugin,
    markdownShortcutPlugin,
    MDXEditor,
    type MDXEditorMethods,
    type MDXEditorProps,
    toolbarPlugin,
    UndoRedo,
    BoldItalicUnderlineToggles,
    BlockTypeSelect,
    CodeToggle,
    ListsToggle,
} from "@mdxeditor/editor";
import { ForwardedRef } from "react";
import "@mdxeditor/editor/style.css";

// Editor configuration
export default function InitializedMDXEditor({
    editorRef,
    ...props
}: { editorRef: ForwardedRef<MDXEditorMethods> | null } & MDXEditorProps) {
    return (
        <MDXEditor
            plugins={[
                headingsPlugin(),
                listsPlugin(),
                quotePlugin(),
                thematicBreakPlugin(),
                markdownShortcutPlugin(),
                toolbarPlugin({
                    toolbarContents: () => (
                        <>
                            <UndoRedo />
                            <BlockTypeSelect />
                            <BoldItalicUnderlineToggles />
                            <CodeToggle />
                            <ListsToggle />
                        </>
                    ),
                }),
            ]}
            {...props}
            ref={editorRef}
            className="prose prose-stone dark:prose-invert max-w-none w-full min-h-[500px] border rounded-md px-4 py-2"
        />
    );
}
