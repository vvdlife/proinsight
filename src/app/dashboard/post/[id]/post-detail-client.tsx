"use client";

import { useRef, useState, useTransition } from "react";
import dynamic from "next/dynamic";
import { useReactToPrint } from "react-to-print";
import { toast } from "sonner";

// Actions
import { updatePost } from "@/features/post/actions/update-post";
import { optimizePost } from "@/features/post/actions/optimize-post";
import { runSEOAnalysis, AnalyzeSEOResponse } from "@/features/post/actions/analyze-seo";
import { generateVoiceBriefing } from "@/features/post/actions/generate-voice";

// Components
import { MarkdownViewer } from "@/features/editor/components/MarkdownViewer";
import { SeoAnalysisPanel } from "@/features/post/components/SeoAnalysisPanel";
import { SocialMediaDashboard } from "@/features/post/components/SocialMediaDashboard";
import { ReadingProgressBar } from "@/features/post/components/ReadingProgressBar";
import { TableOfContents } from "@/features/post/components/TableOfContents";
import { AudioPlayer } from "@/features/post/components/AudioPlayer";
import { PostHeader } from "@/features/post/components/PostHeader";
import { PostActionToolbar } from "@/features/post/components/PostActionToolbar";
import { WordPressDialog } from "@/features/publishing/components/wordpress-dialog";

// UI
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { convertMarkdownToHtml } from "@/lib/utils/markdown-to-html";
import { copyToClipboardAsRichText } from "@/lib/utils/clipboard";

// Dynamic import for MDXEditor to avoid SSR issues
const MarkdownEditor = dynamic(() => import("@/features/editor/components/MarkdownEditor"), {
    ssr: false,
    loading: () => <div className="h-[500px] w-full animate-pulse bg-muted rounded-lg" />,
});

interface PostDetailClientProps {
    post: any; // Prisma post type
}

