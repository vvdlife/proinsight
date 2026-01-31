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

// Helper to slugify text for IDs (must match TOC behavior)
const slugify = (text: string) =>
    text.toLowerCase().replace(/[^\w\s-가-힣]/g, '').trim().replace(/\s+/g, '-');

export function MarkdownViewer({ content }: MarkdownViewerProps) {
    useEffect(() => {
        mermaid.initialize({
            startOnLoad: false,
            theme: "default",
            securityLevel: "loose",
        });
    }, []);

    return (
        <div className="prose prose-stone dark:prose-invert max-w-none w-full px-4 py-2 text-foreground 
            prose-headings:scroll-mt-20 prose-headings:font-bold prose-headings:tracking-tight
            prose-h1:text-3xl prose-h1:mb-8
            prose-h2:text-2xl prose-h2:mt-12 prose-h2:mb-6 prose-h2:border-b prose-h2:pb-2
            prose-h3:text-xl prose-h3:mt-8 prose-h3:mb-4
            prose-p:leading-8 prose-p:mb-6 prose-p:text-[1.05rem]
            prose-li:leading-7 prose-li:my-2
            prose-strong:text-primary/90 prose-strong:font-bold
            prose-blockquote:not-italic prose-blockquote:border-l-4 prose-blockquote:border-primary/50 prose-blockquote:bg-muted/30 prose-blockquote:py-2 prose-blockquote:px-6 prose-blockquote:rounded-r-lg prose-blockquote:my-8
            prose-code:before:content-none prose-code:after:content-none
        ">
            <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                urlTransform={(url) => url}
                components={{
                    // 0. Headings with IDs for TOC
                    h1: ({ children }) => <h1 id={slugify(String(children))}>{children}</h1>,
                    h2: ({ children }) => <h2 id={slugify(String(children))} className="group flex items-center gap-2">
                        {children}
                        <a href={`#${slugify(String(children))}`} className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-primary">#</a>
                    </h2>,
                    h3: ({ children }) => <h3 id={slugify(String(children))} className="group flex items-center gap-2">
                        {children}
                        <a href={`#${slugify(String(children))}`} className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-primary text-sm">#</a>
                    </h3>,

                    // 1. Table -> Shadcn Table
                    table: ({ children }) => (
                        <div className="my-8 w-full overflow-y-auto border rounded-xl shadow-sm">
                            <Table>{children}</Table>
                        </div>
                    ),
                    thead: ({ children }) => <TableHeader className="bg-muted/50">{children}</TableHeader>,
                    tbody: ({ children }) => <TableBody>{children}</TableBody>,
                    tr: ({ children }) => <TableRow className="hover:bg-muted/30 transition-colors">{children}</TableRow>,
                    th: ({ children }) => <TableHead className="font-bold text-foreground py-3">{children}</TableHead>,
                    td: ({ children }) => <TableCell className="text-muted-foreground py-3">{children}</TableCell>,

                    // 2. HR -> Separator
                    hr: () => <Separator className="my-12" />,

                    // 3. Links -> External Link
                    a: ({ href, children }) => (
                        <a
                            href={href}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-medium underline underline-offset-4 decoration-primary/30 hover:decoration-primary text-foreground hover:text-primary transition-all inline-flex items-center gap-1"
                        >
                            {children}
                            <ExternalLink className="h-3 w-3 opacity-70" />
                        </a>
                    ),

                    // 4. Blockquote -> Custom Style (Replacing previous Alert logic for cleaner look, or keeping it but styled better)
                    // Let's use the CSS-based blockquote for standard quotes, and Alert for specific callouts if needed.
                    // But re-using the Alert logic is fine if we style it well.
                    // Actually, let's revert to standard blockquote for better "blog" feel, unless it's a callout.
                    blockquote: ({ children }) => {
                        return (
                            <blockquote className="my-8 border-l-4 border-primary/40 pl-6 py-2 italic bg-muted/20 rounded-r-lg">
                                {children}
                            </blockquote>
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
                                <div className="rounded-lg overflow-hidden my-6 border shadow-sm">
                                    <div className="flex items-center justify-between px-4 py-2 bg-muted/50 border-b text-xs text-muted-foreground font-mono">
                                        <span>{lang}</span>
                                    </div>
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
                            <code className={cn("bg-primary/10 text-primary px-1.5 py-0.5 rounded-md font-mono text-[0.9em] font-medium", className)} {...props}>
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
