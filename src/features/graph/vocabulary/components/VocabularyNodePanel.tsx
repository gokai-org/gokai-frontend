"use client";

import { useEffect, useMemo, useState, type CSSProperties } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import Image, { type ImageLoaderProps } from "next/image";
import { useMiniDockBlocker } from "@/features/dashboard/utils/miniDockBlockers";
import {
  LESSON_DRAWER_DESKTOP_WIDTH,
  LESSON_DRAWER_MAX_VIEWPORT_RATIO,
} from "@/features/lessons/lib/drawerLayout";
import { RED_ICON_FILTER } from "@/features/library/utils/vocabularyCardConfig";
import type {
  VocabularyAnswerType,
  VocabularyGraphProgressItem,
  VocabularyQuizSaveContext,
  VocabularyQuizSaveResult,
  VocabularyWordLesson,
} from "../types";
import { getVocabularyNodeMastery } from "../lib/vocabularyGraphBuilder";
import {
  findWordProgress,
  getWordQuizProgressPercent,
  mergeWordProgress,
} from "../lib/vocabularyQuizProgress";
import VocabularyQuizModal from "./VocabularyQuizModal";
import VocabularyWordGuide from "./VocabularyWordGuide";

const passthroughImageLoader = ({ src }: ImageLoaderProps) => src;

type VocabularyNodePanelProps = {
  item: VocabularyGraphProgressItem | null;
  question: VocabularyWordLesson | null;
  onClose: () => void;
  onNavigateToLibrary?: () => void;
  onSaved: (
    context: VocabularyQuizSaveContext,
  ) => Promise<VocabularyQuizSaveResult | void> | VocabularyQuizSaveResult | void;
};

function getQuestionTitle(question: VocabularyWordLesson) {
  return question.kanji || question.hiragana || "語";
}

function getQuestionSubtitle(question: VocabularyWordLesson) {
  return question.meanings?.join(", ") || question.hiragana || "Vocabulario";
}

function isDisplayableImageSrc(value?: string | null) {
  return Boolean(value && (/^https?:\/\//i.test(value) || value.startsWith("data:image/")));
}

export default function VocabularyNodePanel({
  item,
  question,
  onClose,
  onNavigateToLibrary,
  onSaved,
}: VocabularyNodePanelProps) {
  const open = Boolean(item && question);
  useMiniDockBlocker(open);

  const [quizOpen, setQuizOpen] = useState(false);
  const [quizType, setQuizType] = useState<VocabularyAnswerType>("meaning");
  const [screen, setScreen] = useState<"mobile" | "tablet" | "desktop">("desktop");

  const mastery = useMemo(() => (item ? getVocabularyNodeMastery(item) : null), [item]);
  const questionWithProgress = useMemo(
    () => question && item
      ? mergeWordProgress(question, findWordProgress(item, question.wordId))
      : question,
    [item, question],
  );
  const wordProgress = item
    ? getWordQuizProgressPercent(questionWithProgress)
    : 0;
  const wordImageSrc = isDisplayableImageSrc(questionWithProgress?.icon)
    ? questionWithProgress?.icon
    : null;

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

  const handleQuizSaved = async (context: VocabularyQuizSaveContext) => {
    const result = await onSaved(context);

    if (result?.closeQuiz) {
      setQuizOpen(false);
      onClose();
    }

    return result;
  };

  return (
    <AnimatePresence>
      {item && questionWithProgress && mastery && (
        <>
          <motion.button
            data-vocabulary-overlay="true"
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
              data-vocabulary-overlay="true"
              data-help-target="lesson-drawer"
              className={asideClasses}
              initial={initialAnimation}
              animate={quizOpen ? initialAnimation : visibleAnimation}
              exit={initialAnimation}
              transition={{ type: "spring", stiffness: 260, damping: 26 }}
              onWheelCapture={(event) => event.stopPropagation()}
              onPointerDownCapture={(event) => event.stopPropagation()}
              onPointerMoveCapture={(event) => event.stopPropagation()}
              style={{
                ...desktopAsideStyle,
                ...(quizOpen ? { pointerEvents: "none" as const } : {}),
              }}
            >
              <div className="shrink-0 overflow-hidden rounded-t-[28px] lg:rounded-t-3xl">
                <div className="bg-gradient-to-r from-accent to-accent-hover px-4 py-3 sm:px-5 sm:py-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex min-w-0 items-center gap-2.5 sm:gap-3">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-white p-1.5 shadow-inner ring-1 ring-white/35 sm:h-14 sm:w-14 sm:rounded-2xl sm:p-2">
                        {wordImageSrc ? (
                          <Image
                            loader={passthroughImageLoader}
                            unoptimized
                            src={wordImageSrc}
                            alt=""
                            width={40}
                            height={40}
                            className="h-full w-full object-contain"
                            style={{ filter: RED_ICON_FILTER }}
                            draggable={false}
                          />
                        ) : (
                          <span className="select-none text-[22px] font-black leading-none text-accent sm:text-[28px]">
                            {getQuestionTitle(questionWithProgress)}
                          </span>
                        )}
                      </div>

                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                          <span className="rounded-full bg-white/20 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white sm:text-[11px]">
                            Palabra
                          </span>
                          <span className="rounded-full bg-white/15 px-2 py-0.5 text-[10px] font-bold text-white sm:text-[11px]">
                            Quiz {wordProgress}%
                          </span>
                        </div>

                        <h2 className="mt-0.5 truncate text-sm font-extrabold leading-tight text-white sm:text-base">
                          {getQuestionSubtitle(questionWithProgress)}
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
                  question={questionWithProgress}
                  subthemeMeaning={item.meaning}
                  onNavigateToLibrary={onNavigateToLibrary}
                  onStartQuiz={(type) => {
                    setQuizType(type);
                    setQuizOpen(true);
                  }}
                />
              </div>
            </motion.aside>
          </div>

          <VocabularyQuizModal
            open={quizOpen}
            item={item}
            question={questionWithProgress}
            initialType={quizType}
            onClose={() => setQuizOpen(false)}
            onSaved={handleQuizSaved}
          />
        </>
      )}
    </AnimatePresence>
  );
}
