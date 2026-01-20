// Path: src/features/publishing/components/wordpress-dialog.tsx
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Globe } from "lucide-react";
import { toast } from "sonner";
import { publishToWordPress } from "../actions/publish-wordpress";

interface WordPressDialogProps {
    post: {
        id: string;
        topic: string;
        content: string;
        coverImage: string | null;
    };
}

export function WordPressDialog({ post }: WordPressDialogProps) {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    // Local storage for convenience (in a real app, use secure storage or DB)
    const [wpUrl, setWpUrl] = useState("");
    const [username, setUsername] = useState("");
    const [appPassword, setAppPassword] = useState("");

    const handlePublish = async () => {
        if (!wpUrl || !username || !appPassword) {
            toast.error("모든 정보를 입력해주세요.");
            return;
        }

        setLoading(true);
        try {
            const result = await publishToWordPress({
                wpUrl,
                username,
                appPassword,
                postId: post.id,
                title: post.topic, // Or extract title from content
                contentMarkdown: post.content,
                coverImageUrl: post.coverImage || undefined,
            });

            if (result.success) {
                toast.success(result.message);
                setOpen(false);
            } else {
                toast.error(`발행 실패: ${result.message}`);
            }
        } catch (error) {
            toast.error("오류가 발생했습니다.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2">
                    <Globe className="h-4 w-4" />
                    워드프레스 발행
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>워드프레스 자동 발행</DialogTitle>
                    <DialogDescription>
                        워드프레스 사이트 URL과 Application Password를 입력하세요.
                        (비밀번호는 저장되지 않습니다.)
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="wpUrl" className="text-right">
                            사이트 URL
                        </Label>
                        <Input
                            id="wpUrl"
                            placeholder="https://myblog.com"
                            value={wpUrl}
                            onChange={(e) => setWpUrl(e.target.value)}
                            className="col-span-3"
                        />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="username" className="text-right">
                            사용자명
                        </Label>
                        <Input
                            id="username"
                            placeholder="admin"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="col-span-3"
                        />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="appPassword" className="text-right">
                            앱 비밀번호
                        </Label>
                        <Input
                            id="appPassword"
                            type="password"
                            placeholder="xxxx xxxx xxxx xxxx"
                            value={appPassword}
                            onChange={(e) => setAppPassword(e.target.value)}
                            className="col-span-3"
                        />
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => setOpen(false)}>취소</Button>
                    <Button onClick={handlePublish} disabled={loading}>
                        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        발행하기 (Draft)
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
