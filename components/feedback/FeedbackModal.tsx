"use client";

import { AnimatePresence, motion } from "framer-motion";
import { FormEvent, useCallback, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { FEEDBACK_TYPE_LABELS } from "@/lib/feedback/constants";
import { saveFeedbackSubmission } from "@/lib/feedback/storage";
import { FEEDBACK_TYPES, type FeedbackType } from "@/lib/feedback/types";

type FeedbackModalProps = {
  open: boolean;
  onClose: () => void;
};

const AUTO_CLOSE_MS = 1500;

export function FeedbackModal({ open, onClose }: FeedbackModalProps) {
  const [type, setType] = useState<FeedbackType>("general");
  const [message, setMessage] = useState("");
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const resetForm = useCallback(() => {
    setType("general");
    setMessage("");
    setEmail("");
    setSubmitted(false);
    setIsSubmitting(false);
  }, []);

  const handleClose = useCallback(() => {
    onClose();
    window.setTimeout(resetForm, 300);
  }, [onClose, resetForm]);

  useEffect(() => {
    if (!open) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") handleClose();
    };

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open, handleClose]);

  useEffect(() => {
    if (!submitted) return;

    const timeout = window.setTimeout(() => {
      handleClose();
    }, AUTO_CLOSE_MS);

    return () => window.clearTimeout(timeout);
  }, [submitted, handleClose]);

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    const trimmedMessage = message.trim();
    if (!trimmedMessage || isSubmitting) return;

    setIsSubmitting(true);
    saveFeedbackSubmission({
      type,
      message: trimmedMessage,
      email: email.trim() || null,
      page: window.location.href,
      userAgent: navigator.userAgent,
    });
    setSubmitted(true);
    setIsSubmitting(false);
  };

  if (!mounted || !open) return null;

  return createPortal(
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[9998]">
          <motion.button
            type="button"
            aria-label="Close feedback"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-text/30 backdrop-blur-sm"
            onClick={handleClose}
          />

          <div className="pointer-events-none absolute inset-0 flex items-end justify-center p-4 sm:items-center sm:p-6">
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-labelledby="feedback-title"
              initial={{ opacity: 0, y: 16, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 12, scale: 0.98 }}
              transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
              className="pointer-events-auto relative z-[9999] w-full max-w-md overflow-hidden rounded-3xl border border-border-soft bg-background shadow-[0_24px_80px_-16px_rgba(31,29,26,0.28)]"
              onClick={(event) => event.stopPropagation()}
            >
              <div className="border-b border-border-soft px-6 py-5">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="font-mono text-[10px] tracking-[0.18em] uppercase text-olive">
                      Feedback Center
                    </p>
                    <h2
                      id="feedback-title"
                      className="mt-1 text-xl font-medium tracking-[-0.02em] text-text"
                    >
                      {submitted ? "Thank you" : "Share your feedback"}
                    </h2>
                  </div>
                  <button
                    type="button"
                    onClick={handleClose}
                    className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-border-soft bg-card text-muted transition-colors hover:text-text"
                    aria-label="Close"
                  >
                    ✕
                  </button>
                </div>
              </div>

              <div className="px-6 py-5">
                {submitted ? (
                  <div className="py-4 text-center">
                    <p className="text-base leading-relaxed text-text">
                      Thank you for helping improve SoundSteward.
                    </p>
                    <p className="mt-2 font-mono text-[10px] tracking-[0.06em] text-muted">
                      Saved locally in this browser
                    </p>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                      <label
                        htmlFor="feedback-type"
                        className="mb-2 block font-mono text-[10px] tracking-[0.12em] uppercase text-muted"
                      >
                        Type
                      </label>
                      <select
                        id="feedback-type"
                        value={type}
                        onChange={(event) =>
                          setType(event.target.value as FeedbackType)
                        }
                        className="w-full cursor-pointer rounded-xl border border-border-soft bg-card px-4 py-3 text-sm text-text outline-none transition-colors focus:border-walnut/45"
                      >
                        {FEEDBACK_TYPES.map((feedbackType) => (
                          <option key={feedbackType} value={feedbackType}>
                            {FEEDBACK_TYPE_LABELS[feedbackType]}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label
                        htmlFor="feedback-message"
                        className="mb-2 block font-mono text-[10px] tracking-[0.12em] uppercase text-muted"
                      >
                        Message
                      </label>
                      <textarea
                        id="feedback-message"
                        required
                        rows={4}
                        value={message}
                        onChange={(event) => setMessage(event.target.value)}
                        placeholder="Tell us what happened or what you'd like to see…"
                        className="w-full resize-none rounded-xl border border-border-soft bg-card px-4 py-3 text-sm leading-relaxed text-text placeholder:text-muted/60 outline-none transition-colors focus:border-walnut/45"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="feedback-email"
                        className="mb-2 block font-mono text-[10px] tracking-[0.12em] uppercase text-muted"
                      >
                        Email{" "}
                        <span className="normal-case tracking-normal text-muted/70">
                          (optional)
                        </span>
                      </label>
                      <input
                        id="feedback-email"
                        type="email"
                        value={email}
                        onChange={(event) => setEmail(event.target.value)}
                        placeholder="you@example.com"
                        className="w-full rounded-xl border border-border-soft bg-card px-4 py-3 text-sm text-text placeholder:text-muted/60 outline-none transition-colors focus:border-walnut/45"
                      />
                    </div>

                    <div className="flex flex-col gap-2.5 sm:flex-row">
                      <button
                        type="submit"
                        disabled={!message.trim() || isSubmitting}
                        className="inline-flex h-11 flex-1 items-center justify-center rounded-full bg-walnut text-sm font-medium text-card transition-colors hover:bg-clay disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        Submit feedback
                      </button>
                      <button
                        type="button"
                        onClick={handleClose}
                        className="inline-flex h-11 flex-1 items-center justify-center rounded-full border border-border-soft bg-card text-sm text-muted transition-colors hover:border-clay/40 hover:text-text"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>,
    document.body,
  );
}
