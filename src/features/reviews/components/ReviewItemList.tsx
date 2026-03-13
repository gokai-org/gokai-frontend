"use client";

import { motion } from "framer-motion";
import { BookOpen, PenTool, BookText, Headphones, Mic } from "lucide-react";
import type {
  ReviewItem,
  ReviewKanji,
  ReviewGrammar,
  ReviewListening,
  ReviewSpeaking,
} from "../types";
import {
  getPrimaryMeaning,
  getPrimaryReading,
} from "@/features/kanji/utils/kanjiText";

/* ── Animation variants ───────────────────────────────── */

const listVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.08 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 16, scale: 0.97 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.45,
      ease: [0.22, 1, 0.36, 1] as [number, number, number, number],
    },
  },
};

/* ── Badge styles per type ────────────────────────────── */

const typeBadge: Record<
  ReviewItem["type"],
  { label: string; bg: string; text: string; icon: typeof PenTool }
> = {
  kanji: {
    label: "Escritura",
    bg: "bg-[#993331]/10",
    text: "text-[#993331]",
    icon: PenTool,
  },
  grammar: {
    label: "Gramática",
    bg: "bg-[#6B5B95]/10",
    text: "text-[#6B5B95]",
    icon: BookText,
  },
  listening: {
    label: "Escuchar",
    bg: "bg-[#C4863B]/10",
    text: "text-[#C4863B]",
    icon: Headphones,
  },
  speaking: {
    label: "Hablar",
    bg: "bg-[#3B8A7A]/10",
    text: "text-[#3B8A7A]",
    icon: Mic,
  },
};

/* ── Icon square (left side of every card) ────────────── */

const iconGradients: Record<ReviewItem["type"], string> = {
  kanji: "from-[#993331] to-[#BA5149]",
  grammar: "from-[#6B5B95] to-[#8B7BB5]",
  listening: "from-[#C4863B] to-[#D4A65B]",
  speaking: "from-[#3B8A7A] to-[#5BAA9A]",
};

/* ═══════════════════════════════════════════════════════ */
/*  KANJI CARD                                            */
/* ═══════════════════════════════════════════════════════ */

function KanjiCard({
  item,
  onStart,
}: {
  item: ReviewKanji;
  onStart?: (id: string) => void;
}) {
  const meaning = getPrimaryMeaning(item.kanji.meanings) ?? "—";
  const reading = getPrimaryReading(item.kanji.readings) ?? "—";

  return (
    <CardShell type="kanji" lastPracticed={item.lastPracticed}>
      {/* Symbol */}
      <IconSquare type="kanji">
        <span className="text-3xl font-bold text-white select-none">
          {item.kanji.symbol}
        </span>
      </IconSquare>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <BadgeRow type="kanji" lastPracticed={item.lastPracticed} />
        <h3 className="text-lg font-extrabold text-gray-900 truncate">
          {item.kanji.symbol}{" "}
          <span className="text-gray-500 font-bold text-base">({reading})</span>
          <span className="text-[#993331] ml-2 text-base">— {meaning}</span>
        </h3>
        <p className="text-xs text-gray-500 mt-1">
          Practica el trazado de este kanji
        </p>
      </div>

      {/* Action */}
      <ActionButton
        type="kanji"
        label="Escribir"
        icon={<PenTool className="w-4 h-4" />}
        onClick={() => onStart?.(item.id)}
      />
    </CardShell>
  );
}

/* ═══════════════════════════════════════════════════════ */
/*  GRAMMAR CARD                                          */
/* ═══════════════════════════════════════════════════════ */

function GrammarCard({
  item,
  onStart,
}: {
  item: ReviewGrammar;
  onStart?: (id: string) => void;
}) {
  return (
    <CardShell type="grammar" lastPracticed={item.lastPracticed}>
      <IconSquare type="grammar">
        <BookText className="w-7 h-7 text-white" />
      </IconSquare>

      <div className="flex-1 min-w-0">
        <BadgeRow type="grammar" lastPracticed={item.lastPracticed} />
        <h3 className="text-lg font-extrabold text-gray-900 truncate">
          {item.title}
        </h3>
        <p className="text-xs text-gray-500 mt-1 line-clamp-1">
          {item.description}
        </p>
        {item.examples && (
          <p className="text-xs text-gray-400 mt-0.5 font-mono truncate">
            {item.examples}
          </p>
        )}
      </div>

      <ActionButton
        type="grammar"
        label="Repasar"
        icon={<BookText className="w-4 h-4" />}
        onClick={() => onStart?.(item.id)}
      />
    </CardShell>
  );
}

/* ═══════════════════════════════════════════════════════ */
/*  LISTENING CARD                                        */
/* ═══════════════════════════════════════════════════════ */

function ListeningCard({
  item,
  onStart,
}: {
  item: ReviewListening;
  onStart?: (id: string) => void;
}) {
  return (
    <CardShell type="listening" lastPracticed={item.lastPracticed}>
      <IconSquare type="listening">
        <Headphones className="w-7 h-7 text-white" />
      </IconSquare>

      <div className="flex-1 min-w-0">
        <BadgeRow type="listening" lastPracticed={item.lastPracticed} />
        <h3 className="text-lg font-extrabold text-gray-900 truncate">
          {item.title}
        </h3>
        <p className="text-xs text-gray-500 mt-1 line-clamp-1">
          {item.description}
        </p>
        <p className="text-sm font-bold text-[#C4863B] mt-0.5">{item.kana}</p>
      </div>

      <ActionButton
        type="listening"
        label="Escuchar"
        icon={<Headphones className="w-4 h-4" />}
        onClick={() => onStart?.(item.id)}
      />
    </CardShell>
  );
}

