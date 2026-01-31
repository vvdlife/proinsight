"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

export function ReadingProgressBar() {
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        const updateProgress = () => {
            const currentScroll = window.scrollY;
            const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;

            if (scrollHeight) {
                setProgress(Number((currentScroll / scrollHeight).toFixed(2)) * 100);
            }
        };

        window.addEventListener("scroll", updateProgress);
        return () => window.removeEventListener("scroll", updateProgress);
    }, []);

    return (
        <div className="fixed top-0 left-0 right-0 z-50 h-1 bg-transparent">
            <div
                className={cn(
                    "h-full bg-primary/80 transition-all duration-150 ease-out origin-left",
                    progress > 0 ? "opacity-100" : "opacity-0"
                )}
                style={{ width: `${progress}%` }}
            />
        </div>
    );
}
