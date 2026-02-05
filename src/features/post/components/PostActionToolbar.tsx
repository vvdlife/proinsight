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
    onRevert?: () => void; // Optional if no backup exists
    canRevert: boolean;

    onAnalyzeSEO: () => void; // Triggers Sheet
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
    onRevert,
    canRevert,
    onAnalyzeSEO,
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
                        {canRevert && onRevert && (
                            <Button
                                variant="destructive"
                                size="icon"
                                onClick={onRevert}
                                title="최적화 전으로 복구"
                            >
                                <RotateCcw className="h-4 w-4" />
                            </Button>
                        )}
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

                {/* 1. SEO (Trigger for Sheet) */}
                {/* Note: This button expects to be wrapped in SheetTrigger in the parent, 
                     OR we handle the click to open sheet. 
                     Ideally the Parent wraps this or we pass a ref. 
                     For simplicity, let's assume the Parent handles the Opening via a passed function referencing a hidden trigger,
                     OR better: We pass the SheetTrigger as a render prop or Slot? 
                     Actually, passing a handler 'onAnalyzeSEO' is cleaner if we control the open state.
                     BUT default Shadcn Sheet works best with Trigger.
                     Let's expose this button and let Parent wrap it, OR make this a Dumb component.
                     Making it dumb is best. But SheetTrigger needs to be direct parent.
                     Let's Assume Parent will handle the Sheet state directly via 'open' prop, 
                     OR we use a simpler approach: Just a button that calls the handler.
                 */}
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={onAnalyzeSEO}
                    title="SEO 분석"
                    className="text-muted-foreground hover:text-foreground"
                >
                    <Search className="h-4 w-4 sm:mr-2" />
                    <span className="hidden sm:inline">분석</span>
                </Button>

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
                            <span>스마트 복사 (HTML)</span>
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
