"use client";

import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, Pencil, Save, X, Loader2, Download, Search, FileText, Printer, BarChart, Copy, RotateCcw, Sparkles } from "lucide-react";
import { MarkdownViewer } from "@/components/markdown-viewer";
import { CopyButton } from "@/components/copy-button";
import { useState, useTransition, useRef } from "react";
import dynamic from "next/dynamic";
import { updatePost } from "@/features/post/actions/update-post";
import { optimizePost } from "@/features/post/actions/optimize-post";
import { runSEOAnalysis, AnalyzeSEOResponse } from "@/features/post/actions/analyze-seo";
import { toast } from "sonner";
import { Switch } from "@/components/ui/switch";
import { convertMarkdownToHtml } from "@/lib/utils/markdown-to-html";
import { copyToClipboardAsRichText } from "@/lib/utils/clipboard";
import { WordPressDialog } from "@/features/publishing/components/wordpress-dialog";
import { Label } from "@/components/ui/label";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet";
import { Progress } from "@/components/ui/progress";
import { useReactToPrint } from "react-to-print";


// Dynamic import for MDXEditor to avoid SSR issues
const MarkdownEditor = dynamic(() => import("@/components/markdown-editor"), {
    ssr: false,
    loading: () => <div className="h-[500px] w-full animate-pulse bg-muted rounded-lg" />,
});

interface PostDetailClientProps {
    post: any; // Prisma post type
}

