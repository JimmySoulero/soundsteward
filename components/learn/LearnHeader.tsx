"use client";

import Link from "next/link";
import { PageContainer } from "@/components/landing/PageContainer";

export function LearnHeader() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-border-soft/90 bg-background/90 backdrop-blur-xl">
      <PageContainer>
        <div className="flex h-14 items-center justify-between lg:h-[4.5rem]">
          <Link
            href="/"
            className="font-mono text-xs tracking-[0.2em] uppercase text-text transition-colors hover:text-walnut"
          >
            SoundSteward
          </Link>
          <nav className="flex items-center gap-6 md:gap-8">
            <Link
              href="/learn"
              className="text-[15px] font-medium text-walnut"
            >
              Learn
            </Link>
            <Link
              href="/"
              className="text-[15px] text-muted transition-colors hover:text-walnut"
            >
              Home
            </Link>
          </nav>
        </div>
      </PageContainer>
    </header>
  );
}
