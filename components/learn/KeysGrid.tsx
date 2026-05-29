"use client";

import { MAJOR_KEYS, type MajorKey } from "@/lib/major-keys";

type KeysGridProps = {
  learnedKeys: string[];
  onSelectKey: (key: MajorKey) => void;
};

export function KeysGrid({ learnedKeys, onSelectKey }: KeysGridProps) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4 lg:gap-5">
      {MAJOR_KEYS.map((key) => {
        const isComplete = learnedKeys.includes(key.id);

        return (
          <button
            key={key.id}
            type="button"
            onClick={() => onSelectKey(key)}
            disabled={!key.available}
            className={`group relative rounded-2xl border p-5 text-left transition-all sm:p-6 ${
              key.available
                ? "border-border-soft bg-card shadow-[0_2px_8px_rgba(31,29,26,0.04),0_10px_28px_-8px_rgba(31,29,26,0.07)] hover:border-walnut/35 hover:shadow-[0_4px_12px_rgba(31,29,26,0.06),0_16px_36px_-10px_rgba(31,29,26,0.1)]"
                : "cursor-not-allowed border-border-soft/70 bg-section/50 opacity-80"
            } ${isComplete ? "border-walnut/40 ring-1 ring-walnut/15" : ""}`}
          >
            {isComplete && (
              <span className="absolute right-4 top-4 font-mono text-[10px] tracking-[0.12em] uppercase text-olive">
                Complete
              </span>
            )}
            <span className="font-mono text-[10px] tracking-[0.15em] uppercase text-muted">
              Major Key
            </span>
            <p className="mt-2 text-3xl font-medium tracking-[-0.03em] text-text">
              {key.label}
            </p>
            {!key.available && (
              <p className="mt-3 font-mono text-[10px] tracking-[0.1em] uppercase text-muted">
                Coming Soon
              </p>
            )}
            {key.available && (
              <p className="mt-3 text-sm text-muted">
                {isComplete ? "Replay lesson" : "Start lesson"}
              </p>
            )}
          </button>
        );
      })}
    </div>
  );
}
