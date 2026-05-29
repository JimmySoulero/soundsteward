"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { PageContainer } from "./PageContainer";

export function Mission() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-60px" });

  return (
    <section
      id="mission"
      ref={ref}
      className="relative overflow-hidden border-b border-border-soft bg-section py-16 lg:py-20"
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_100%,rgba(111,118,103,0.07),transparent_55%)]" />
      <PageContainer className="relative">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] as const }}
          className="mx-auto max-w-3xl text-center"
        >
          <p className="mb-4 font-mono text-[11px] tracking-[0.22em] uppercase text-walnut">
            Our Mission
          </p>
          <h2 className="text-[2.125rem] font-medium tracking-[-0.03em] text-text sm:text-4xl lg:text-5xl">
            Built to Give Back
          </h2>
          <p className="mt-6 text-lg leading-relaxed text-muted lg:mt-7 lg:text-[1.25rem] lg:leading-[1.55]">
            SoundSteward exists to help musicians grow through simple, practical
            music education. We believe great musicianship should be accessible,
            understandable, and useful from day one.
          </p>
        </motion.div>
      </PageContainer>
    </section>
  );
}
