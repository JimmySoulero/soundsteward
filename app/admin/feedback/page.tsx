"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { PageContainer } from "@/components/landing/PageContainer";
import { FEEDBACK_TYPE_LABELS } from "@/lib/feedback/constants";
import { getFeedbackSubmissionsNewestFirst } from "@/lib/feedback/storage";
import type { FeedbackSubmission } from "@/lib/feedback/types";

function formatDate(iso: string): string {
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(iso));
}

export default function AdminFeedbackPage() {
  const [submissions, setSubmissions] = useState<FeedbackSubmission[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setSubmissions(getFeedbackSubmissionsNewestFirst());
    setMounted(true);
  }, []);

  return (
    <main className="min-h-screen bg-background py-10 lg:py-14">
      <PageContainer>
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="font-mono text-[10px] tracking-[0.18em] uppercase text-olive">
              Admin
            </p>
            <h1 className="mt-1 text-3xl font-medium tracking-[-0.03em] text-text">
              Feedback
            </h1>
            <p className="mt-2 text-sm text-muted">
              Local submissions · newest first
            </p>
          </div>
          <Link
            href="/"
            className="inline-flex h-10 items-center justify-center rounded-full border border-border-soft bg-card px-5 text-sm text-muted transition-colors hover:text-text"
          >
            ← Home
          </Link>
        </div>

        {!mounted ? (
          <p className="text-sm text-muted">Loading…</p>
        ) : submissions.length === 0 ? (
          <div className="rounded-2xl border border-border-soft bg-card p-8 text-center">
            <p className="text-muted">No feedback submissions yet.</p>
          </div>
        ) : (
          <ul className="space-y-4">
            {submissions.map((submission) => (
              <li
                key={submission.id}
                className="rounded-2xl border border-border-soft bg-card p-5 shadow-[0_2px_8px_rgba(31,29,26,0.04)] sm:p-6"
              >
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                  <span className="inline-flex rounded-full border border-walnut/25 bg-section/80 px-2.5 py-1 font-mono text-[10px] tracking-[0.08em] uppercase text-walnut">
                    {FEEDBACK_TYPE_LABELS[submission.type]}
                  </span>
                  <time
                    dateTime={submission.createdAt}
                    className="font-mono text-[11px] text-muted"
                  >
                    {formatDate(submission.createdAt)}
                  </time>
                </div>

                <p className="mt-4 whitespace-pre-wrap text-sm leading-relaxed text-text">
                  {submission.message}
                </p>

                <dl className="mt-4 space-y-1 border-t border-border-soft/80 pt-4 font-mono text-[11px] text-muted">
                  {submission.email && (
                    <div className="flex flex-wrap gap-x-2">
                      <dt className="text-olive">Email</dt>
                      <dd>{submission.email}</dd>
                    </div>
                  )}
                  {submission.pageUrl && (
                    <div className="flex flex-wrap gap-x-2">
                      <dt className="text-olive">Page</dt>
                      <dd className="break-all">{submission.pageUrl}</dd>
                    </div>
                  )}
                  <div className="flex flex-wrap gap-x-2">
                    <dt className="text-olive">ID</dt>
                    <dd className="break-all">{submission.id}</dd>
                  </div>
                </dl>
              </li>
            ))}
          </ul>
        )}
      </PageContainer>
    </main>
  );
}