export function PostDetailClient({ post: initialPost }: PostDetailClientProps) {
    // -------------------------------------------------------------------------
    // State Management
    // -------------------------------------------------------------------------
    const [isEditing, setIsEditing] = useState(false);
    const [content, setContent] = useState(initialPost.content);
    const [isPending, startTransition] = useTransition();

    // Undo/Redo/Backup for Optimization
    const [prevContent, setPrevContent] = useState<string | null>(null);

    // Feature: SEO
    const [seoResult, setSeoResult] = useState<AnalyzeSEOResponse["data"] | null>(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [isSheetOpen, setIsSheetOpen] = useState(false); // SEO Sheet Control

    // Feature: Voice Blog
    const [isGeneratingAudio, setIsGeneratingAudio] = useState(false);
    const [audioUrl, setAudioUrl] = useState<string | null>(initialPost.audioUrl);

    // Feature: Optimizer
    const [isOptimizing, setIsOptimizing] = useState(false);

    // Feature: Print
    const printRef = useRef<HTMLDivElement>(null);
    const handlePrint = useReactToPrint({
        contentRef: printRef,
        documentTitle: initialPost.topic,
    });

    // -------------------------------------------------------------------------
    // Actions & Handlers
    // -------------------------------------------------------------------------
    const handleSave = () => {
        startTransition(async () => {
            const result = await updatePost(initialPost.id, content);
            if (result.success) {
                toast.success("저장 완료!", { description: "게시글이 성공적으로 수정되었습니다." });
                setIsEditing(false);
                setPrevContent(null);
            } else {
                toast.error("저장 실패", { description: result.message });
            }
        });
    };

    const handleCancel = () => {
        setContent(initialPost.content);
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

    const handleGenerateAudio = async () => {
        setIsGeneratingAudio(true);
        toast.info("오디오 브리핑 생성 시작...", { description: "대본 작성 및 음성 변환 중입니다. (약 10-20초 소요)" });

        try {
            const result = await generateVoiceBriefing(initialPost.id, content);
            if (result.success && result.audioUrl) {
                setAudioUrl(result.audioUrl);
                toast.success("오디오 브리핑이 완성되었습니다!", { description: "상단 플레이어에서 확인하세요." });
            } else {
                toast.error("오디오 생성 실패", { description: result.message });
            }
        } catch (error) {
            console.error(error);
            toast.error("오디오 생성 중 오류가 발생했습니다.");
        } finally {
            setIsGeneratingAudio(false);
        }
    };

    const handleAnalyzeSEO = async () => {
        setIsSheetOpen(true); // Open sheet
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
        setPrevContent(content);
        setIsOptimizing(true);
        toast.info("AI 최적화가 시작되었습니다...");

        const result = await optimizePost(content, seoResult.suggestions);
        setIsOptimizing(false);

        if (result.success && result.data) {
            setContent(result.data);
            setIsEditing(true);
            setIsSheetOpen(false); // Close sheet to show changes
            toast.success("최적화 완료!", { description: "변경된 내용을 확인하세요." });
        } else {
            toast.error("최적화 실패", { description: result.message });
            setPrevContent(null);
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
        const success = await copyToClipboardAsRichText(html, content);
        if (success) {
            toast.success("스마트 복사 완료!", { description: "네이버/티스토리 등에 바로 붙여넣기 하세요." });
        } else {
            toast.error("복사 실패");
        }
    };

    // -------------------------------------------------------------------------
    // Rendering
    // -------------------------------------------------------------------------
    return (
        <div className="flex flex-col gap-6 p-4 md:p-8 max-w-4xl mx-auto relative min-h-screen">
            {/* 1. Global Utilities */}
            <ReadingProgressBar />
            <TableOfContents content={content} />

            {/* 2. Unified Action Toolbar */}
            <PostActionToolbar
                isEditing={isEditing}
                isPending={isPending}
                isGeneratingAudio={isGeneratingAudio}
                hasAudio={!!audioUrl}
                onToggleEdit={setIsEditing}
                onSave={handleSave}
                onCancel={handleCancel}
                onRevert={handleRevert}
                canRevert={!!prevContent}
                onAnalyzeSEO={() => isSheetOpen ? setIsSheetOpen(false) : handleAnalyzeSEO()}
                onGenerateAudio={handleGenerateAudio}
                onDownloadMarkdown={handleDownloadMarkdown}
                onPrint={handlePrint}
                onSmartCopy={handleSmartCopy}
            />

            {/* 3. Main Content Area */}
            <div ref={printRef} className="flex flex-col gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">

                {/* Header Section */}
                <PostHeader
                    topic={initialPost.topic}
                    tone={initialPost.tone}
                    createdAt={initialPost.createdAt}
                    coverImage={initialPost.coverImage}
                />

                {/* Audio Player (Conditional) */}
                {audioUrl && (
                    <div className="print:hidden">
                        <AudioPlayer src={audioUrl} />
                    </div>
                )}

                {/* Editor / Viewer */}
                <div className={isEditing ? "" : "bg-card rounded-xl border p-6 md:p-10 shadow-sm min-h-[500px]"}>
                    {isEditing ? (
                        <MarkdownEditor
                            markdown={content}
                            onChange={setContent}
                            className="min-h-[600px] shadow-sm rounded-lg border-primary/20"
                        />
                    ) : (
                        <div className="print:p-0">
                            <MarkdownViewer content={content} />
                        </div>
                    )}
                </div>
            </div>

            {/* 4. Footer Utilities */}

            {/* SEO Analysis Sheet */}
            <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
                <SheetContent className="overflow-y-auto min-w-[400px]">
                    <SheetHeader>
                        <SheetTitle>SEO 분석 & 최적화</SheetTitle>
                        <SheetDescription>
                            AI가 콘텐츠를 분석하여 검색 엔진 최적화 점수와 개선 제안을 제공합니다.
                        </SheetDescription>
                    </SheetHeader>
                    <SeoAnalysisPanel
                        seoResult={seoResult}
                        isAnalyzing={isAnalyzing}
                        isOptimizing={isOptimizing}
                        onAnalyze={handleAnalyzeSEO}
                        onOptimize={handleOptimize}
                    />
                </SheetContent>
            </Sheet>

            {/* Social Media & OSMU Area */}
            <div className="mt-12 border-t pt-10 print:hidden">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h2 className="text-2xl font-bold tracking-tight">OSMU Studio</h2>
                        <p className="text-muted-foreground mt-1">
                            작성된 콘텐츠를 다양한 포맷으로 확장하세요.
                        </p>
                    </div>
                    {/* WordPress Button also lives here for now, or could move to toolbar */}
                    <WordPressDialog post={{ ...initialPost, content }} />
                </div>
                <SocialMediaDashboard
                    postId={initialPost.id}
                    postContent={content}
                    postTitle={initialPost.topic}
                    existingPosts={initialPost.socialPosts || []}
                />
            </div>
        </div>
    );
}
