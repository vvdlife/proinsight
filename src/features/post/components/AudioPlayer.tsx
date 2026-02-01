// Path: src/features/post/components/AudioPlayer.tsx
"use client";

import { useEffect, useRef, useState } from "react";
import { Pause, Play, Volume2, VolumeX, Forward, Rewind } from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface AudioPlayerProps {
    src: string;
    className?: string;
}

export function AudioPlayer({ src, className }: AudioPlayerProps) {
    const audioRef = useRef<HTMLAudioElement>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [isMuted, setIsMuted] = useState(false);
    const [playbackRate, setPlaybackRate] = useState(1);

    useEffect(() => {
        const audio = audioRef.current;
        if (!audio) return;

        const handleTimeUpdate = () => setCurrentTime(audio.currentTime);
        const handleLoadedMetadata = () => setDuration(audio.duration);
        const handleEnded = () => setIsPlaying(false);

        audio.addEventListener("timeupdate", handleTimeUpdate);
        audio.addEventListener("loadedmetadata", handleLoadedMetadata);
        audio.addEventListener("ended", handleEnded);

        return () => {
            audio.removeEventListener("timeupdate", handleTimeUpdate);
            audio.removeEventListener("loadedmetadata", handleLoadedMetadata);
            audio.removeEventListener("ended", handleEnded);
        };
    }, []);

    const togglePlay = () => {
        if (audioRef.current) {
            if (isPlaying) {
                audioRef.current.pause();
            } else {
                audioRef.current.play();
            }
            setIsPlaying(!isPlaying);
        }
    };

    const handleSeek = (value: number[]) => {
        if (audioRef.current) {
            audioRef.current.currentTime = value[0];
            setCurrentTime(value[0]);
        }
    };

    const toggleMute = () => {
        if (audioRef.current) {
            audioRef.current.muted = !isMuted;
            setIsMuted(!isMuted);
        }
    };

    const formatTime = (time: number) => {
        if (isNaN(time)) return "0:00";
        const minutes = Math.floor(time / 60);
        const seconds = Math.floor(time % 60);
        return `${minutes}:${seconds.toString().padStart(2, "0")}`;
    };

    const changeSpeed = () => {
        if (!audioRef.current) return;
        const rates = [1, 1.25, 1.5, 2];
        const nextIdx = (rates.indexOf(playbackRate) + 1) % rates.length;
        const nextRate = rates[nextIdx];
        audioRef.current.playbackRate = nextRate;
        setPlaybackRate(nextRate);
    };

    return (
        <div className={cn("bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-4 shadow-sm", className)}>
            <audio ref={audioRef} src={src} />

            <div className="flex flex-col gap-3">
                {/* Top: Label and Speed */}
                <div className="flex items-center justify-between text-xs text-muted-foreground uppercase tracking-wider font-semibold">
                    <span className="flex items-center gap-1.5">
                        <span className="relative flex h-2 w-2">
                            <span className={cn("animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75", isPlaying ? "block" : "hidden")}></span>
                            <span className={cn("relative inline-flex rounded-full h-2 w-2", isPlaying ? "bg-rose-500" : "bg-slate-400")}></span>
                        </span>
                        Audio Briefing
                    </span>
                    <button onClick={changeSpeed} className="hover:text-foreground transition-colors px-2 py-0.5 rounded-md hover:bg-zinc-200 dark:hover:bg-zinc-800">
                        {playbackRate}x
                    </button>
                </div>

                {/* Progress Bar */}
                <div className="flex items-center gap-3">
                    <span className="text-xs font-mono w-10 text-right">{formatTime(currentTime)}</span>
                    <Slider
                        value={[currentTime]}
                        max={duration || 100}
                        step={1}
                        onValueChange={handleSeek}
                        className="flex-1"
                    />
                    <span className="text-xs font-mono w-10 text-left text-muted-foreground">{formatTime(duration)}</span>
                </div>

                {/* Controls */}
                <div className="flex items-center justify-between mt-1">
                    <div className="flex items-center gap-2">
                        {/* Placeholder for left side balance */}
                        <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 pointer-events-none">
                            <Volume2 className="h-4 w-4" />
                        </Button>
                    </div>

                    <div className="flex items-center gap-4">
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 hover:bg-zinc-200 dark:hover:bg-zinc-800 rounded-full"
                            onClick={() => {
                                if (audioRef.current) audioRef.current.currentTime -= 10;
                            }}
                        >
                            <Rewind className="h-4 w-4" />
                        </Button>

                        <Button
                            size="icon"
                            className="h-12 w-12 rounded-full shadow-md bg-foreground hover:bg-foreground/90 text-background"
                            onClick={togglePlay}
                        >
                            {isPlaying ? <Pause className="h-5 w-5 fill-current" /> : <Play className="h-5 w-5 fill-current translate-x-0.5" />}
                        </Button>

                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 hover:bg-zinc-200 dark:hover:bg-zinc-800 rounded-full"
                            onClick={() => {
                                if (audioRef.current) audioRef.current.currentTime += 10;
                            }}
                        >
                            <Forward className="h-4 w-4" />
                        </Button>
                    </div>

                    <div className="flex items-center gap-2">
                        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full" onClick={toggleMute}>
                            {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
