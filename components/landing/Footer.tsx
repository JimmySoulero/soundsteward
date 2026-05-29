"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { PageContainer } from "./PageContainer";

export function Footer() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-40px" });

  return (
    <motion.footer
      ref={ref}
      initial={{ opacity: 0 }}
      animate={isInView ? { opacity: 1 } : {}}
      transition={{ duration: 0.7 }}
      className="border-t border-border bg-surface-dark py-12 text-card lg:py-14"
    >
      <PageContainer>
        <div className="flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="font-mono text-xs tracking-[0.2em] uppercase text-[#c9bfb0]">
              SoundSteward
            </p>
            <p className="mt-2 max-w-xs text-[15px] leading-relaxed text-[#a39e96]">
              Steward the gift. Learn the language.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:gap-8">
            <a
              href="#approach"
              className="text-[15px] text-[#a39e96] transition-colors hover:text-card"
            >
              Approach
            </a>
            <a
              href="#mission"
              className="text-[15px] text-[#a39e96] transition-colors hover:text-card"
            >
              Mission
            </a>
            <a
              href="#why"
              className="text-[15px] text-[#a39e96] transition-colors hover:text-card"
            >
              Why Numbers
            </a>
            <a
              href="/learn"
              className="text-[15px] text-clay transition-colors hover:text-card"
            >
              Start Learning
            </a>
          </div>
        </div>

        <div className="mt-10 border-t border-[#3d3a35] pt-7">
          <p className="font-mono text-[10px] tracking-[0.15em] uppercase text-[#7a746c]">
            © {new Date().getFullYear()} SoundSteward
          </p>
        </div>
      </PageContainer>
    </motion.footer>
  );
}
