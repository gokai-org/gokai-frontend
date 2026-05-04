"use client";

import { useEffect, useMemo, useState, type CSSProperties } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { useMiniDockBlocker } from "@/features/dashboard/utils/miniDockBlockers";
import {
  LESSON_DRAWER_DESKTOP_WIDTH,
  LESSON_DRAWER_MAX_VIEWPORT_RATIO,
} from "@/features/lessons/lib/drawerLayout";
import type {
  VocabularyGraphProgressItem,
  VocabularyWordLesson,
} from "../types";
import { getVocabularyNodeMastery } from "../lib/vocabularyGraphBuilder";
import VocabularyQuizModal from "./VocabularyQuizModal";
import VocabularyWordGuide from "./VocabularyWordGuide";

type VocabularyNodePanelProps = {
  item: VocabularyGraphProgressItem | null;
  question: VocabularyWordLesson | null;
  onClose: () => void;
  onSaved: () => void;
};

function getQuestionTitle(question: VocabularyWordLesson) {
  return question.kanji || question.hiragana || "語";
}

function getQuestionSubtitle(question: VocabularyWordLesson) {
  return question.meanings?.join(", ") || question.hiragana || "Vocabulario";
}

export default function VocabularyNodePanel({
  item,
  question,
  onClose,
  onSaved,
}: VocabularyNodePanelProps) {
  const open = Boolean(item && question);
  useMiniDockBlocker(open);

  const [quizOpen, setQuizOpen] = useState(false);
  const [screen, setScreen] = useState<"mobile" | "tablet" | "desktop">("desktop");

  const mastery = useMemo(() => (item ? getVocabularyNodeMastery(item) : null), [item]);

  useEffect(() => {
    if (!open) {
      queueMicrotask(() => setQuizOpen(false));
    }
  }, [open]);

  useEffect(() => {
    const updateScreen = () => {
      if (window.innerWidth < 640) {
        setScreen("mobile");
      } else if (window.innerWidth < 1024) {
        setScreen("tablet");
      } else {
        setScreen("desktop");
      }
    };

    updateScreen();
    window.addEventListener("resize", updateScreen);
    return () => window.removeEventListener("resize", updateScreen);
  }, []);

  const wrapperClasses =
    screen === "desktop"
      ? "fixed inset-0 z-50 flex items-stretch justify-end p-3 pointer-events-none"
      : "fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 pointer-events-none";

  const asideClasses =
    screen === "desktop"
      ? "pointer-events-auto flex h-full flex-col overflow-hidden rounded-3xl border border-border-default/60 bg-surface-primary shadow-2xl"
      : screen === "tablet"
        ? "pointer-events-auto flex h-[min(82dvh,760px)] w-[min(92vw,560px)] flex-col overflow-hidden rounded-3xl border border-border-default/60 bg-surface-primary shadow-2xl"
        : "pointer-events-auto flex h-[min(78dvh,700px)] w-[min(calc(100vw-16px),420px)] flex-col overflow-hidden rounded-[28px] border border-border-default/60 bg-surface-primary shadow-2xl";

  const desktopAsideStyle: CSSProperties | undefined =
    screen === "desktop"
      ? {
          width: `${LESSON_DRAWER_DESKTOP_WIDTH}px`,
          maxWidth: `${Math.round(LESSON_DRAWER_MAX_VIEWPORT_RATIO * 100)}vw`,
        }
      : undefined;

  const initialAnimation =
    screen === "desktop" ? { x: 60, opacity: 0 } : { scale: 0.96, opacity: 0 };
  const visibleAnimation =
    screen === "desktop" ? { x: 0, opacity: 1 } : { scale: 1, opacity: 1 };

  return (
    <AnimatePresence>
      {item && question && mastery && (
        <>
          <motion.button
            aria-label="Cerrar"
            onClick={onClose}
            className="fixed inset-0 z-40 bg-black/25 backdrop-blur-[1px]"
            initial={{ opacity: 0 }}
            animate={{ opacity: quizOpen ? 0 : 1 }}
            exit={{ opacity: 0 }}
            style={{ pointerEvents: quizOpen ? "none" : "auto" }}
          />

          <div className={wrapperClasses}>
            <motion.aside
              data-help-target="lesson-drawer"
              className={asideClasses}
              initial={initialAnimation}
              animate={quizOpen ? initialAnimation : visibleAnimation}
              exit={initialAnimation}
              transition={{ type: "spring", stiffness: 260, damping: 26 }}
              style={{
                ...desktopAsideStyle,
                ...(quizOpen ? { pointerEvents: "none" as const } : {}),
              }}
            >
              <div className="shrink-0 overflow-hidden rounded-t-[28px] lg:rounded-t-3xl">
                <div className="bg-gradient-to-r from-accent to-accent-hover px-4 py-3 sm:px-5 sm:py-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex min-w-0 items-center gap-2.5 sm:gap-3">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/15 shadow-inner backdrop-blur-sm sm:h-14 sm:w-14 sm:rounded-2xl">
                        <span className="select-none text-[22px] font-black leading-none text-white sm:text-[28px]">
                          {getQuestionTitle(question)}
                        </span>
                      </div>

                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                          <span className="rounded-full bg-white/20 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white sm:text-[11px]">
                            Palabra
                          </span>
                          <span className="rounded-full bg-white/15 px-2 py-0.5 text-[10px] font-bold text-white sm:text-[11px]">
                            Nodo {mastery.average}%
                          </span>
                        </div>

                        <h2 className="mt-0.5 truncate text-sm font-extrabold leading-tight text-white sm:text-base">
                          {getQuestionSubtitle(question)}
                        </h2>
                        <p className="mt-0.5 truncate text-[11px] font-medium text-white/70 sm:text-xs">
                          {item.meaning}
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={onClose}
                      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-white/15 text-white transition hover:bg-white/25"
                      aria-label="Cerrar"
                    >
                      <X size={16} strokeWidth={2.5} />
                    </button>
                  </div>
                </div>
              </div>

              <div className="lesson-drawer-body flex-1 overflow-y-auto px-3 pb-3 pt-3 sm:px-5 sm:pb-5 sm:pt-4 lg:px-6 lg:pb-6 lg:pt-5">
                <VocabularyWordGuide
                  question={question}
                  subthemeMeaning={item.meaning}
                  onStartQuiz={() => setQuizOpen(true)}
                />
              </div>
            </motion.aside>
          </div>

          <VocabularyQuizModal
            open={quizOpen}
            item={item}
            question={question}
            onClose={() => setQuizOpen(false)}
            onSaved={onSaved}
          />
        </>
      )}
    </AnimatePresence>
  );
}
