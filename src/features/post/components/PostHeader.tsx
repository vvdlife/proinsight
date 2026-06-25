"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";
import { Download, Calendar, ArrowLeft, Sparkles, Loader2, ImagePlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { toast } from "sonner";
import { 
    Dialog, 
    DialogContent, 
    DialogHeader, 
    DialogTitle, 
    DialogDescription,
    DialogFooter,
    DialogTrigger,
    DialogClose
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";

interface PostHeaderProps {
    topic: string;
    tone: string;
    createdAt: Date | string;
    coverImage: string | null;
    className?: string;
    isRegeneratingImage?: boolean;
    onRegenerateImage?: (customPrompt?: string) => Promise<void>;
}

export function PostHeader({ 
    topic, 
    tone, 
    createdAt, 
    coverImage, 
    className,
    isRegeneratingImage = false,
    onRegenerateImage
}: PostHeaderProps) {
    const [customPrompt, setCustomPrompt] = useState("");
    const [isOpen, setIsOpen] = useState(false);

    const handleDownloadImage = async () => {
        if (!coverImage) return;
        try {
            const response = await fetch(coverImage);
            const blob = await response.blob();
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `${topic.replace(/\s+/g, "_")}_cover.png`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            toast.success("이미지 저장 완료");
        } catch (error) {
            console.error(error);
            toast.error("이미지 다운로드 실패");
        }
    };

    const handleRegenerate = async () => {
        if (!onRegenerateImage) return;
        setIsOpen(false);
        await onRegenerateImage(customPrompt);
        setCustomPrompt("");
    };

    const displayDate = typeof createdAt === 'string' ? new Date(createdAt) : createdAt;

    const renderDialogContent = () => (
        <DialogContent className="sm:max-w-[480px]">
            <DialogHeader>
                <DialogTitle className="flex items-center gap-2 text-xl font-bold">
                    <Sparkles className="h-5 w-5 text-primary" />
                    대표 이미지 AI 생성
                </DialogTitle>
                <DialogDescription className="text-sm text-muted-foreground mt-1">
                    게시글 주제: <strong className="text-foreground">"{topic}"</strong>
                    <br />
                    글의 주제와 본문 맥락을 분석하여 가장 잘 부합하는 대표 이미지를 AI로 새로 만듭니다.
                </DialogDescription>
            </DialogHeader>
            <div className="py-4 space-y-4">
                <div className="space-y-2">
                    <label htmlFor="custom-prompt" className="text-sm font-medium leading-none">
                        원하는 디자인 컨셉 또는 스타일 지시어 (선택)
                    </label>
                    <Textarea
                        id="custom-prompt"
                        placeholder="예: 3D 미니멀 그래픽, 따뜻한 톤의 파스텔 일러스트, 어두운 네온 사이버펑크 느낌, 직관적인 차트가 포함된 금융 스타일 등..."
                        value={customPrompt}
                        onChange={(e) => setCustomPrompt(e.target.value)}
                        className="resize-none h-24 text-sm"
                    />
                    <p className="text-xs text-muted-foreground">
                        비워두시면 본문 내용에 가장 잘 부합하는 표준 스타일로 이미지 프롬프트가 자동 설계됩니다.
                    </p>
                </div>
            </div>
            <DialogFooter className="gap-2 sm:gap-0">
                <DialogClose asChild>
                    <Button type="button" variant="ghost">취소</Button>
                </DialogClose>
                <Button type="button" onClick={handleRegenerate} disabled={isRegeneratingImage}>
                    {isRegeneratingImage ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            생성 중...
                        </>
                    ) : (
                        "생성 시작"
                    )}
                </Button>
            </DialogFooter>
        </DialogContent>
    );

    return (
        <div className={className}>
            {/* Back Link */}
            <div className="mb-6 print:hidden">
                <Button asChild variant="ghost" className="pl-0 hover:bg-transparent -ml-2 text-muted-foreground hover:text-foreground">
                    <Link href="/dashboard">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        목록으로 돌아가기
                    </Link>
                </Button>
            </div>

            <div className="flex flex-col gap-6">
                {/* Cover Image Placeholder when coverImage is null */}
                {!coverImage && (
                    <div className="relative w-full aspect-video rounded-xl overflow-hidden border border-dashed bg-muted/30 hover:bg-muted/50 transition-colors flex flex-col items-center justify-center gap-4 p-8 text-center group print:hidden min-h-[250px] shadow-sm">
                        {isRegeneratingImage ? (
                            <div className="flex flex-col items-center gap-3">
                                <Loader2 className="h-10 w-10 text-primary animate-spin" />
                                <p className="text-sm font-medium text-muted-foreground animate-pulse">
                                    주제에 맞는 최적의 이미지를 디자인하는 중...
                                </p>
                            </div>
                        ) : (
                            <>
                                <div className="p-4 rounded-full bg-primary/5 text-primary group-hover:scale-110 transition-transform">
                                    <ImagePlus className="h-8 w-8" />
                                </div>
                                <div className="space-y-1 max-w-sm">
                                    <h3 className="font-semibold text-base">대표 이미지가 없습니다</h3>
                                    <p className="text-xs text-muted-foreground">
                                        글의 주제와 본문 흐름에 매칭되는 매력적인 AI 대표 이미지를 디자인해보세요.
                                    </p>
                                </div>
                                <Dialog open={isOpen} onOpenChange={setIsOpen}>
                                    <DialogTrigger asChild>
                                        <Button variant="outline" size="sm" className="gap-2 mt-2 shadow-xs">
                                            <Sparkles className="h-3.5 w-3.5" />
                                            대표 이미지 생성하기
                                        </Button>
                                    </DialogTrigger>
                                    {renderDialogContent()}
                                </Dialog>
                            </>
                        )}
                    </div>
                )}

                {/* Cover Image */}
                {coverImage && (
                    <div className="relative w-full aspect-video rounded-xl overflow-hidden border bg-muted group print:hidden shadow-sm">
                        <Image
                            src={coverImage}
                            alt={`Cover image for ${topic}`}
                            fill
                            className="object-cover transition-transform duration-700 group-hover:scale-105"
                            priority
                        />

                        {/* Regenerating overlay */}
                        {isRegeneratingImage && (
                            <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center gap-3 backdrop-blur-[2px] z-10">
                                <Loader2 className="h-10 w-10 text-white animate-spin" />
                                <p className="text-sm font-medium text-white/90 animate-pulse">
                                    새로운 이미지 디자인 중...
                                </p>
                            </div>
                        )}

                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3 backdrop-blur-[2px] z-0">
                            <Button variant="secondary" onClick={handleDownloadImage} className="gap-2 rounded-full shadow-lg">
                                <Download className="h-4 w-4" />
                                이미지 다운로드
                            </Button>

                            {onRegenerateImage && !isRegeneratingImage && (
                                <Dialog open={isOpen} onOpenChange={setIsOpen}>
                                    <DialogTrigger asChild>
                                        <Button variant="default" className="gap-2 rounded-full shadow-lg">
                                            <Sparkles className="h-4 w-4" />
                                            디자인 변경
                                        </Button>
                                    </DialogTrigger>
                                    {renderDialogContent()}
                                </Dialog>
                            )}
                        </div>
                    </div>
                )}

                {/* Print Only Cover */}
                {coverImage && (
                    <div className="hidden print:block w-full mb-8">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={coverImage} alt="Cover" className="w-full h-auto max-h-[400px] object-cover rounded-lg" />
                    </div>
                )}

                {/* Title & Meta */}
                <div className="space-y-4">
                    <div className="flex items-center gap-2 mb-2">
                        <Badge variant="outline" className="capitalize px-3 py-1 text-xs font-normal">
                            {tone}
                        </Badge>
                    </div>
                    <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-foreground leading-tight">
                        {topic}
                    </h1>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="h-3.5 w-3.5" />
                        <span>
                            {displayDate.toLocaleDateString("ko-KR", {
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                            })}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
}
