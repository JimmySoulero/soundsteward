"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { PageContainer } from "./PageContainer";

const ease = [0.22, 1, 0.36, 1] as const;

const pillars = [
  {
    label: "Learn",
    description:
      "Master the 12 major keys through simple, interactive lessons designed for real musicians.",
  },
  {
    label: "Hear",
    description:
      "Train your ears to recognize progressions, chord movement, and musical patterns.",
  },
  {
    label: "Understand",
    description:
      "See how songs work beneath the surface and learn to play confidently in any key.",
  },
];

export function LearnHearUnderstand() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-60px" });

  return (
    <section
      id="approach"
      ref={ref}
      className="relative overflow-hidden border-b border-border-soft bg-background py-16 lg:py-20"
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_70%_50%_at_50%_0%,rgba(138,103,70,0.07),transparent_60%)]" />

      <PageContainer className="relative">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.65, ease }}
          className="mb-10 text-center lg:mb-12"
        >
          <p className="mb-3 font-mono text-[11px] tracking-[0.22em] uppercase text-olive">
            The Approach
          </p>
          <h2 className="text-[2.125rem] font-medium tracking-[-0.03em] text-text sm:text-4xl lg:text-5xl">
            Learn. Hear. Understand.
          </h2>
        </motion.div>

        <div className="grid gap-4 md:grid-cols-3 md:gap-5">
          {pillars.map((pillar, i) => (
            <motion.article
              key={pillar.label}
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.1 + i * 0.08, ease }}
              className="group rounded-2xl border border-border-soft bg-card p-7 shadow-[0_2px_8px_rgba(31,29,26,0.05),0_12px_32px_-8px_rgba(31,29,26,0.08)] transition-shadow hover:shadow-[0_4px_12px_rgba(31,29,26,0.06),0_20px_40px_-10px_rgba(31,29,26,0.12)] lg:p-8"
            >
              <span className="font-mono text-[11px] tracking-[0.18em] uppercase text-walnut">
                {String(i + 1).padStart(2, "0")}
              </span>
              <h3 className="mt-4 text-2xl font-medium tracking-[-0.02em] text-text lg:text-[1.75rem]">
                {pillar.label}
              </h3>
              <p className="mt-3 text-[17px] leading-relaxed text-muted">
                {pillar.description}
              </p>
            </motion.article>
          ))}
        </div>
      </PageContainer>
    </section>
  );
}
