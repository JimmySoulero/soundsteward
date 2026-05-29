"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { FeedbackModal } from "@/components/feedback/FeedbackModal";

const PORTAL_ID = "soundsteward-feedback-root";

function getOrCreatePortalRoot(): HTMLElement {
  let root = document.getElementById(PORTAL_ID);
  if (!root) {
    root = document.createElement("div");
    root.id = PORTAL_ID;
    root.setAttribute("aria-live", "polite");
    document.body.appendChild(root);
  }
  return root;
}

/** Keeps the feedback layer above page content without blocking clicks elsewhere */
function FeedbackPortalStyles() {
  useEffect(() => {
    const styleId = "soundsteward-feedback-portal-styles";
    if (document.getElementById(styleId)) return;

    const style = document.createElement("style");
    style.id = styleId;
    style.textContent = `
      #${PORTAL_ID} {
        position: fixed;
        inset: 0;
        z-index: 9999;
        pointer-events: none;
        overflow: visible;
      }
    `;
    document.head.appendChild(style);
  }, []);

  return null;
}

export function FeedbackCenter() {
  const [open, setOpen] = useState(false);
  const [portalRoot, setPortalRoot] = useState<HTMLElement | null>(null);

  useEffect(() => {
    setPortalRoot(getOrCreatePortalRoot());
  }, []);

  if (!portalRoot) return null;

  return createPortal(
    <>
      <FeedbackPortalStyles />
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Open feedback"
        className="pointer-events-auto absolute bottom-4 right-4 inline-flex items-center gap-2 rounded-full border px-4 py-2.5 font-mono text-[11px] font-medium tracking-[0.06em] shadow-[0_8px_28px_-6px_rgba(31,29,26,0.55)] transition-[background-color,border-color,transform] hover:scale-[1.02] active:scale-[0.98] sm:px-5 sm:py-3 md:bottom-6 md:right-6"
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

      <FeedbackModal open={open} onClose={() => setOpen(false)} />
    </>,
    portalRoot,
  );
}