/* ═══════════════════════════════════════════════════════ */
/*  SPEAKING CARD                                         */
/* ═══════════════════════════════════════════════════════ */

function SpeakingCard({
  item,
  onStart,
}: {
  item: ReviewSpeaking;
  onStart?: (id: string) => void;
}) {
  return (
    <CardShell type="speaking" lastPracticed={item.lastPracticed}>
      <IconSquare type="speaking">
        <Mic className="w-7 h-7 text-white" />
      </IconSquare>

      <div className="flex-1 min-w-0">
        <BadgeRow type="speaking" lastPracticed={item.lastPracticed} />
        <h3 className="text-lg font-extrabold text-gray-900 truncate">
          {item.title}
        </h3>
        <p className="text-xs text-gray-500 mt-1 line-clamp-1">
          {item.description}
        </p>
        <p className="text-sm font-bold text-[#3B8A7A] mt-0.5">
          「{item.phrase}」
        </p>
      </div>

      <ActionButton
        type="speaking"
        label="Practicar"
        icon={<Mic className="w-4 h-4" />}
        onClick={() => onStart?.(item.id)}
      />
    </CardShell>
  );
}

/* ═══════════════════════════════════════════════════════ */
/*  SHARED BUILDING BLOCKS                                */
/* ═══════════════════════════════════════════════════════ */

function CardShell({
  type,
  lastPracticed: _lp,
  children,
}: {
  type: ReviewItem["type"];
  lastPracticed: string;
  children: React.ReactNode;
}) {
  const borderHover: Record<ReviewItem["type"], string> = {
    kanji: "hover:border-[#993331]/20",
    grammar: "hover:border-[#6B5B95]/20",
    listening: "hover:border-[#C4863B]/20",
    speaking: "hover:border-[#3B8A7A]/20",
  };

  return (
    <motion.div
      variants={itemVariants}
      whileHover={{
        y: -2,
        boxShadow: "0 8px 24px -4px rgba(0,0,0,0.08)",
      }}
      className={`bg-white rounded-2xl p-5 shadow-sm border border-gray-100 transition-colors ${borderHover[type]}`}
    >
      <div className="flex items-center gap-5">{children}</div>
    </motion.div>
  );
}

function IconSquare({
  type,
  children,
}: {
  type: ReviewItem["type"];
  children: React.ReactNode;
}) {
  return (
    <div
      className={`flex-shrink-0 w-[72px] h-[72px] rounded-2xl bg-gradient-to-br ${iconGradients[type]} flex items-center justify-center shadow-lg`}
    >
      {children}
    </div>
  );
}

function BadgeRow({
  type,
  lastPracticed,
}: {
  type: ReviewItem["type"];
  lastPracticed: string;
}) {
  const badge = typeBadge[type];
  const Icon = badge.icon;
  return (
    <div className="flex items-center gap-2 mb-1 flex-wrap">
      <span
        className={`inline-flex items-center gap-1 px-3 py-0.5 text-xs font-bold rounded-full ${badge.bg} ${badge.text}`}
      >
        <Icon className="w-3 h-3" />
        {badge.label}
      </span>
      <span className="text-xs text-gray-400">
        Último repaso: {lastPracticed}
      </span>
    </div>
  );
}

function ActionButton({
  type,
  label,
  icon,
  onClick,
}: {
  type: ReviewItem["type"];
  label: string;
  icon: React.ReactNode;
  onClick: () => void;
}) {
  const colors: Record<ReviewItem["type"], string> = {
    kanji: "bg-[#993331] hover:bg-[#7a2927]",
    grammar: "bg-[#6B5B95] hover:bg-[#5A4A84]",
    listening: "bg-[#C4863B] hover:bg-[#A8722F]",
    speaking: "bg-[#3B8A7A] hover:bg-[#2D7466]",
  };

  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className={`flex-shrink-0 ${colors[type]} text-white px-6 py-2.5 rounded-full font-bold transition-colors shadow-md hover:shadow-lg text-sm flex items-center gap-2`}
    >
      {icon}
      {label}
    </motion.button>
  );
}

/* ═══════════════════════════════════════════════════════ */
/*  MAIN LIST                                             */
/* ═══════════════════════════════════════════════════════ */

interface ReviewItemListProps {
  items: ReviewItem[];
  onStart?: (id: string) => void;
}

export function ReviewItemList({ items, onStart }: ReviewItemListProps) {
  if (items.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-2xl p-10 shadow-sm border border-gray-100 text-center"
      >
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
          <BookOpen className="w-8 h-8 text-gray-400" />
        </div>
        <p className="text-lg font-bold text-gray-700">
          No hay lecciones para repasar
        </p>
        <p className="text-sm text-gray-500 mt-1">
          Completa más lecciones para desbloquear repasos
        </p>
      </motion.div>
    );
  }

  return (
    <motion.div
      variants={listVariants}
      initial="hidden"
      animate="visible"
      className="space-y-3"
    >
      {items.map((item) => {
        switch (item.type) {
          case "kanji":
            return <KanjiCard key={item.id} item={item} onStart={onStart} />;
          case "grammar":
            return <GrammarCard key={item.id} item={item} onStart={onStart} />;
          case "listening":
            return (
              <ListeningCard key={item.id} item={item} onStart={onStart} />
            );
          case "speaking":
            return <SpeakingCard key={item.id} item={item} onStart={onStart} />;
        }
      })}
    </motion.div>
  );
}
