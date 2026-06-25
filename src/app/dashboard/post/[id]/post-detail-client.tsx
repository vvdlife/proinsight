"use client";

import { useRef, useState, useTransition } from "react";
import dynamic from "next/dynamic";
import { useReactToPrint } from "react-to-print";
import { toast } from "sonner";

// Actions
import { updatePost } from "@/features/post/actions/update-post";
import { generateVoiceBriefing } from "@/features/post/actions/generate-voice";
import { generatePostImage } from "@/features/generator/actions/generate-post";

// Components
import { MarkdownViewer } from "@/features/editor/components/MarkdownViewer";
import { SocialMediaDashboard } from "@/features/post/components/SocialMediaDashboard";
import { ReadingProgressBar } from "@/features/post/components/ReadingProgressBar";
import { TableOfContents } from "@/features/post/components/TableOfContents";
import { AudioPlayer } from "@/features/post/components/AudioPlayer";
import { PostHeader } from "@/features/post/components/PostHeader";
import { PostActionToolbar } from "@/features/post/components/PostActionToolbar";

// UI
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
    // -------------------------------------------------------------------------
    // State Management
    // -------------------------------------------------------------------------
    const [isEditing, setIsEditing] = useState(false);
    const [content, setContent] = useState(initialPost.content);
    const [isPending, startTransition] = useTransition();

    // Feature: Cover Image
    const [coverImage, setCoverImage] = useState<string | null>(initialPost.coverImage);
    const [isRegeneratingImage, setIsRegeneratingImage] = useState(false);

    // Feature: Voice Blog
    const [isGeneratingAudio, setIsGeneratingAudio] = useState(false);
    const [audioUrl, setAudioUrl] = useState<string | null>(initialPost.audioUrl);

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
            } else {
                toast.error("저장 실패", { description: result.message });
            }
        });
    };

    const handleCancel = () => {
        setContent(initialPost.content);
        setIsEditing(false);
    };

    const handleGenerateAudio = async () => {
        setIsGeneratingAudio(true);
        toast.info("팟캐스트 브리핑 생성 시작...", { description: "2명의 AI 호스트 대본 작성 및 음성 변환 중입니다. (약 30초 소요)" });

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

    const handleRegenerateImage = async (customPrompt?: string) => {
        setIsRegeneratingImage(true);
        toast.info("대표 이미지 생성 중...", { description: "주제와 요청사항에 부합하는 이미지를 디자인하고 있습니다. (약 15초 소요)" });

        try {
            const result = await generatePostImage(initialPost.id, undefined, customPrompt);
            if (result.success && result.imageUrl) {
                setCoverImage(result.imageUrl);
                toast.success("대표 이미지가 성공적으로 변경되었습니다!");
            } else {
                toast.error("대표 이미지 생성 실패", { description: result.message });
            }
        } catch (error) {
            console.error(error);
            toast.error("대표 이미지 생성 중 오류가 발생했습니다.");
        } finally {
            setIsRegeneratingImage(false);
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
                    coverImage={coverImage}
                    isRegeneratingImage={isRegeneratingImage}
                    onRegenerateImage={handleRegenerateImage}
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

            {/* Social Media & OSMU Area */}
            <div className="mt-12 border-t pt-10 print:hidden">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h2 className="text-2xl font-bold tracking-tight">OSMU Studio</h2>
                        <p className="text-muted-foreground mt-1">
                            작성된 콘텐츠를 다양한 포맷으로 확장하세요.
                        </p>
                    </div>
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
