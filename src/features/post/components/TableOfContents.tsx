"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

interface TocItem {
    id: string;
    text: string;
    level: number;
}

interface TableOfContentsProps {
    content: string;
}

export function TableOfContents({ content }: TableOfContentsProps) {
    const [headings, setHeadings] = useState<TocItem[]>([]);
    const [activeId, setActiveId] = useState<string>("");

    useEffect(() => {
        // Extract headings from markdown content
        // Simple regex for # headings. Note: MarkdownViewer might render custom IDs differently,
        // but typically GFM uses kebab-case of the text.
        const lines = content.split("\n");
        const extractedHeadings: TocItem[] = [];

        // Helper to slugify text for IDs (must match remark-gfm/rehype-slug behavior ideally)
        // Simple approximation: lowercase, remove special chars, spaces to hyphens
        const slugify = (text: string) =>
            text.toLowerCase().replace(/[^\w\s-가-힣]/g, '').trim().replace(/\s+/g, '-');

        lines.forEach((line) => {
            const match = line.match(/^(#{1,3})\s+(.*)$/);
            if (match) {
                const level = match[1].length;
                const text = match[2];
                // Remove bold/italic markers from text for display
                const cleanText = text.replace(/[*_]/g, "");
                const id = slugify(cleanText);

                extractedHeadings.push({ id, text: cleanText, level });
            }
        });

        setHeadings(extractedHeadings);
    }, [content]);

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        setActiveId(entry.target.id);
                    }
                });
            },
            { rootMargin: "-100px 0px -66% 0px" } // Highlight when element is in the upper part of screen
        );

        const elements = document.querySelectorAll("h1, h2, h3, h4"); // Select headers in the document
        elements.forEach((elem) => observer.observe(elem));

        return () => observer.disconnect();
    }, [headings]); // Update observer when headings change (though content drives headings)

    const handleClick = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
        e.preventDefault();
        const element = document.getElementById(id);
        if (element) {
            // Offset for fixed header if any (though we don't have one usually)
            // But let's add some padding
            const y = element.getBoundingClientRect().top + window.scrollY - 80;
            window.scrollTo({ top: y, behavior: "smooth" });
            setActiveId(id);
        }
    };

    if (headings.length < 2) return null;

    return (
        <nav className="hidden xl:block fixed top-32 right-8 w-64 p-4 pl-6 border-l transition-all animate-in fade-in slide-in-from-right-5">
            <h4 className="font-semibold mb-4 text-sm text-muted-foreground">목차 (On this page)</h4>
            <ul className="space-y-2 text-sm">
                {headings.map((item, index) => (
                    <li
                        key={`${item.id}-${index}`}
                        style={{ paddingLeft: `${(item.level - 1) * 12}px` }}
                    >
                        <a
                            href={`#${item.id}`}
                            onClick={(e) => handleClick(e, item.id)}
                            className={cn(
                                "block transition-colors hover:text-foreground line-clamp-1",
                                activeId === item.id
                                    ? "text-primary font-medium border-l-2 border-primary -ml-[25px] pl-[21px]"
                                    : "text-muted-foreground"
                            )}
                        >
                            {item.text}
                        </a>
                    </li>
                ))}
            </ul>
        </nav>
    );
}
