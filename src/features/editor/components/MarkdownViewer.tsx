"use client";

import React, { useEffect, useState, useRef } from "react";
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

const Blockquote = ({ children }: any) => {
    // Helper to find the alert type from children
    const getAlertType = (children: React.ReactNode): { type: "note" | "tip" | "important" | "warning" | "caution" | null; title?: string; content: React.ReactNode } => {
        const childrenArray = React.Children.toArray(children);
        const firstChild = childrenArray[0];

        if (React.isValidElement(firstChild) && firstChild.type === 'p') {
            const element = firstChild as React.ReactElement<any>;
            const grandChildren = React.Children.toArray(element.props.children);
            const firstGrandChild = grandChildren[0];

            if (typeof firstGrandChild === 'string') {
                const match = firstGrandChild.match(/^\[!(NOTE|TIP|IMPORTANT|WARNING|CAUTION)\]\s*(.*)/i);
                if (match) {
                    const type = match[1].toLowerCase() as any;
                    const title = match[2];
                    // Remove the marker from the first element
                    const newFirstGrandChild = firstGrandChild.replace(/^\[!(NOTE|TIP|IMPORTANT|WARNING|CAUTION)\]\s*/i, '');

                    // Reconstruct content without the marker
                    const newContent = [
                        // If there is title text remaining on the first line, keep it (bolded perhaps) or just part of content?
                        // Usually GitHub puts the type as title. The user seems to use "![TIP] Title: Content" format.
                        // Let's handle the user's specific format: "![TIP] Analyst Note: ..."
                        // Actually the user's screenshot text is: "[!TIP] Analyst Note: AI를..."
                        // The regex `^\[!(NOTE|TIP|IMPORTANT|WARNING|CAUTION)\]` matches the start.

                        // Let's return the rest of the text as content.
                        ...grandChildren
                    ];
                    // Replace the first string node
                    newContent[0] = newFirstGrandChild;

                    return {
                        type,
                        title: title || type.toUpperCase(),
                        content: (
                            <div className="text-sm [&>p]:mb-0">
                                {React.createElement('p', element.props, ...newContent)}
                                {childrenArray.slice(1)}
                            </div>
                        )
                    };
                }
            }
        }
        return { type: null, content: children };
    };

    const { type, content } = getAlertType(children);

    if (type) {
        const styles = {
            note: { icon: Info, color: "text-blue-500", border: "border-blue-500", bg: "bg-blue-50 dark:bg-blue-950/30" },
            tip: { icon: Lightbulb, color: "text-green-500", border: "border-green-500", bg: "bg-green-50 dark:bg-green-950/30" },
            important: { icon: AlertTriangle, color: "text-purple-500", border: "border-purple-500", bg: "bg-purple-50 dark:bg-purple-950/30" },
            warning: { icon: AlertTriangle, color: "text-orange-500", border: "border-orange-500", bg: "bg-orange-50 dark:bg-orange-950/30" },
            caution: { icon: AlertTriangle, color: "text-red-500", border: "border-red-500", bg: "bg-red-50 dark:bg-red-950/30" },
        };
        const style = styles[type];
        const Icon = style.icon;

        return (
            <div className={cn("my-6 rounded-lg border-l-4 p-4", style.border, style.bg)}>
                <div className="flex items-start gap-3">
                    <Icon className={cn("h-5 w-5 mt-0.5 shrink-0", style.color)} />
                    <div className="flex-1 min-w-0">
                        {content}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <blockquote className="my-8 border-l-4 border-primary/40 pl-6 py-2 italic bg-muted/20 rounded-r-lg">
            {children}
        </blockquote>
    );
};

export function MarkdownViewer({ content }: MarkdownViewerProps) {
    useEffect(() => {
        mermaid.initialize({
            startOnLoad: false,
            theme: "neutral", // Changed to neutral for cleaner look
            securityLevel: "loose",
            fontFamily: 'inherit',
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
            prose-blockquote:not-italic prose-blockquote:border-none prose-blockquote:bg-transparent prose-blockquote:p-0 prose-blockquote:my-0
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

                    // 4. Blockquote -> Alerts Detection
                    blockquote: Blockquote,

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
