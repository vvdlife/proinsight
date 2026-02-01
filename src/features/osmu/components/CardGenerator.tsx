// Path: src/features/osmu/components/CardGenerator.tsx
"use client";

import { useRef, useState } from "react";
import { toPng } from "html-to-image";
import { Button } from "@/components/ui/button";
import { Download, Loader2, Instagram, Layers } from "lucide-react";
import { toast } from "sonner";

interface CardGeneratorProps {
    title: string;
    summary: string; // 3 bullet points or short summary
    author?: string;
    date?: string;
}

export function CardGenerator({ title, summary, author = "ProInsight", date }: CardGeneratorProps) {
    const cardRef = useRef<HTMLDivElement>(null);
    const [isGenerating, setIsGenerating] = useState(false);

    const handleDownload = async () => {
        if (!cardRef.current) return;

        setIsGenerating(true);
        try {
            // Wait for fonts and images to load effectively
            // Simple delay to ensure rendering
            await new Promise((resolve) => setTimeout(resolve, 500));

            // Calculate optimal pixel ratio to reach target 1080x1080
            const currentWidth = cardRef.current.clientWidth;
            const targetWidth = 1080;
            const ratio = Math.max(2, targetWidth / currentWidth);

            const dataUrl = await toPng(cardRef.current, {
                quality: 0.95,
                cacheBust: true,
                pixelRatio: ratio,
            });

            const link = document.createElement("a");
            link.download = `card-news-${title.substring(0, 10).replace(/\s+/g, "-")}.png`;
            link.href = dataUrl;
            link.click();
            toast.success("카드뉴스 이미지가 다운로드되었습니다.");
        } catch (err) {
            console.error(err);
            toast.error("이미지 생성 중 오류가 발생했습니다.");
        } finally {
            setIsGenerating(false);
        }
    };

    // Split summary by newlines or bullets if possible, otherwise just show text
    const summaryPoints = summary.split('\n').filter(line => line.trim().length > 0).slice(0, 3);

    return (
        <div className="flex flex-col gap-4 items-center">
            {/* Control Bar */}
            <div className="flex items-center justify-between w-full max-w-[400px]">
                <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                    <Instagram className="h-4 w-4" />
                    인스타그램 포맷 (1080x1080)
                </div>
                <Button onClick={handleDownload} disabled={isGenerating} size="sm">
                    {isGenerating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Download className="mr-2 h-4 w-4" />}
                    다운로드
                </Button>
            </div>

            {/* Canvas Preview Area */}
            <div className="border rounded-xl bg-zinc-100 dark:bg-zinc-900 p-8 shadow-inner overflow-hidden">
                {/* The Card Itself (1:1 Aspect Ratio) */}
                <div
                    ref={cardRef}
                    className="w-full h-auto aspect-square bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 p-6 sm:p-8 flex flex-col justify-between text-white relative shadow-2xl"
                >
                    {/* Background Pattern/Overlay */}
                    <div className="absolute inset-0 bg-black/10 backdrop-blur-[2px]"></div>

                    {/* Content */}
                    <div className="relative z-10 flex flex-col h-full">
                        {/* Header */}
                        <div className="flex items-center justify-between border-b border-white/20 pb-3 mb-3">
                            <span className="font-bold tracking-widest text-[10px] sm:text-xs uppercase opacity-80">ProInsight Tech Brief</span>
                            <span className="text-[10px] sm:text-xs opacity-80">{date || new Date().toLocaleDateString()}</span>
                        </div>

                        {/* Main Title */}
                        <div className="flex-1 flex items-center">
                            <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold leading-tight tracking-tight drop-shadow-sm line-clamp-4">
                                {title}
                            </h1>
                        </div>

                        {/* Summary / Key Takeaways */}
                        <div className="mt-4 sm:mt-6 bg-white/10 rounded-xl p-3 sm:p-4 backdrop-blur-md border border-white/10">
                            <div className="flex items-center gap-2 mb-2 text-[10px] sm:text-xs font-bold uppercase tracking-wider text-white/70">
                                <Layers className="h-3 w-3" />
                                Key Takeaways
                            </div>
                            <ul className="space-y-1.5 sm:space-y-2 text-xs sm:text-sm font-medium leading-relaxed">
                                {summaryPoints.length > 0 ? (
                                    summaryPoints.map((point, i) => (
                                        <li key={i} className="flex items-start gap-2">
                                            <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-yellow-400 shrink-0"></span>
                                            <span className="line-clamp-2">{point.replace(/^[•-]\s*/, '')}</span>
                                        </li>
                                    ))
                                ) : (
                                    <li className="line-clamp-3">{summary}</li>
                                )}
                            </ul>
                        </div>

                        {/* Footer */}
                        <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-white/20 flex items-center justify-between text-[10px] sm:text-xs opacity-75">
                            <span>Written by AI Agent</span>
                            <span className="font-serif italic">proinsight.io</span>
                        </div>
                    </div>
                </div>
            </div>
            <p className="text-xs text-center text-muted-foreground">
                * 위 이미지는 미리보기입니다. 다운로드 시 고해상도로 저장됩니다.
            </p>
        </div>
    );
}
