"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Loader2, Sparkles, Copy, Instagram, Linkedin, Twitter, Download, RefreshCw } from "lucide-react";
import { generateAndSaveSocialPosts } from "@/features/post/actions/generate-social-v2";
import { Badge } from "@/components/ui/badge";

export type SocialPostData = {
    id: string;
    platform: string;
    content: string;
    hashtags: string[];
};

interface SocialMediaDashboardProps {
    postId: string;
    postContent: string;
    existingPosts: SocialPostData[];
}

export function SocialMediaDashboard({ postId, postContent, existingPosts }: SocialMediaDashboardProps) {
    const [isGenerating, setIsGenerating] = useState(false);
    // Optimistic UI could be used, but for now we rely on revalidation or local state update
    // Since revalidatePath is called in action, the parent server component should refresh
    // passed props. However, inside a Sheet, we might need router.refresh()
    const [activeTab, setActiveTab] = useState("instagram");

    const hasData = existingPosts.length > 0;

    const handleGenerateAll = async () => {
        setIsGenerating(true);
        toast.info("AI가 3개 플랫폼용 게시글을 작성 중입니다...", { description: "약 10~20초 정도 소요됩니다." });

        try {
            const result = await generateAndSaveSocialPosts(postId, postContent);
            if (result.success) {
                toast.success("모든 소셜 콘텐츠가 생성되었습니다!");
                // Trigger a page refresh to update the existingPosts prop from server
                window.location.reload(); // Simple way to refresh server props
            } else {
                toast.error("생성 실패", { description: result.message });
            }
        } catch (error) {
            toast.error("오류가 발생했습니다.");
        } finally {
            setIsGenerating(false);
        }
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        toast.success("복사되었습니다.");
    };

    const getIcon = (platform: string) => {
        switch (platform) {
            case "instagram": return <Instagram className="h-4 w-4" />;
            case "twitter": return <Twitter className="h-4 w-4" />;
            case "linkedin": return <Linkedin className="h-4 w-4" />;
            default: return <Sparkles className="h-4 w-4" />;
        }
    };

    if (!hasData) {
        return (
            <div className="flex flex-col items-center justify-center space-y-6 py-12 text-center">
                <div className="bg-primary/10 p-4 rounded-full">
                    <Sparkles className="h-8 w-8 text-primary" />
                </div>
                <div className="space-y-2 max-w-sm">
                    <h3 className="text-lg font-semibold">아직 생성된 소셜 콘텐츠가 없습니다</h3>
                    <p className="text-sm text-muted-foreground">
                        블로그 글을 분석하여 인스타그램, 트위터, 링크드인용 홍보 게시글을 한 번에 작성해 드립니다.
                    </p>
                </div>
                <Button
                    size="lg"
                    onClick={handleGenerateAll}
                    disabled={isGenerating}
                    className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 border-0 text-white"
                >
                    {isGenerating ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Multi-Channel Generating...
                        </>
                    ) : (
                        "Generate All (3 Platforms)"
                    )}
                </Button>
            </div>
        );
    }

    return (
        <div className="space-y-6 mt-4">
            <div className="flex items-center justify-between">
                <h3 className="font-semibold flex items-center gap-2">
                    <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                    </span>
                    Generated Content
                </h3>
                <Button variant="outline" size="sm" onClick={handleGenerateAll} disabled={isGenerating}>
                    <RefreshCw className={`h-3 w-3 mr-2 ${isGenerating ? "animate-spin" : ""}`} />
                    Regenerate All
                </Button>
            </div>

            <Tabs defaultValue="instagram" className="w-full" onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="instagram">Instagram</TabsTrigger>
                    <TabsTrigger value="twitter">Twitter</TabsTrigger>
                    <TabsTrigger value="linkedin">LinkedIn</TabsTrigger>
                </TabsList>

                {existingPosts.map((post) => (
                    <TabsContent key={post.platform} value={post.platform} className="space-y-4 mt-4">
                        <div className="space-y-2">
                            <div className="flex justify-between items-center">
                                <Badge variant="outline" className="capitalize flex gap-1">
                                    {getIcon(post.platform)} {post.platform}
                                </Badge>
                                <Button variant="ghost" size="sm" onClick={() => copyToClipboard(`${post.content}\n\n${post.hashtags.join(" ")}`)}>
                                    <Copy className="h-3 w-3 mr-1" /> Copy
                                </Button>
                            </div>
                            <Textarea
                                className="min-h-[250px] font-sans text-base resize-none bg-muted/30"
                                value={`${post.content}\n\n${post.hashtags.join(" ")}`}
                                readOnly
                            />
                        </div>
                    </TabsContent>
                ))}
            </Tabs>
        </div>
    );
}
