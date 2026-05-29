"use client";

import { motion } from "framer-motion";
import { PageContainer } from "./PageContainer";
import { PianoKeyboard } from "./PianoKeyboard";

const ease = [0.22, 1, 0.36, 1] as const;

export function Hero() {
  return (
    <section className="relative min-h-[100dvh] bg-section pt-[4.5rem]">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_55%_at_15%_45%,rgba(138,103,70,0.14),transparent_55%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_55%_45%_at_85%_25%,rgba(167,111,77,0.1),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_40%_30%_at_50%_100%,rgba(111,118,103,0.08),transparent_60%)]" />
      </div>

      <PageContainer className="relative">
        <div className="grid min-h-[calc(100dvh-4.5rem)] items-center gap-10 py-10 md:grid-cols-2 md:gap-8 lg:gap-12 lg:py-12">
          <div className="flex min-w-0 flex-col justify-center">
            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0, ease }}
              className="mb-4 font-mono text-[11px] tracking-[0.22em] uppercase text-olive lg:mb-5"
            >
              Nashville Number System
            </motion.p>

            <motion.h1
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.06, ease }}
              className="text-[2.25rem] font-medium leading-[1.08] tracking-[-0.035em] text-text sm:text-[2.5rem] lg:text-[2.875rem] lg:leading-[1.06] xl:text-[3.125rem]"
            >
              Understand the Language of Music.
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.12, ease }}
              className="mt-5 max-w-md text-lg leading-relaxed text-muted lg:mt-6 lg:text-xl lg:leading-[1.55]"
            >
              Learn Nashville Numbers, hear chord movement, and play confidently
              in any key.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2, ease }}
              className="mt-8 flex flex-col gap-3 sm:flex-row sm:gap-4 lg:mt-9"
            >
              <a
                href="/learn"
                className="inline-flex h-[3.25rem] items-center justify-center rounded-full bg-walnut px-8 text-[15px] font-medium tracking-wide text-card shadow-[0_4px_20px_-4px_rgba(138,103,70,0.45)] transition-all hover:bg-clay hover:shadow-[0_6px_28px_-4px_rgba(167,111,77,0.5)]"
              >
                Start Learning
              </a>
              <a
                href="#why"
                className="inline-flex h-[3.25rem] items-center justify-center rounded-full border border-walnut/25 bg-card/60 px-8 text-[15px] font-medium tracking-wide text-text backdrop-blur-sm transition-colors hover:border-walnut/45 hover:bg-card"
              >
                Explore Progressions
              </a>
            </motion.div>

            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.26, ease }}
              className="mt-6 max-w-md text-[15px] leading-relaxed text-muted lg:mt-7"
            >
              A sound steward doesn't just play music. They understand it.
            </motion.p>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.75, delay: 0.15, ease }}
            className="min-w-0 w-full"
          >
            <motion.div
              animate={{ y: [0, -5, 0] }}
              transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
              className="mx-auto w-full max-w-full"
            >
              <PianoKeyboard />
            </motion.div>
          </motion.div>
        </div>
      </PageContainer>
    </section>
  );
}
