// Path: src/components/copy-button.tsx
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Check, Copy } from "lucide-react";
import { toast } from "sonner";

interface CopyButtonProps {
    content: string;
}

export function CopyButton({ content }: CopyButtonProps) {
    const [isCopied, setIsCopied] = useState(false);

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(content);
            setIsCopied(true);
            toast.success("클립보드에 복사되었습니다.");

            setTimeout(() => {
                setIsCopied(false);
            }, 2000);
        } catch (err) {
            console.error("Failed to copy:", err);
            toast.error("복사에 실패했습니다.");
        }
    };

    return (
        <Button variant="outline" size="sm" onClick={handleCopy}>
            {isCopied ? (
                <>
                    <Check className="mr-2 h-4 w-4 text-green-500" />
                    복사됨
                </>
            ) : (
                <>
                    <Copy className="mr-2 h-4 w-4" />
                    복사하기
                </>
            )}
        </Button>
    );
}
