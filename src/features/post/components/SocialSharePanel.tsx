"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Loader2, Sparkles, Copy, Instagram, Linkedin, Twitter, Download } from "lucide-react";
import { runSocialContentGeneration } from "@/features/post/actions/generate-social";
import { SocialContentResult } from "@/lib/services/ai";

interface SocialSharePanelProps {
    postContent: string;
    postTitle: string;
    postImage: string | null;
}

export function SocialSharePanel({ postContent, postTitle, postImage }: SocialSharePanelProps) {
    const [isGenerating, setIsGenerating] = useState(false);
    const [result, setResult] = useState<SocialContentResult | null>(null);
    const [activeTab, setActiveTab] = useState<'instagram' | 'twitter' | 'linkedin'>('instagram');

    const handleGenerate = async () => {
        setIsGenerating(true);
        try {
            const response = await runSocialContentGeneration(postContent, activeTab);

            if (response.success && response.data) {
                setResult(response.data);
                toast.success("홍보 문구가 생성되었습니다!");
            } else {
                toast.error(response.message || "생성 실패");
            }
        } catch (error) {
            console.error(error);
            toast.error("생성 중 오류가 발생했습니다.");
        } finally {
            setIsGenerating(false);
        }
    };

    const copyToClipboard = () => {
        if (!result) return;
        const fullText = `${result.content}\n\n${result.hashtags.join(" ")}`;
        navigator.clipboard.writeText(fullText);
        toast.success("클립보드에 복사되었습니다.");
    };

    const downloadImage = async () => {
        if (!postImage) {
            toast.error("다운로드할 이미지가 없습니다.");
            return;
        }

        try {
            const response = await fetch(postImage);
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `proinsight-social-${activeTab}.png`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
            toast.success("이미지가 다운로드되었습니다.");
        } catch (e) {
            console.error("Image download failed (CORS likely):", e);
            // Fallback: Open in new tab
            window.open(postImage, "_blank");
            toast.info("새 탭에서 이미지를 엽니다. (우클릭하여 저장하세요)");
        }
    };

    return (
        <div className="mt-8 space-y-6">
            <div className="space-y-4">
                <Tabs defaultValue="instagram" className="w-full" onValueChange={(v) => {
                    setActiveTab(v as any);
                    setResult(null); // Reset result on tab change
                }}>
                    <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="instagram" className="flex items-center gap-2">
                            <Instagram className="h-4 w-4" /> Instagram
                        </TabsTrigger>
                        <TabsTrigger value="twitter" className="flex items-center gap-2">
                            <Twitter className="h-4 w-4" /> Twitter
                        </TabsTrigger>
                        <TabsTrigger value="linkedin" className="flex items-center gap-2">
                            <Linkedin className="h-4 w-4" /> LinkedIn
                        </TabsTrigger>
                    </TabsList>

                    <div className="mt-4">
                        {/* Image Preview (Common) */}
                        {postImage && (
                            <div className="mb-4 relative group rounded-lg overflow-hidden border aspect-video bg-muted/50 flex items-center justify-center">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img src={postImage} alt="Post Cover" className="object-cover w-full h-full" />
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                    <Button variant="secondary" size="sm" onClick={downloadImage}>
                                        <Download className="mr-2 h-4 w-4" /> 이미지 다운로드
                                    </Button>
                                </div>
                            </div>
                        )}

                        {!result ? (
                            <div className="flex flex-col items-center justify-center space-y-4 py-8 border rounded-lg bg-muted/20">
                                <Sparkles className="h-10 w-10 text-primary/50" />
                                <p className="text-center text-sm text-muted-foreground">
                                    AI가 <b>{activeTab === 'instagram' ? '인스타그램' : activeTab === 'twitter' ? '트위터' : '링크드인'}</b>에 딱 맞는<br />
                                    홍보 문구와 해시태그를 작성해드립니다.
                                </p>
                                <Button onClick={handleGenerate} disabled={isGenerating} className="bg-gradient-to-r from-pink-500 to-violet-500 text-white border-0 hover:from-pink-600 hover:to-violet-600">
                                    {isGenerating ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            작성 중...
                                        </>
                                    ) : (
                                        "AI 홍보 문구 생성하기"
                                    )}
                                </Button>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <label className="text-sm font-medium">생성된 문구</label>
                                        <Button variant="ghost" size="sm" onClick={copyToClipboard}>
                                            <Copy className="h-4 w-4 mr-1" /> 전체 복사
                                        </Button>
                                    </div>
                                    <Textarea
                                        className="min-h-[200px] font-sans resize-none"
                                        value={`${result.content}\n\n${result.hashtags.join(" ")}`}
                                        readOnly
                                    />
                                </div>
                                <Button onClick={handleGenerate} variant="outline" className="w-full" disabled={isGenerating}>
                                    다시 생성하기
                                </Button>
                            </div>
                        )}
                    </div>
                </Tabs>
            </div>
        </div>
    );
}
