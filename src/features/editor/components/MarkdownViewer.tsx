"use client";

import React, { useState, useEffect, useRef, useMemo } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import mermaid from 'mermaid';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Separator } from "@/components/ui/separator";
import { Info, AlertTriangle, Lightbulb, ExternalLink, Maximize2, X, Download, Copy, ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';
import { cn } from "@/lib/utils";
import { Button } from '@/components/ui/button';
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";
import { toPng } from 'html-to-image';
import { toast } from "sonner";

interface MarkdownViewerProps {
    content: string;
}

const Mermaid = ({ chart }: { chart: string }) => {
    const [svg, setSvg] = useState<string>("");
    const [isFullscreen, setIsFullscreen] = useState(false);
    const chartRef = useRef<HTMLDivElement>(null);
    const uniqueId = useMemo(() => `mermaid-${Math.random().toString(36).substr(2, 9)}`, []);

    useEffect(() => {
        const renderChart = async () => {
            try {
                // Smart Style Injection: Automatically add semantic classes
                const semanticStyles = `
classDef ai fill:#eff6ff,stroke:#60a5fa,stroke-width:2px,color:#1e293b;
classDef human fill:#fdf4ff,stroke:#e879f9,stroke-width:2px,color:#1e293b;
classDef data fill:#f0fdf4,stroke:#4ade80,stroke-width:2px,color:#1e293b;
`.trim();

                // Append styles to the chart content
                const enhancedChart = `${chart}\n${semanticStyles}`;

                // Determine theme based on system preference or default to base
                const { svg } = await mermaid.render(uniqueId, enhancedChart);
                setSvg(svg);
            } catch (error) {
                console.error("Mermaid rendering failed:", error);
                setSvg(`<div class="text-red-500 p-4 border border-red-200 rounded bg-red-50">Failed to render diagram</div>`);
            }
        };
        renderChart();
    }, [chart, uniqueId]);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (isFullscreen && e.key === "Escape") {
                setIsFullscreen(false);
            }
        };

        if (isFullscreen) {
            document.body.style.overflow = "hidden";
            window.addEventListener("keydown", handleKeyDown);
        } else {
            document.body.style.overflow = "";
            window.removeEventListener("keydown", handleKeyDown);
        }
        return () => {
            document.body.style.overflow = "";
            window.removeEventListener("keydown", handleKeyDown);
        };
    }, [isFullscreen]);

    const handleDownload = async () => {
        if (chartRef.current) {
            try {
                const dataUrl = await toPng(chartRef.current, {
                    backgroundColor: '#ffffff',
                    quality: 1.0,
                    pixelRatio: 2 // High res
                });
                const link = document.createElement('a');
                link.download = 'proinsight-chart.png';
                link.href = dataUrl;
                link.click();
                toast.success("이미지로 저장되었습니다.");
            } catch (err) {
                console.error("Download failed", err);
                toast.error("이미지 저장에 실패했습니다.");
            }
        }
    };

    const handleCopySource = () => {
        navigator.clipboard.writeText(chart);
        toast.success("Mermaid 코드가 복사되었습니다.");
    };

    return (
        <>
            {/* Premium Mermaid Design v2.0 - "The Ultimate CSS Hack" */}
            <style>{`
/* 1. Reset & Typography */
.mermaid .nodeLabel, .mermaid .edgeLabel, .mermaid .label, .mermaid .node text, .mermaid .node div, .mermaid .node span {
    font-family: 'Pretendard', 'Inter', -apple-system, BlinkMacSystemFont, system-ui, sans-serif !important;
    font-weight: 600 !important;
    
    /* [SAFE MARGIN STRATEGY] 
       Config uses 16px, Styles use 13.5px. 
       This delta ensures strictly contained text. 
    */
    font-size: 13.5px !important; 
    line-height: 1.5 !important;
    letter-spacing: -0.01em !important;
    color: #1e293b !important;
    fill: #1e293b !important;
    
    /* Layout Safety */
    overflow: visible !important;
    white-space: normal !important; /* Force standard wrapping */
    word-wrap: break-word !important;
}

/* Ensure container allows overflow */
.mermaid .node foreignObject {
    overflow: visible !important;
}

/* 2. Nodes: The "Card" Look */
.mermaid .node rect, .mermaid .node polygon, .mermaid .node circle, .mermaid .node ellipse, .mermaid .node path {
    fill: #ffffff !important;
    stroke: #cbd5e1 !important; /* slate-300 */
    stroke-width: 1.5px !important;

    /* Deep, rich shadow (Tailwind shadow-xl equivalent) */
    filter: drop-shadow(0 20px 25px -5px rgb(0 0 0 / 0.04)) drop-shadow(0 8px 10px -6px rgb(0 0 0 / 0.01)) !important;

    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
}

/* Shape Refinements */
.mermaid .node rect {
    rx: 8px !important; /* Tight radius for cleaner look */
    ry: 8px !important;
}

/* 3. Interactive Hover Effects */
/* We target the group (g) hover if possible, but styling the rect on hover works best */
.mermaid g.node:hover rect, 
.mermaid g.node:hover polygon, 
.mermaid g.node:hover circle {
    stroke: #6366f1 !important; /* Indigo-500 */
    stroke-width: 2px !important;
    fill: #f8fafc !important; /* Slate-50 */
    /* Lift effect via filter */
    filter: drop-shadow(0 25px 50px -12px rgb(99 102 241 / 0.15)) !important;
}
.mermaid g.node:hover .nodeLabel,
.mermaid g.node:hover text {
    color: #4338ca !important; /* Indigo-700 */
    fill: #4338ca !important;
}

/* 4. Edges: Smooth & Subtle */
.mermaid .edgePath path {
    stroke: #94a3b8 !important; /* Slate-400 */
    stroke-width: 2px !important;
    stroke-linecap: round !important;
    opacity: 0.8 !important;
    transition: all 0.3s ease !important;
}
.mermaid .edgePath path:hover {
    stroke: #6366f1 !important;
    opacity: 1 !important;
    stroke-width: 3px !important;
}
.mermaid .arrowheadPath {
    fill: #94a3b8 !important;
    stroke: none !important;
}

/* 5. Dark Mode Logic */
.dark .mermaid .node rect, .dark .mermaid .node polygon, .dark .mermaid .node circle {
    fill: #18181b !important; /* zinc-900 */
    stroke: #3f3f46 !important; /* zinc-700 */
    filter: drop-shadow(0 10px 15px -3px rgb(0 0 0 / 0.5)) !important;
}
.dark .mermaid .nodeLabel, .dark .mermaid .edgeLabel, .dark .mermaid text {
    color: #e4e4e7 !important; /* zinc-200 */
    fill: #e4e4e7 !important;
}
.dark .mermaid g.node:hover rect {
    stroke: #818cf8 !important; /* indigo-400 */
    fill: #27272a !important; /* zinc-800 */
    filter: drop-shadow(0 0 20px rgb(129 140 248 / 0.2)) !important;
}
`}</style>

            {/* Inline View */}
            <div className="relative group w-full my-8 bg-white/50 dark:bg-zinc-900/50 rounded-xl border border-slate-200 dark:border-zinc-800 p-2 overflow-hidden hover:border-indigo-400 transition-colors duration-300">
                {svg.startsWith("<div") ? (
                    <div className="space-y-2 w-full">
                        <div className="p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg border border-red-200 dark:border-red-900 text-sm font-medium flex items-center gap-2">
                            <AlertTriangle className="h-4 w-4" />
                            <span>다이어그램 렌더링에 실패했습니다.</span>
                        </div>
                        <div className="p-4 bg-muted rounded-lg text-xs font-mono overflow-x-auto whitespace-pre">
                            {chart}
                        </div>
                    </div>
                ) : (
                    <div
                        className="overflow-x-auto p-4 flex justify-center min-h-[150px] items-center cursor-zoom-in"
                        onClick={() => setIsFullscreen(true)}
                        dangerouslySetInnerHTML={{ __html: svg }}
                    />
                )}

                {!svg.startsWith("<div") && (
                    <Button
                        variant="ghost"
                        size="icon"
                        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-white/50 hover:bg-white dark:bg-black/50 dark:hover:bg-black/80 backdrop-blur-sm"
                        onClick={(e) => {
                            e.stopPropagation();
                            setIsFullscreen(true);
                        }}
                    >
                        <Maximize2 className="h-4 w-4" />
                    </Button>
                )}
            </div>

            {isFullscreen && (
                <div className="fixed inset-0 z-50 bg-background/95 backdrop-blur-md p-4 md:p-8 flex flex-col animate-in fade-in duration-200">
                    <div className="flex justify-end mb-4 gap-2">
                        {/* Download Button */}
                        <Button variant="outline" size="sm" onClick={handleDownload} className="gap-2">
                            <Download className="h-4 w-4" />
                            <span>PNG 저장</span>
                        </Button>
                        {/* Copy Source Button */}
                        <Button variant="outline" size="sm" onClick={handleCopySource} className="gap-2">
                            <Copy className="h-4 w-4" />
                            <span>코드 복사</span>
                        </Button>
                        {/* Close Button */}
                        <Button variant="ghost" size="icon" onClick={() => setIsFullscreen(false)}>
                            <X className="h-6 w-6" />
                        </Button>
                    </div>
                    <div
                        className="flex-1 overflow-auto flex justify-center items-start border rounded-xl bg-white dark:bg-zinc-900 p-8 shadow-2xl relative"
                        onClick={(e) => {
                            if (e.target === e.currentTarget) setIsFullscreen(false);
                        }}
                    >
                        <TransformWrapper
                            initialScale={1}
                            minScale={0.5}
                            maxScale={3}
                            centerOnInit
                        >
                            {({ zoomIn, zoomOut, resetTransform }) => (
                                <>
                                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-1 p-1 bg-background/80 backdrop-blur rounded-lg border shadow-lg z-10">
                                        <Button variant="ghost" size="icon" onClick={() => zoomIn()}>
                                            <ZoomIn className="h-4 w-4" />
                                        </Button>
                                        <Button variant="ghost" size="icon" onClick={() => zoomOut()}>
                                            <ZoomOut className="h-4 w-4" />
                                        </Button>
                                        <Button variant="ghost" size="icon" onClick={() => resetTransform()}>
                                            <RotateCcw className="h-4 w-4" />
                                        </Button>
                                    </div>
                                    <TransformComponent wrapperClass="w-full h-full" contentClass="w-full h-full flex items-center justify-center">
                                        <div
                                            ref={chartRef}
                                            className="min-w-min"
                                            dangerouslySetInnerHTML={{ __html: svg }}
                                        />
                                    </TransformComponent>
                                </>
                            )}
                        </TransformWrapper>
                    </div>
                </div>
            )}
        </>
    );
};

