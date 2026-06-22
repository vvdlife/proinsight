"use client";

import { Button } from "@/components/ui/button";
import {
    Pencil,
    Save,
    X,
    RotateCcw,
    Search,
    Headphones,
    Download,
    Loader2,
    Copy,
    Printer,
    FileText,
    Share2,
    Settings
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuSeparator,
    DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { SheetTrigger } from "@/components/ui/sheet";

interface PostActionToolbarProps {
    isEditing: boolean;
    isPending: boolean; // General loading state (save/edit)
    isGeneratingAudio: boolean;
    hasAudio: boolean;

    // Actions
    onToggleEdit: (value: boolean) => void;
    onSave: () => void;
    onCancel: () => void;

    onGenerateAudio: () => void;

    onDownloadMarkdown: () => void;
    onPrint: () => void;
    onSmartCopy: () => void;

    className?: string;
}

export function PostActionToolbar({
    isEditing,
    isPending,
    isGeneratingAudio,
    hasAudio,
    onToggleEdit,
    onSave,
    onCancel,
    onGenerateAudio,
    onDownloadMarkdown,
    onPrint,
    onSmartCopy,
    className
}: PostActionToolbarProps) {
    return (
        <div className={cn(
            "sticky top-4 z-50 w-full max-w-4xl mx-auto flex items-center justify-between p-2 rounded-xl border bg-background/80 backdrop-blur-md shadow-sm transition-all animate-in fade-in slide-in-from-top-2",
            className
        )}>
            {/* Left Group: View/Edit Mode */}
            <div className="flex items-center gap-1">
                {isEditing ? (
                    <>
                        <Button
                            variant="default"
                            size="sm"
                            onClick={onSave}
                            disabled={isPending}
                            className="bg-primary hover:bg-primary/90 min-w-[80px]"
                        >
                            {isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
                            저장
                        </Button>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={onCancel}
                            disabled={isPending}
                        >
                            <X className="h-4 w-4 mr-2" />
                            취소
                        </Button>
                    </>
                ) : (
                    <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => onToggleEdit(true)}
                        className="min-w-[80px]"
                    >
                        <Pencil className="h-3.5 w-3.5 mr-2" />
                        수정
                    </Button>
                )}
            </div>

            {/* Right Group: Tools & Actions */}
            <div className="flex items-center gap-1 sm:gap-2">

                {/* 2. Audio */}
                {!hasAudio && (
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={onGenerateAudio}
                        disabled={isGeneratingAudio}
                        title="오디오 브리핑 생성"
                        className={cn("text-muted-foreground hover:text-foreground", isGeneratingAudio && "animate-pulse")}
                    >
                        {isGeneratingAudio ? <Loader2 className="h-4 w-4 animate-spin" /> : <Headphones className="h-4 w-4 sm:mr-2" />}
                        <span className="hidden sm:inline">오디오</span>
                    </Button>
                )}

                <div className="h-4 w-[1px] bg-border mx-1" />

                {/* 3. Export & Share Menu */}
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                            <Share2 className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                        <DropdownMenuLabel>Export & Share</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={onSmartCopy}>
                            <Copy className="h-4 w-4 mr-2" />
                            <span>티스토리 호환 복사</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={onDownloadMarkdown}>
                            <FileText className="h-4 w-4 mr-2" />
                            <span>Markdown 다운로드</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={onPrint}>
                            <Printer className="h-4 w-4 mr-2" />
                            <span>PDF 인쇄 / 저장</span>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </div>
    );
}
