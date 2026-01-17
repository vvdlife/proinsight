// Path: src/app/page.tsx
import { HeroSection } from "@/features/landing/components/HeroSection";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between">
      <HeroSection />
    </main>
  );
}