// Helper to slugify text for IDs (must match TOC behavior)
const slugify = (text: string) =>
    text.toLowerCase().replace(/[^\w\s-가-힣]/g, '').trim().replace(/\s+/g, '-');

// Helper to detect alert pattern in a string
const detectAlert = (text: string) => {
    const match = text.match(/^['"]?\[!(NOTE|TIP|IMPORTANT|WARNING|CAUTION)\]['"]?\s*(.*)/i);
    if (!match) return null;

    return {
        type: match[1].toLowerCase() as "note" | "tip" | "important" | "warning" | "caution",
        title: match[2].replace(/['"]$/, ''), // Remove trailing quote if present
    };
};

const AlertBlock = ({ type, title, children }: { type: "note" | "tip" | "important" | "warning" | "caution", title?: string, children: React.ReactNode }) => {
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
                    {title && <p className="font-bold mb-1 flex items-center gap-2 text-foreground">{title}</p>}
                    <div className="text-sm [&>p]:mb-0">
                        {children}
                    </div>
                </div>
            </div>
        </div>
    );
};

const Blockquote = ({ children }: any) => {
    // Check if children is a generic P that contains an alert
    const childrenArray = React.Children.toArray(children);
    const firstChild = childrenArray[0];

    if (React.isValidElement(firstChild) && firstChild.type === 'p') {
        const element = firstChild as React.ReactElement<any>;
        const grandChildren = React.Children.toArray(element.props.children);
        const firstGrandChild = grandChildren[0];

        if (typeof firstGrandChild === 'string') {
            const alertInfo = detectAlert(firstGrandChild);
            if (alertInfo) {
                // Remove the marker
                const newFirstGrandChild = firstGrandChild.replace(/^['"]?\[!(NOTE|TIP|IMPORTANT|WARNING|CAUTION)\]['"]?\s*/i, '');
                const newContent = [...grandChildren];
                newContent[0] = newFirstGrandChild;

                return <AlertBlock type={alertInfo.type} title={alertInfo.title}>{React.createElement('p', element.props, ...newContent)}{childrenArray.slice(1)}</AlertBlock>;
            }
        }
    }

    return (
        <blockquote className="my-8 border-l-4 border-primary/40 pl-6 py-2 italic bg-muted/20 rounded-r-lg">
            {children}
        </blockquote>
    );
};

// Custom Paragraph component to catch Alerts even if they are NOT in blockquotes
const Paragraph = ({ children, node, ...props }: any) => {
    const childrenArray = React.Children.toArray(children);
    const firstChild = childrenArray[0];

    if (typeof firstChild === 'string') {
        const alertInfo = detectAlert(firstChild);
        if (alertInfo) {
            const newFirstChild = firstChild.replace(/^['"]?\[!(NOTE|TIP|IMPORTANT|WARNING|CAUTION)\]['"]?\s*/i, '');
            const newContent = [...childrenArray];
            newContent[0] = newFirstChild;
            return <AlertBlock type={alertInfo.type} title={alertInfo.title}><p className="mb-0">{newContent}</p></AlertBlock>;
        }
    }

    return <p className="leading-8 mb-6 text-[1.05rem] text-foreground/90" {...props}>{children}</p>;
};

export function MarkdownViewer({ content }: MarkdownViewerProps) {
    useEffect(() => {
        mermaid.initialize({
            startOnLoad: false,
            // Use 'base' for full customization
            theme: "base",
            securityLevel: "loose",
            fontFamily: 'Pretendard, Inter, ui-sans-serif, system-ui, sans-serif',
            flowchart: {
                useMaxWidth: false,
                htmlLabels: true,
                curve: 'basis', // Smooth curves are essential for premium look
                nodeSpacing: 50,
                rankSpacing: 50,
                padding: 15, // Standard padding, rely on CSS for breathing room
            },
            themeVariables: {
                // "Safe Margin Strategy"
                // 1. We tell Mermaid to calculate layout for 16px text.
                // 2. We render text at 13.5px via CSS.
                // Result: The box is always bigger than the text. Zero clipping.
                fontSize: '16px',

                // Base colors (Overridden by CSS, but good for fallback)
                primaryColor: '#ffffff',
                primaryTextColor: '#0f172a',
                primaryBorderColor: '#cbd5e1',
                lineColor: '#94a3b8',
                secondaryColor: '#ffffff',
                tertiaryColor: '#ffffff',
                mainBkg: '#ffffff',
                nodeBorder: '#cbd5e1',

                fontFamily: 'Pretendard, Inter, ui-sans-serif, system-ui, sans-serif',
            },
        });
    }, []);

    // Function to strip SEO scripts and comments for display
    const getDisplayContent = (rawContent: string) => {
        return rawContent
            .replace(/<!--[\s\S]*?-->/g, '') // Remove HTML comments
            .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, '') // Remove script tags
            .replace(/^---[\s\S]*?---\n/, ''); // Remove frontmatter if valid
    };

    const displayContent = getDisplayContent(content);

    return (
        <div className="prose prose-stone dark:prose-invert max-w-none w-full px-4 py-2 text-foreground 
            /* Headings */
            prose-headings:scroll-mt-20 prose-headings:font-bold prose-headings:tracking-tight prose-headings:text-foreground
            prose-h1:text-4xl prose-h1:font-extrabold prose-h1:mb-10 prose-h1:leading-tight
            prose-h2:text-3xl prose-h2:mt-16 prose-h2:mb-6 prose-h2:border-b prose-h2:pb-3 prose-h2:leading-snug
            prose-h3:text-2xl prose-h3:mt-12 prose-h3:mb-4 prose-h3:leading-snug
            prose-h4:text-xl prose-h4:mt-8 prose-h4:mb-4 prose-h4:font-semibold
            
            /* Text body */
            prose-p:leading-8 prose-p:mb-6 prose-p:text-[1.05rem] prose-p:text-foreground/90
            prose-li:leading-7 prose-li:my-2 prose-li:text-foreground/90
            
            /* Decorators */
            prose-strong:text-primary prose-strong:font-bold
            prose-a:text-primary prose-a:no-underline hover:prose-a:underline prose-a:font-medium
            
            /* Blockquote */
            prose-blockquote:not-italic prose-blockquote:border-none prose-blockquote:bg-transparent prose-blockquote:p-0 prose-blockquote:my-0
            
            /* Code */
            prose-code:before:content-none prose-code:after:content-none
            prose-code:bg-muted prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded-md prose-code:font-mono prose-code:text-sm
            prose-pre:bg-muted/50 prose-pre:border prose-pre:text-foreground
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

                    // 4. Blockquote & Paragraph -> Alerts Detection
                    blockquote: Blockquote,
                    p: Paragraph,

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
                {displayContent}
            </ReactMarkdown>
        </div>
    );
}
