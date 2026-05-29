"use client";

import { motion } from "framer-motion";
import { PageContainer } from "./PageContainer";

export function Header() {
  return (
    <motion.header
      initial={{ opacity: 0, y: -12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] as const }}
      className="fixed top-0 left-0 right-0 z-50 border-b border-border-soft/90 bg-background/90 backdrop-blur-xl"
    >
      <PageContainer>
        <div className="flex h-14 items-center justify-between lg:h-[4.5rem]">
          <a
            href="#"
            className="font-mono text-xs tracking-[0.2em] uppercase text-text transition-colors hover:text-walnut"
          >
            SoundSteward
          </a>
          <nav className="hidden items-center gap-8 md:flex">
            <a
              href="#approach"
              className="text-[15px] text-muted transition-colors hover:text-walnut"
            >
              Approach
            </a>
            <a
              href="#mission"
              className="text-[15px] text-muted transition-colors hover:text-walnut"
            >
              Mission
            </a>
            <a
              href="#why"
              className="text-[15px] text-muted transition-colors hover:text-walnut"
            >
              Why Numbers
            </a>
          </nav>
        </div>
      </PageContainer>
    </motion.header>
  );
}
