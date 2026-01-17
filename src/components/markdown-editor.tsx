"use client";

import "@mdxeditor/editor/style.css";
import "@/app/mdx-editor.css"; // Custom overrides

import {
    MDXEditor,
    headingsPlugin,
    listsPlugin,
    quotePlugin,
    thematicBreakPlugin,
    markdownShortcutPlugin,
    tablePlugin,
    toolbarPlugin,
    UndoRedo,
    BoldItalicUnderlineToggles,
    BlockTypeSelect,
    CodeToggle,
    CreateLink,
    InsertTable,
    ListsToggle,
    linkPlugin,
    imagePlugin,
    codeBlockPlugin,
} from "@mdxeditor/editor";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";

interface MarkdownEditorProps {
    markdown: string;
    onChange: (markdown: string) => void;
    className?: string;
}

// MDXEditor is not SSR compatible, so it must be dynamically imported in the parent
// But here we are defining the component itself.
// The parent (page.tsx) will handle the dynamic import or we assume this component is client-side only.
// Actually, it's safer to export this as default and have the parent component use dynamic import.

export default function MarkdownEditor({ markdown, onChange, className }: MarkdownEditorProps) {
    const { theme } = useTheme();

    return (
        <div className={cn("w-full border rounded-lg overflow-hidden bg-background", className)}>
            <MDXEditor
                markdown={markdown}
                onChange={onChange}
                className={cn("mdx-editor", theme === "dark" ? "dark-theme" : "")}
                plugins={[
                    headingsPlugin(),
                    listsPlugin(),
                    quotePlugin(),
                    thematicBreakPlugin(),
                    tablePlugin(),
                    markdownShortcutPlugin(),
                    linkPlugin(),
                    imagePlugin(),
                    codeBlockPlugin({ defaultCodeBlockLanguage: 'txt' }),
                    toolbarPlugin({
                        toolbarContents: () => (
                            <>
                                <UndoRedo />
                                <BlockTypeSelect />
                                <BoldItalicUnderlineToggles />
                                <CodeToggle />
                                <CreateLink />
                                <InsertTable />
                                <ListsToggle />
                            </>
                        ),
                    }),
                ]}
            />
        </div>
    );
}
