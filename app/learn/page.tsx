"use client";

import { useCallback, useEffect, useState } from "react";
import { LessonModal } from "@/components/learn/LessonModal";
import { getLessonByKeyId } from "@/lib/lessons/registry";
import { KeysGrid } from "@/components/learn/KeysGrid";
import { LearnHeader } from "@/components/learn/LearnHeader";
import { ProgressBar } from "@/components/learn/ProgressBar";
import { PageContainer } from "@/components/landing/PageContainer";
import {
  getLearnedKeys,
  markKeyLearned,
  TOTAL_MAJOR_KEYS,
  unmarkKeyLearned,
} from "@/lib/learn-progress";
import type { MajorKey } from "@/lib/major-keys";

export default function LearnPage() {
  const [learnedKeys, setLearnedKeys] = useState<string[]>([]);
  const [activeLesson, setActiveLesson] = useState<MajorKey | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setLearnedKeys(getLearnedKeys());
    setMounted(true);
  }, []);

  const handleSelectKey = useCallback((key: MajorKey) => {
    if (!key.available || !getLessonByKeyId(key.id)) return;
    setActiveLesson(key);
  }, []);

  const activeLessonDefinition = activeLesson
    ? getLessonByKeyId(activeLesson.id)
    : undefined;

  const handleCompleteLesson = useCallback(() => {
    if (!activeLessonDefinition) return;
    const updated = markKeyLearned(activeLessonDefinition.keyId);
    setLearnedKeys(updated);
  }, [activeLessonDefinition]);

  const handleCloseLesson = useCallback(() => {
    setActiveLesson(null);
  }, []);

  const handleResetLessonProgress = useCallback(() => {
    if (!activeLessonDefinition) return;
    const updated = unmarkKeyLearned(activeLessonDefinition.keyId);
    setLearnedKeys(updated);
  }, [activeLessonDefinition]);

  const handleDevReset = useCallback(() => {
    localStorage.clear();
    window.location.reload();
  }, []);

  return (
    <>
      <LearnHeader />
      <main className="min-h-screen bg-background pt-[4.5rem] pb-16 lg:pt-[4.5rem] lg:pb-20">
        <section className="border-b border-border-soft bg-section py-12 lg:py-16">
          <PageContainer>
            <p className="mb-3 font-mono text-[11px] tracking-[0.22em] uppercase text-olive">
              SoundSteward Learning
            </p>
            <h1 className="text-[2.25rem] font-medium leading-[1.08] tracking-[-0.035em] text-text sm:text-4xl lg:text-5xl">
              The 12 Major Keys
            </h1>
            <p className="mt-4 max-w-2xl text-lg leading-relaxed text-muted lg:mt-5 lg:text-xl">
              Before learning Nashville Numbers, you need to understand the 12
              major keys.
            </p>
            <p className="mt-3 font-mono text-[11px] tracking-[0.12em] uppercase text-walnut">
              Complete this section to unlock Nashville Numbers.
            </p>
          </PageContainer>
        </section>

        <PageContainer className="space-y-10 py-10 lg:space-y-12 lg:py-12">
          <ProgressBar
            learnedCount={mounted ? learnedKeys.length : 0}
            total={TOTAL_MAJOR_KEYS}
          />

          <section>
            <div className="mb-6 flex items-end justify-between gap-4">
              <div>
                <h2 className="text-2xl font-medium tracking-[-0.02em] text-text lg:text-3xl">
                  Major Keys
                </h2>
                <p className="mt-2 text-muted">
                  Select a key to begin its lesson.
                </p>
              </div>
            </div>
            <KeysGrid learnedKeys={learnedKeys} onSelectKey={handleSelectKey} />
          </section>

          <div className="flex justify-end pt-2">
            <button
              type="button"
              onClick={handleDevReset}
              className="font-mono text-[10px] tracking-[0.06em] text-muted/50 transition-colors hover:text-muted"
            >
              Reset Local Progress
            </button>
          </div>
        </PageContainer>
      </main>

      {activeLessonDefinition && (
        <LessonModal
          key={activeLessonDefinition.id}
          lesson={activeLessonDefinition}
          onClose={handleCloseLesson}
          onComplete={handleCompleteLesson}
          onResetProgress={handleResetLessonProgress}
          hasCompletedBefore={learnedKeys.includes(activeLessonDefinition.keyId)}
        />
      )}
    </>
  );
}
