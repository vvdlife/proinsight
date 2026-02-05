"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { Monitor, Smartphone } from "lucide-react";

interface SerpSimulatorProps {
    title: string;
    description: string;
    url: string;
}

export function SerpSimulator({ title, description, url }: SerpSimulatorProps) {
    const [view, setView] = useState<"desktop" | "mobile">("desktop");

    // Google truncates around 600px, roughly 60 chars for title, 160 for desc.
    const truncate = (str: string, max: number) => {
        return str.length > max ? str.substring(0, max) + "..." : str;
    };

    const displayTitle = truncate(title, 60);
    const displayDesc = truncate(description, 160);

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium">검색 결과 미리보기 (Google)</h3>
                <Tabs value={view} onValueChange={(v) => setView(v as any)} className="w-[160px]">
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="desktop">
                            <Monitor className="w-4 h-4" />
                        </TabsTrigger>
                        <TabsTrigger value="mobile">
                            <Smartphone className="w-4 h-4" />
                        </TabsTrigger>
                    </TabsList>
                </Tabs>
            </div>

            <Card className="p-6 bg-white dark:bg-zinc-900 border overflow-hidden">
                {view === "desktop" ? (
                    <div className="max-w-[600px] font-sans">
                        <div className="flex items-center gap-2 mb-1">
                            <div className="flex flex-col">
                                <span className="text-sm text-[#202124] dark:text-[#dadce0]">{url}</span>
                                <span className="text-xs text-[#5f6368] dark:text-[#bdc1c6] -mt-0.5">› blog › post</span>
                            </div>
                        </div>
                        <a href="#" className="block text-xl text-[#1a0dab] dark:text-[#8ab4f8] hover:underline mb-1 visited:text-[#660099] dark:visited:text-[#c58af9]">
                            {displayTitle}
                        </a>
                        <p className="text-sm text-[#4d5156] dark:text-[#bdc1c6] leading-relaxed">
                            <span className="text-[#70757a] dark:text-[#9aa0a6] text-xs mr-2">
                                {new Date().toISOString().split("T")[0]} —
                            </span>
                            {displayDesc}
                        </p>
                    </div>
                ) : (
                    <div className="max-w-[360px] font-sans">
                        <div className="flex items-center gap-2 mb-2">
                            <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-xs border">
                                📃
                            </div>
                            <div className="flex flex-col">
                                <span className="text-sm text-[#202124] dark:text-[#dadce0]">{url}</span>
                                <span className="text-xs text-[#5f6368] dark:text-[#bdc1c6]">proinsight-ai.com › post</span>
                            </div>
                        </div>
                        <a href="#" className="block text-lg text-[#1a0dab] dark:text-[#8ab4f8] hover:underline mb-1">
                            {displayTitle}
                        </a>
                        <p className="text-sm text-[#4d5156] dark:text-[#bdc1c6] leading-relaxed">
                            <span className="text-[#70757a] dark:text-[#9aa0a6] text-xs mr-2">
                                4일 전 —
                            </span>
                            {displayDesc}
                        </p>
                    </div>
                )}
            </Card>

            <div className="text-xs text-muted-foreground bg-muted/50 p-2 rounded">
                💡 <strong>Tip:</strong> 제목은 60자, 설명은 160자 이내로 작성해야 검색 결과에서 잘리지 않습니다.
                {title.length > 60 && <span className="text-red-500 font-bold ml-2"> (현재 제목 {title.length}자 - 짤림 위험)</span>}
            </div>
        </div>
    );
}
