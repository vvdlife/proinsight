"use client";

import { MarkdownViewer } from "@/features/editor/components/MarkdownViewer";
import { cn } from "@/lib/utils";
import { useEffect, useRef } from "react";

interface Section {
    id: string;
    heading: string;
    content: string | null;
    status: 'pending' | 'writing' | 'done' | 'error';
}

interface LivePreviewProps {
    title: string;
    sections: Section[];
    className?: string;
}

export function LivePreview({ title, sections, className }: LivePreviewProps) {
    const bottomRef = useRef<HTMLDivElement>(null);

    // Auto-scroll to the bottom when new content arrives (optional ux choice)
    // Actually, only scroll if we are "writing" a new section to keep it in view.
    // For now, let's just ensure the active section is visible.
    useEffect(() => {
        const activeSection = sections.find(s => s.status === 'writing' || s.status === 'pending');
        // Simple scroll to bottom logic for now
        if (bottomRef.current) {
            // Check if user is near bottom before auto-scrolling to avoid annoying them reading up
            // Keeping it simple: Scroll smooth
            // bottomRef.current.scrollIntoView({ behavior: "smooth" });
        }
    }, [sections]);

    return (
        <div className={cn("w-full h-full overflow-y-auto bg-white dark:bg-zinc-950 p-8 md:p-16", className)}>
            <div className="max-w-3xl mx-auto space-y-12">
                {/* Header */}
                <div className="space-y-4 border-b pb-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                    <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-foreground">
                        {title || "Untitled Post"}
                    </h1>
                    <div className="flex gap-2">
                        <div className="h-6 w-24 bg-muted animate-pulse rounded" />
                        <div className="h-6 w-32 bg-muted animate-pulse rounded" />
                    </div>
                </div>

                {/* Sections Loop */}
                <div className="space-y-12">
                    {sections.map((section, index) => (
                        <div key={section.id || index} className="transition-all duration-500">
                            {/* Section Status Visuals */}
                            {section.status === 'done' ? (
                                <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
                                    <MarkdownViewer content={section.content || ""} />
                                </div>
                            ) : section.status === 'writing' ? (
                                <div className="space-y-4 animate-pulse opacity-80">
                                    <div className="h-8 w-3/4 bg-muted/50 rounded" />
                                    <div className="space-y-2">
                                        <div className="h-4 bg-muted/30 rounded w-full" />
                                        <div className="h-4 bg-muted/30 rounded w-[90%]" />
                                        <div className="h-4 bg-muted/30 rounded w-[95%]" />
                                        <div className="h-4 bg-muted/30 rounded w-[80%]" />
                                    </div>
                                    <div className="flex items-center gap-2 text-sm text-primary font-medium">
                                        <span className="relative flex h-2 w-2">
                                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                                            <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                                        </span>
                                        AI Writing...
                                    </div>
                                </div>
                            ) : (
                                // Pending Skeleton
                                <div className="space-y-4 opacity-30 blur-[1px]">
                                    <div className="h-8 w-1/2 bg-muted rounded" />
                                    <div className="space-y-3">
                                        <div className="h-4 bg-muted rounded w-full" />
                                        <div className="h-4 bg-muted rounded w-full" />
                                        <div className="h-4 bg-muted rounded w-3/4" />
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>

                <div ref={bottomRef} className="h-20" />
            </div>
        </div>
    );
}
