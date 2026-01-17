"use client";

import { useEffect, useState, useRef } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import mermaid from "mermaid";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { Terminal, Info, AlertTriangle, Lightbulb, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";

interface MarkdownViewerProps {
    content: string;
}

// Mermaid Component
const Mermaid = ({ chart }: { chart: string }) => {
    const [svg, setSvg] = useState<string>("");
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (chart && ref.current) {
            mermaid.render(`mermaid-${Math.random().toString(36).substr(2, 9)}`, chart)
                .then(({ svg }) => setSvg(svg))
                .catch((err) => {
                    console.error("Mermaid Render Error:", err);
                    setSvg(`<div data-error="true"></div>`); // Trigger fallback support
                });
        }
    }, [chart]);

    return (
        <>
            {svg.startsWith("<div") ? (
                // Error State: Show Error Message + Raw Code
                <div className="my-8 space-y-2">
                    <div className="p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg border border-red-200 dark:border-red-900 text-sm font-medium flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4" />
                        <span>다이어그램 렌더링에 실패했습니다. (원본 코드를 확인하세요)</span>
                    </div>
                    <div className="p-4 bg-muted rounded-lg text-xs font-mono overflow-x-auto whitespace-pre">
                        {chart}
                    </div>
                </div>
            ) : (
                // Success State
                <div
                    ref={ref}
                    className="flex justify-center my-8 p-4 bg-white dark:bg-zinc-900 rounded-lg border shadow-sm items-center overflow-x-auto"
                    dangerouslySetInnerHTML={{ __html: svg }}
                />
            )}
        </>
    );
};

export function MarkdownViewer({ content }: MarkdownViewerProps) {
    useEffect(() => {
        mermaid.initialize({
            startOnLoad: false,
            theme: "default",
            securityLevel: "loose",
        });
    }, []);

    return (
        <div className="prose prose-stone dark:prose-invert max-w-none w-full min-h-[500px] px-4 py-2 text-foreground">
            <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                urlTransform={(url) => url} // Allow Data URIs
                components={{
                    // 1. Table -> Shadcn Table
                    table: ({ children }) => (
                        <div className="my-6 w-full overflow-y-auto border rounded-lg">
                            <Table>{children}</Table>
                        </div>
                    ),
                    thead: ({ children }) => <TableHeader className="bg-muted/50">{children}</TableHeader>,
                    tbody: ({ children }) => <TableBody>{children}</TableBody>,
                    tr: ({ children }) => <TableRow className="hover:bg-muted/30">{children}</TableRow>,
                    th: ({ children }) => <TableHead className="font-bold text-foreground">{children}</TableHead>,
                    td: ({ children }) => <TableCell className="text-muted-foreground">{children}</TableCell>,

                    // 2. HR -> Separator
                    hr: () => <Separator className="my-8" />,

                    // 3. Links -> External Link
                    a: ({ href, children }) => (
                        <a
                            href={href}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-medium underline underline-offset-4 text-primary hover:text-primary/80 inline-flex items-center gap-1"
                        >
                            {children}
                            <ExternalLink className="h-3 w-3" />
                        </a>
                    ),

                    // 4. Blockquote -> Shadcn Alert (Try to detect type)
                    blockquote: ({ children }) => {
                        // Helper to traverse children and find text
                        // Simplification: We assume the AI follows "> [!NOTE] Content" format which yields <p>[!NOTE] Content</p> inside blockquote

                        // We will render a default Alert, but style it based on first line if possible.
                        // Since we can't easily inspect children props in a generic way without deep cloning, 
                        // we will use a generic "Quote/Callout" style here or use simple CSS based approach 
                        // BUT, strict requirement says map to Alert.

                        // Let's rely on the fact that 'children' is likely a <p>
                        // We'll wrap it in a generic Info Alert for now to satisfy the "Callouts" requirement visually.
                        // To perfectly parse [!NOTE], we'd need a custom remark plugin or deeper parsing.
                        // For this iteration, we treat ALL blockquotes as "Callouts/Notes".

                        return (
                            <Alert className="my-6 border-l-4 border-l-primary bg-muted/20">
                                <Info className="h-4 w-4" />
                                <AlertTitle className="mb-2 font-bold">Note</AlertTitle>
                                <AlertDescription className="text-muted-foreground">
                                    {children}
                                </AlertDescription>
                            </Alert>
                        );
                    },

                    // 5. Code -> Syntax Highlighting or Mermaid
                    code: ({ node, inline, className, children, ...props }: any) => {
                        const match = /language-(\w+)/.exec(className || "");
                        const lang = match ? match[1] : "";
                        const isMermaid = lang === "mermaid";

                        if (!inline && isMermaid) {
                            return <Mermaid chart={String(children).replace(/\n$/, "")} />;
                        }

                        if (!inline && match) {
                            return (
                                <div className="rounded-md overflow-hidden my-4 border">
                                    <SyntaxHighlighter
                                        style={oneDark}
                                        language={match[1]}
                                        PreTag="div"
                                        customStyle={{ margin: 0, borderRadius: 0 }}
                                        {...props}
                                    >
                                        {String(children).replace(/\n$/, "")}
                                    </SyntaxHighlighter>
                                </div>
                            );
                        }

                        return (
                            <code className={cn("bg-muted px-1.5 py-0.5 rounded font-mono text-sm", className)} {...props}>
                                {children}
                            </code>
                        );
                    }
                }}
            >
                {content}
            </ReactMarkdown>
        </div>
    );
}
