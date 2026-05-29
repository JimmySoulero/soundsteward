"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { FeedbackModal } from "@/components/feedback/FeedbackModal";

export function FeedbackCenter() {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return createPortal(
    <>
      {!open && (
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label="Open feedback"
          className="fixed bottom-4 right-4 z-[9997] inline-flex items-center gap-2 rounded-full border px-4 py-2.5 font-mono text-[11px] font-medium tracking-[0.06em] shadow-[0_8px_28px_-6px_rgba(31,29,26,0.55)] transition-[background-color,border-color,transform] hover:scale-[1.02] active:scale-[0.98] sm:px-5 sm:py-3 md:bottom-6 md:right-6"
          style={{
            backgroundColor: "#2a2723",
            color: "#f7f1e7",
            borderColor: "rgba(207, 195, 176, 0.55)",
          }}
        >
          <span aria-hidden className="text-sm leading-none">
            💬
          </span>
          Feedback
        </button>
      )}

      <FeedbackModal open={open} onClose={() => setOpen(false)} />
    </>,
    document.body,
  );
}
