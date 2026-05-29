"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { PageContainer } from "./PageContainer";

const cards = [
  {
    number: "01",
    title: "Play in Any Key",
    description:
      "One progression. Every key. Learn the system that makes transposing feel effortless.",
  },
  {
    number: "02",
    title: "Learn Songs Faster",
    description:
      "Stop memorizing chords and start recognizing patterns that appear across thousands of songs.",
  },
  {
    number: "03",
    title: "Play by Ear",
    description:
      "Hear where the music is going and understand the relationships between chords.",
  },
  {
    number: "04",
    title: "Communicate with Musicians",
    description:
      "Speak a universal musical language that makes rehearsals, sessions, and collaboration easier.",
  },
];

export function WhyLearnNumbers() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-60px" });

  return (
    <section
      id="why"
      ref={ref}
      className="relative overflow-hidden bg-background py-16 lg:py-20"
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_50%_40%_at_0%_50%,rgba(167,111,77,0.06),transparent_55%)]" />
      <PageContainer className="relative">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] as const }}
          className="mb-10 lg:mb-12"
        >
          <p className="mb-3 font-mono text-[11px] tracking-[0.22em] uppercase text-olive">
            Why Learn Numbers
          </p>
          <h2 className="max-w-2xl text-[2.125rem] font-medium tracking-[-0.03em] text-text sm:text-4xl lg:text-5xl">
            The Pattern Behind Every Song.
          </h2>
        </motion.div>

        <div className="grid gap-4 md:grid-cols-2 md:gap-5">
          {cards.map((card, i) => (
            <motion.article
              key={card.title}
              initial={{ opacity: 0, y: 18 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{
                duration: 0.55,
                delay: 0.1 + i * 0.07,
                ease: [0.22, 1, 0.36, 1] as const,
              }}
              className="rounded-2xl border border-border-soft bg-card p-7 shadow-[0_2px_8px_rgba(31,29,26,0.04),0_10px_28px_-8px_rgba(31,29,26,0.07)] transition-shadow hover:shadow-[0_4px_12px_rgba(31,29,26,0.06),0_16px_36px_-10px_rgba(31,29,26,0.1)] lg:p-8"
            >
              <span className="font-mono text-[11px] tracking-[0.18em] uppercase text-clay">
                {card.number}
              </span>
              <h3 className="mt-4 text-2xl font-medium tracking-[-0.02em] text-text lg:text-[1.75rem]">
                {card.title}
              </h3>
              <p className="mt-3 text-[17px] leading-relaxed text-muted">
                {card.description}
              </p>
            </motion.article>
          ))}
        </div>
      </PageContainer>
    </section>
  );
}
