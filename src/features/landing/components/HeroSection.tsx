// Path: src/features/landing/components/HeroSection.tsx
"use client";

import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export function HeroSection() {
  return (
    <section className="relative flex min-h-[90vh] flex-col items-center justify-center overflow-hidden bg-[#0a0a0a] px-4 py-24 md:px-8 lg:py-32">
      {/* Background Decor */}
      <div className="absolute inset-0 -z-10 h-full w-full bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-20" />
      <div className="absolute top-0 z-[-2] h-screen w-screen bg-[radial-gradient(100%_50%_at_50%_0%,rgba(255,215,0,0.08)_0,rgba(255,215,0,0)_50%,rgba(0,0,0,0)_100%)]" />

      <div className="container mx-auto flex max-w-5xl flex-col items-center text-center">
        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <Image
            src="/logo.png"
            alt="ProInsight Logo"
            width={200}
            height={200}
            className="h-40 w-auto object-contain drop-shadow-[0_0_15px_rgba(251,191,36,0.3)]"
            priority
          />
        </motion.div>

        {/* Badge / Tag */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8 inline-flex items-center rounded-full border border-amber-500/20 bg-amber-500/10 px-3 py-1 text-sm text-amber-200"
        >
          <span className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-400 opacity-75"></span>
              <span className="relative inline-flex h-2 w-2 rounded-full bg-amber-500"></span>
            </span>
            ProInsight AI Engine v1.0
          </span>
        </motion.div>

        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mb-6 text-4xl font-extrabold tracking-tight text-white sm:text-5xl md:text-6xl lg:text-7xl"
        >
          Expert-Level Blog Content,{" "}
          <span className="bg-gradient-to-r from-amber-200 via-yellow-400 to-amber-600 bg-clip-text text-transparent">
            Automated.
          </span>
        </motion.h1>

        {/* Subheadline */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mb-10 max-w-2xl text-lg text-zinc-400 sm:text-xl"
        >
          ProInsight orchestrates advanced AI agents to research, write, and
          optimize high-quality articles for Tech, Finance, and Security
          experts.
        </motion.p>

        {/* Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="flex flex-col gap-4 sm:flex-row"
        >
          <Button size="lg" className="h-12 border-amber-500 bg-amber-500 px-8 text-base text-black hover:bg-amber-400" asChild>
            <Link href="/dashboard">
              Start Generating <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </motion.div>

        {/* Features / Checkpoints */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="mt-12 flex flex-wrap justify-center gap-x-8 gap-y-4 text-sm text-zinc-500"
        >
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-amber-500" />
            <span>Deep Research Agents</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-amber-500" />
            <span>SEO Optimized</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-amber-500" />
            <span>Fact-Checked</span>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
