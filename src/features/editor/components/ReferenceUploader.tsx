"use client";

import { useDropzone } from "react-dropzone";
import { UploadCloud, X, FileText, Image as ImageIcon, FileType } from "lucide-react";
import { useCallback, useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { processFile } from "@/lib/utils/file-helpers";
import { Attachment } from "@/lib/types/attachment";
import { cn } from "@/lib/utils";

interface ReferenceUploaderProps {
    attachments: Attachment[];
    onChange: (files: Attachment[]) => void;
}

export function ReferenceUploader({ attachments, onChange }: ReferenceUploaderProps) {
    const [isProcessing, setIsProcessing] = useState(false);

    const onDrop = useCallback(async (acceptedFiles: File[]) => {
        setIsProcessing(true);
        const newAttachments: Attachment[] = [];
        const MAX_TOTAL_SIZE = 4 * 1024 * 1024; // 4MB Total Limit

        try {
            // Calculate current total size
            const currentTotalSize = attachments.reduce((acc, curr) => acc + curr.size, 0);
            let pendingTotalSize = currentTotalSize;

            for (const file of acceptedFiles) {
                if (pendingTotalSize + file.size > MAX_TOTAL_SIZE) {
                    toast.error(`최대 업로드 용량(4MB)을 초과했습니다. (${file.name} 제외됨)`);
                    continue;
                }

                try {
                    const attachment = await processFile(file);
                    newAttachments.push(attachment);
                    pendingTotalSize += file.size;
                } catch (e) {
                    console.error(e);
                    toast.error(`${file.name} 처리 중 오류가 발생했습니다.`);
                }
            }

            if (newAttachments.length > 0) {
                onChange([...attachments, ...newAttachments]);
                toast.success(`${newAttachments.length}개의 파일이 추가되었습니다.`);
            }
        } finally {
            setIsProcessing(false);
        }
    }, [attachments, onChange]);

    const removeFile = (index: number) => {
        const newFiles = [...attachments];
        newFiles.splice(index, 1);
        onChange(newFiles);
    };

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            'application/pdf': ['.pdf'],
            'image/png': ['.png'],
            'image/jpeg': ['.jpg', '.jpeg'],
            'image/webp': ['.webp'],
            'text/plain': ['.txt', '.md', '.csv']
        },
        maxFiles: 5,
        disabled: isProcessing
    });

    const getIcon = (type: string) => {
        if (type.startsWith("image/")) return <ImageIcon className="w-5 h-5 text-blue-500" />;
        if (type === "application/pdf") return <FileType className="w-5 h-5 text-red-500" />;
        return <FileText className="w-5 h-5 text-gray-500" />;
    };

    return (
        <div className="space-y-4">
            <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                참조 자료 (선택 사항)
            </label>

            <div
                {...getRootProps()}
                className={cn(
                    "border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center text-center cursor-pointer transition-colors relative overflow-hidden",
                    isDragActive ? "border-primary bg-primary/5" : "border-muted-foreground/25 hover:border-primary/50",
                    isProcessing && "opacity-50 cursor-wait"
                )}
            >
                <input {...getInputProps()} />
                <UploadCloud className="w-10 h-10 text-muted-foreground mb-2" />
                <div className="space-y-1">
                    <p className="text-sm font-medium">참조할 파일을 드래그하거나 클릭하여 업로드하세요</p>
                    <p className="text-xs text-muted-foreground">
                        PDF, 이미지, 텍스트 파일 (최대 4MB, Gemini 문맥 분석용)
                    </p>
                </div>
            </div>

            {attachments.length > 0 && (
                <div className="grid gap-2 grid-cols-1 sm:grid-cols-2">
                    {attachments.map((file, idx) => (
                        <div key={idx} className="flex items-center gap-3 p-3 border rounded-lg bg-card/50 group hover:border-primary/50 transition-colors">
                            <div className="flex-shrink-0">
                                {file.type.startsWith("image/") ? (
                                    <div className="w-10 h-10 rounded overflow-hidden bg-muted">
                                        <img
                                            src={`data:${file.type};base64,${file.content}`}
                                            alt={file.name}
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                ) : (
                                    <div className="w-10 h-10 rounded bg-muted flex items-center justify-center">
                                        {getIcon(file.type)}
                                    </div>
                                )}
                            </div>
                            <div className="flex-1 min-w-0 text-left">
                                <p className="text-sm font-medium truncate">{file.name}</p>
                                <p className="text-xs text-muted-foreground">
                                    {(file.size / 1024).toFixed(1)} KB
                                </p>
                            </div>
                            <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="opacity-0 group-hover:opacity-100 transition-opacity"
                                onClick={() => removeFile(idx)}
                            >
                                <X className="w-4 h-4 text-muted-foreground hover:text-destructive" />
                            </Button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
