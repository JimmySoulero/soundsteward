"use client";

import type { HintReferenceRow } from "@/lib/lessons/types";

type NumberReferenceCardProps = {
  title: string;
  reference: readonly HintReferenceRow[];
  auto?: boolean;
};

export function NumberReferenceCard({
  title,
  reference,
  auto = false,
}: NumberReferenceCardProps) {
  return (
    <div className="rounded-xl border border-walnut/25 bg-card px-3 py-2.5 shadow-[0_4px_16px_-4px_rgba(31,29,26,0.12)]">
      <p className="text-center font-mono text-[10px] tracking-[0.14em] uppercase text-muted">
        {auto ? "Quick reference" : `${title} reference`}
      </p>
      <div className="mt-2 flex flex-wrap items-center justify-center gap-x-3 gap-y-1 sm:gap-x-4">
        {reference.map(({ number, note }) => (
          <span
            key={number}
            className="font-mono text-sm font-medium tracking-wide text-text"
          >
            {number}={note}
          </span>
        ))}
      </div>
    </div>
  );
}
