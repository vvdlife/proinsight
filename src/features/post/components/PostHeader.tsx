"use client";

import { Badge } from "@/components/ui/badge";
import Image from "next/image";
import { Download, Calendar, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { toast } from "sonner";

interface PostHeaderProps {
    topic: string;
    tone: string;
    createdAt: Date | string;
    coverImage: string | null;
    className?: string;
}

export function PostHeader({ topic, tone, createdAt, coverImage, className }: PostHeaderProps) {
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

    const displayDate = typeof createdAt === 'string' ? new Date(createdAt) : createdAt;

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
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[2px]">
                            <Button variant="secondary" onClick={handleDownloadImage} className="gap-2 rounded-full">
                                <Download className="h-4 w-4" />
                                이미지 다운로드
                            </Button>
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
