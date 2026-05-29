type ProgressBarProps = {
  learnedCount: number;
  total: number;
};

export function ProgressBar({ learnedCount, total }: ProgressBarProps) {
  const percent = total > 0 ? (learnedCount / total) * 100 : 0;

  return (
    <div className="rounded-2xl border border-border-soft bg-card p-6 shadow-[0_2px_8px_rgba(31,29,26,0.04),0_10px_28px_-8px_rgba(31,29,26,0.07)] lg:p-7">
      <div className="mb-3 flex items-end justify-between gap-4">
        <p className="font-mono text-[11px] tracking-[0.18em] uppercase text-olive">
          Your Progress
        </p>
        <p className="text-[15px] font-medium text-text">
          {learnedCount} of {total} Keys Learned
        </p>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-section">
        <div
          className="h-full rounded-full bg-walnut transition-all duration-500 ease-out"
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}
