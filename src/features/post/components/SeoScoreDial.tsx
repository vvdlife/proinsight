"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface SeoScoreDialProps {
    score: number;
    className?: string;
}

export function SeoScoreDial({ score, className }: SeoScoreDialProps) {
    // 0~100 score mapped to 0~180 degrees (semi-circle) or 0~100% circle
    // Let's go with a modern circular progress with a gradient
    const radius = 40;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (score / 100) * circumference;

    const getColor = (s: number) => {
        if (s >= 80) return "text-green-500";
        if (s >= 50) return "text-yellow-500";
        return "text-red-500";
    };

    return (
        <div className={cn("relative flex items-center justify-center w-32 h-32", className)}>
            <svg className="w-full h-full transform -rotate-90">
                {/* Background Circle */}
                <circle
                    cx="64"
                    cy="64"
                    r={radius}
                    stroke="currentColor"
                    strokeWidth="8"
                    fill="transparent"
                    className="text-muted/20"
                />
                {/* Progress Circle */}
                <motion.circle
                    initial={{ strokeDashoffset: circumference }}
                    animate={{ strokeDashoffset: offset }}
                    transition={{ duration: 1.5, ease: "easeOut" }}
                    cx="64"
                    cy="64"
                    r={radius}
                    stroke="currentColor"
                    strokeWidth="8"
                    fill="transparent"
                    strokeDasharray={circumference}
                    strokeLinecap="round"
                    className={cn(getColor(score), "drop-shadow-md")}
                />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
                <motion.span
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.5, duration: 0.5 }}
                    className={cn("text-3xl font-bold", getColor(score))}
                >
                    {score}
                </motion.span>
                <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">SEO Score</span>
            </div>
        </div>
    );
}
