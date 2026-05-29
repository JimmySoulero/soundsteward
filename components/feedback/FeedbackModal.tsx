"use client";

import { AnimatePresence, motion } from "framer-motion";
import { FormEvent, useState } from "react";
import { FEEDBACK_TYPE_LABELS } from "@/lib/feedback/constants";
import { saveFeedbackSubmission } from "@/lib/feedback/storage";
import { FEEDBACK_TYPES, type FeedbackType } from "@/lib/feedback/types";

type FeedbackModalProps = {
  open: boolean;
  onClose: () => void;
};

export function FeedbackModal({ open, onClose }: FeedbackModalProps) {
  const [type, setType] = useState<FeedbackType>("general");
  const [message, setMessage] = useState("");
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const resetForm = () => {
    setType("general");
    setMessage("");
    setEmail("");
    setSubmitted(false);
    setIsSubmitting(false);
  };

  const handleClose = () => {
    onClose();
    window.setTimeout(resetForm, 300);
  };

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (!message.trim() || isSubmitting) return;

    setIsSubmitting(true);
    saveFeedbackSubmission({
      type,
      message: message.trim(),
      email: email.trim() || null,
      pageUrl: typeof window !== "undefined" ? window.location.href : null,
      metadata: {
        userAgent:
          typeof navigator !== "undefined" ? navigator.userAgent : null,
      },
    });
    setSubmitted(true);
    setIsSubmitting(false);
  };

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[10000] flex items-end justify-center p-4 sm:items-center sm:p-6">
          <motion.button
            type="button"
            aria-label="Close feedback"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-text/30 backdrop-blur-sm"
            onClick={handleClose}
          />

          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="feedback-title"
            initial={{ opacity: 0, y: 16, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.98 }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            className="relative w-full max-w-md overflow-hidden rounded-3xl border border-border-soft bg-background shadow-[0_24px_80px_-16px_rgba(31,29,26,0.28)]"
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
                  <button
                    type="button"
                    onClick={handleClose}
                    className="mt-6 inline-flex h-11 w-full items-center justify-center rounded-full bg-walnut text-sm font-medium text-card transition-colors hover:bg-clay"
                  >
                    Done
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  <fieldset>
                    <legend className="mb-2.5 font-mono text-[10px] tracking-[0.12em] uppercase text-muted">
                      Type
                    </legend>
                    <div className="grid grid-cols-2 gap-2">
                      {FEEDBACK_TYPES.map((feedbackType) => (
                        <button
                          key={feedbackType}
                          type="button"
                          onClick={() => setType(feedbackType)}
                          className={`rounded-xl border px-3 py-2.5 text-left text-sm font-medium transition-colors ${
                            type === feedbackType
                              ? "border-walnut bg-walnut text-card"
                              : "border-border-soft bg-card text-text hover:border-walnut/35"
                          }`}
                        >
                          {FEEDBACK_TYPE_LABELS[feedbackType]}
                        </button>
                      ))}
                    </div>
                  </fieldset>

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

                  <button
                    type="submit"
                    disabled={!message.trim() || isSubmitting}
                    className="inline-flex h-11 w-full items-center justify-center rounded-full bg-walnut text-sm font-medium text-card transition-colors hover:bg-clay disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Submit feedback
                  </button>
                </form>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