export function PostDetailClient({ post: initialPost }: PostDetailClientProps) {
    const [isEditing, setIsEditing] = useState(false);
    const [content, setContent] = useState(initialPost.content);
    const [isPending, startTransition] = useTransition();

    // SEO State
    const [seoResult, setSeoResult] = useState<AnalyzeSEOResponse["data"] | null>(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);

    // Optimizer State
    const [isOptimizing, setIsOptimizing] = useState(false);
    const [prevContent, setPrevContent] = useState<string | null>(null);

    // Print/PDF Ref
    const printRef = useRef<HTMLDivElement>(null);
    const handlePrint = useReactToPrint({
        contentRef: printRef,
        documentTitle: initialPost.topic,
    });

    const handleSave = () => {
        startTransition(async () => {
            const result = await updatePost(initialPost.id, content);
            if (result.success) {
                toast.success("저장 완료!", { description: "게시글이 성공적으로 수정되었습니다." });
                setIsEditing(false);
                setPrevContent(null); // Clear revert history on save
            } else {
                toast.error("저장 실패", { description: result.message });
            }
        });
    };

    const handleCancel = () => {
        setContent(initialPost.content); // Reset content
        setIsEditing(false);
        setPrevContent(null);
    };

    const handleRevert = () => {
        if (prevContent) {
            setContent(prevContent);
            setPrevContent(null);
            toast.success("원래 내용으로 복구되었습니다.");
        }
    };

    const handleAnalyzeSEO = async () => {
        setIsAnalyzing(true);
        const result = await runSEOAnalysis(content, initialPost.topic);
        setIsAnalyzing(false);

        if (result.success && result.data) {
            setSeoResult(result.data);
            toast.success("SEO 분석 완료", { description: "분석 리포트를 확인하세요." });
        } else {
            toast.error("분석 실패", { description: result.message });
        }
    };

    const handleOptimize = async () => {
        if (!seoResult || !seoResult.suggestions) return;

        // Backup current content
        setPrevContent(content);
        setIsOptimizing(true);

        toast.info("AI 최적화가 시작되었습니다...", { description: "잠시만 기다려주세요." });

        const result = await optimizePost(content, seoResult.suggestions);

        setIsOptimizing(false);

        if (result.success && result.data) {
            setContent(result.data);
            setIsEditing(true); // Automatically switch to edit mode to show changes
            toast.success("최적화 완료!", { description: "변경된 내용을 확인하세요. 마음에 들지 않으면 '복구'할 수 있습니다." });
        } else {
            toast.error("최적화 실패", { description: result.message });
            setPrevContent(null); // Clear backup on failure
        }
    };

    const handleDownloadMarkdown = () => {
        const blob = new Blob([content], { type: "text/markdown" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${initialPost.topic.replace(/\s+/g, "_")}.md`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        toast.success("다운로드 완료");
    };

    const handleSmartCopy = async () => {
        const html = convertMarkdownToHtml(content);
        // Clean up markdown for plain text copy
        const plainText = content;

        const success = await copyToClipboardAsRichText(html, plainText);
        if (success) {
            toast.success("스마트 복사 완료!", { description: "네이버/티스토리 등에 바로 붙여넣기 하세요." });
        } else {
            toast.error("복사 실패");
        }
    };

    const handleDownloadImage = async () => {
        if (!initialPost.coverImage) return;
        try {
            const response = await fetch(initialPost.coverImage);
            const blob = await response.blob();
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `${initialPost.topic.replace(/\s+/g, "_")}_cover.png`;
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

    return (
        <div className="flex flex-col gap-6 p-4 md:p-8 max-w-4xl mx-auto">
            {/* Print Area Wrapper */}
            <div ref={printRef} className="flex flex-col gap-6">
                {/* Header */}
                <div className="flex flex-col gap-4">
                    <div className="flex items-center justify-between print:hidden">
                        <Button asChild variant="ghost" className="w-fit pl-0 hover:bg-transparent">
                            <Link href="/dashboard" className="flex items-center text-muted-foreground hover:text-foreground">
                                <ChevronLeft className="mr-2 h-4 w-4" />
                                목록으로 돌아가기
                            </Link>
                        </Button>

                        <div className="flex items-center space-x-2">
                            {/* Download Menu */}
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="outline" size="icon">
                                        <Download className="h-4 w-4" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    <DropdownMenuItem onClick={handleDownloadMarkdown}>
                                        <FileText className="mr-2 h-4 w-4" />
                                        Markdown 다운로드
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={handlePrint}>
                                        <Printer className="mr-2 h-4 w-4" />
                                        PDF로 저장 (인쇄)
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>

                            {/* Smart Copy */}
                            <Button variant="outline" size="sm" onClick={handleSmartCopy} className="gap-2 hidden sm:flex">
                                <Copy className="h-4 w-4" />
                                스마트 복사
                            </Button>

                            {/* WordPress Publish */}
                            <WordPressDialog post={{ ...initialPost, content }} />

                            {/* SEO Analyzer */}
                            <Sheet modal={false}>
                                <SheetTrigger asChild>
                                    <Button variant="outline" size="icon" title="SEO 분석">
                                        <Search className="h-4 w-4" />
                                    </Button>
                                </SheetTrigger>
                                <SheetContent className="overflow-y-auto min-w-[400px]">
                                    <SheetHeader>
                                        <SheetTitle>SEO 분석 & 최적화</SheetTitle>
                                        <SheetDescription>
                                            AI가 콘텐츠를 분석하여 검색 엔진 최적화 점수와 개선 제안을 제공합니다.
                                        </SheetDescription>
                                    </SheetHeader>

                                    <div className="mt-8 space-y-6">
                                        {!seoResult ? (
                                            <div className="flex flex-col items-center justify-center space-y-4 py-8">
                                                <BarChart className="h-12 w-12 text-muted-foreground opacity-50" />
                                                <p className="text-center text-sm text-muted-foreground">
                                                    아직 분석 결과가 없습니다.<br />
                                                    버튼을 눌러 분석을 시작하세요.
                                                </p>
                                                <Button onClick={handleAnalyzeSEO} disabled={isAnalyzing}>
                                                    {isAnalyzing ? (
                                                        <>
                                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                            분석 중...
                                                        </>
                                                    ) : (
                                                        "SEO 분석 실행"
                                                    )}
                                                </Button>
                                            </div>
                                        ) : (
                                            <div className="space-y-6">
                                                <div className="space-y-2">
                                                    <div className="flex items-center justify-between">
                                                        <h3 className="font-semibold text-lg">SEO 점수</h3>
                                                        <span className={`text-2xl font-bold ${seoResult.seoScore >= 80 ? "text-green-500" : seoResult.seoScore >= 50 ? "text-yellow-500" : "text-red-500"}`}>
                                                            {seoResult.seoScore}점
                                                        </span>
                                                    </div>
                                                    <Progress value={seoResult.seoScore} className="h-3" indicatorClassName={seoResult.seoScore >= 80 ? "bg-green-500" : seoResult.seoScore >= 50 ? "bg-yellow-500" : "bg-red-500"} />
                                                </div>

                                                <div className="space-y-4">
                                                    <div className="p-4 bg-muted rounded-lg space-y-2">
                                                        <div className="flex items-center justify-between">
                                                            <p className="text-sm font-medium">추천 메타 제목</p>
                                                            <Button
                                                                size="icon"
                                                                variant="ghost"
                                                                className="h-6 w-6"
                                                                onClick={() => {
                                                                    navigator.clipboard.writeText(seoResult.metaTitle);
                                                                    toast.success("메타 제목이 복사되었습니다.");
                                                                }}
                                                                title="복사하기"
                                                            >
                                                                <Copy className="h-3 w-3" />
                                                            </Button>
                                                        </div>
                                                        <p className="text-sm text-muted-foreground break-all">{seoResult.metaTitle}</p>
                                                    </div>
                                                    <div className="p-4 bg-muted rounded-lg space-y-2">
                                                        <div className="flex items-center justify-between">
                                                            <p className="text-sm font-medium">추천 메타 설명</p>
                                                            <Button
                                                                size="icon"
                                                                variant="ghost"
                                                                className="h-6 w-6"
                                                                onClick={() => {
                                                                    navigator.clipboard.writeText(seoResult.metaDescription);
                                                                    toast.success("메타 설명이 복사되었습니다.");
                                                                }}
                                                                title="복사하기"
                                                            >
                                                                <Copy className="h-3 w-3" />
                                                            </Button>
                                                        </div>
                                                        <p className="text-sm text-muted-foreground break-all">{seoResult.metaDescription}</p>
                                                    </div>
                                                </div>

                                                <div className="space-y-2">
                                                    <h3 className="font-semibold">개선 제안</h3>
                                                    <ul className="space-y-2">
                                                        {seoResult.suggestions.map((suggestion, i) => (
                                                            <li key={i} className="flex gap-2 text-sm text-muted-foreground">
                                                                <span className="text-primary">•</span>
                                                                {suggestion}
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>

                                                <div className="pt-4 border-t space-y-2">
                                                    <Button onClick={handleAnalyzeSEO} disabled={isAnalyzing} variant="outline" className="w-full">
                                                        {isAnalyzing ? "재분석 중..." : "다시 분석하기"}
                                                    </Button>
                                                    <Button onClick={handleOptimize} disabled={isOptimizing || isAnalyzing} className="w-full bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white border-0">
                                                        {isOptimizing ? (
                                                            <>
                                                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                                최적화 중...
                                                            </>
                                                        ) : (
                                                            <>
                                                                <Sparkles className="mr-2 h-4 w-4" />
                                                                AI로 본문 최적화하기
                                                            </>
                                                        )}
                                                    </Button>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </SheetContent>
                            </Sheet>


                            {isEditing ? (
                                <div className="flex items-center space-x-2 animate-in fade-in slide-in-from-right-5">
                                    {prevContent && (
                                        <Button variant="destructive" size="sm" onClick={handleRevert} disabled={isPending} title="최적화 전으로 복구">
                                            <RotateCcw className="mr-2 h-4 w-4" />
                                            복구
                                        </Button>
                                    )}
                                    <Button variant="ghost" onClick={handleCancel} disabled={isPending}>
                                        <X className="mr-2 h-4 w-4" />
                                        취소
                                    </Button>
                                    <Button onClick={handleSave} disabled={isPending}>
                                        {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                                        저장
                                    </Button>
                                </div>
                            ) : (
                                <div className="flex items-center space-x-2 bg-muted/30 p-1.5 rounded-lg border">
                                    <Label htmlFor="edit-mode" className="text-xs font-medium cursor-pointer px-2">읽기</Label>
                                    <Switch
                                        id="edit-mode"
                                        checked={isEditing}
                                        onCheckedChange={setIsEditing}
                                    />
                                    <Label htmlFor="edit-mode" className="text-xs font-medium cursor-pointer px-2">수정</Label>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="flex flex-col gap-6">
                        {initialPost.coverImage && (
                            <div className="relative w-full aspect-video rounded-lg overflow-hidden border bg-muted group print:hidden">
                                <Image
                                    src={initialPost.coverImage}
                                    alt={`Cover image for ${initialPost.topic}`}
                                    fill
                                    className="object-cover"
                                    priority
                                />
                                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                    <Button variant="secondary" onClick={handleDownloadImage} className="gap-2">
                                        <Download className="h-4 w-4" />
                                        이미지 다운로드
                                    </Button>
                                </div>
                            </div>
                        )}

                        {/* Print Only Cover Image */}
                        {initialPost.coverImage && (
                            <div className="hidden print:block w-full mb-8">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img src={initialPost.coverImage} alt="Cover" className="w-full h-auto max-h-[400px] object-cover rounded-lg" />
                            </div>
                        )}

                        <div className="flex items-start justify-between gap-4">
                            <div className="space-y-2">
                                <h1 className="text-3xl font-bold tracking-tight">{initialPost.topic}</h1>
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <Badge variant="secondary" className="capitalize">
                                        {initialPost.tone}
                                    </Badge>
                                    <span>•</span>
                                    <span>
                                        {initialPost.createdAt.toLocaleDateString("ko-KR", {
                                            year: "numeric",
                                            month: "long",
                                            day: "numeric",
                                            hour: "2-digit",
                                            minute: "2-digit",
                                        })}
                                    </span>
                                </div>
                            </div>
                            {!isEditing && <div className="print:hidden"><CopyButton content={content} /></div>}
                        </div>
                    </div>
                </div>

                {/* Content Area */}
                <div className={isEditing ? "" : "bg-card rounded-lg border p-6 md:p-10 shadow-sm min-h-[500px]"}>
                    {isEditing ? (
                        <MarkdownEditor
                            markdown={content}
                            onChange={setContent}
                            className="min-h-[600px] shadow-sm"
                        />
                    ) : (
                        <div className="print:p-0">
                            <MarkdownViewer content={content} />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
