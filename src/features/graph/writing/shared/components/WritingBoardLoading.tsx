"use client";

import { motion } from "framer-motion";
import { ShogiSymbolBox } from "@/features/library/components/ScriptCardLayout";
import { usePlatformMotion } from "@/shared/hooks/usePlatformMotion";
import { useWritingBoardQuality } from "../hooks/useWritingBoardQuality";
import { WritingBoardBackground } from "./WritingBoardBackground";
import { useMasteredModules } from "@/features/mastery/components/MasteredModulesProvider";

interface WritingBoardLoadingProps {
  scriptType?: "hiragana" | "katakana" | "kanji";
}

const SCRIPT_THEME: Record<
  NonNullable<WritingBoardLoadingProps["scriptType"]>,
  {
    glow: string;
    line: string;
    solid: string;
    soft: string;
    gradient: string;
    gradientFaded: string;
  }
> = {
  hiragana: {
    glow: "rgba(123,63,138,0.18)",
    line: "rgba(123,63,138,0.55)",
    solid: "rgba(168,102,181,0.95)",
    soft: "rgba(123,63,138,0.12)",
    gradient: "linear-gradient(to bottom right, #7B3F8A, #A866B5)",
    gradientFaded: "linear-gradient(to bottom right, rgba(123,63,138,0.65), rgba(168,102,181,0.55))",
  },
  katakana: {
    glow: "rgba(27,80,120,0.18)",
    line: "rgba(27,80,120,0.55)",
    solid: "rgba(46,130,181,0.95)",
    soft: "rgba(27,80,120,0.12)",
    gradient: "linear-gradient(to bottom right, #1B5078, #2E82B5)",
    gradientFaded: "linear-gradient(to bottom right, rgba(27,80,120,0.65), rgba(46,130,181,0.55))",
  },
  kanji: {
    glow: "rgba(186,72,69,0.18)",
    line: "rgba(186,72,69,0.55)",
    solid: "rgba(186,72,69,0.95)",
    soft: "rgba(186,72,69,0.12)",
    gradient: "linear-gradient(to bottom right, #BA4845, #D06460)",
    gradientFaded: "linear-gradient(to bottom right, rgba(186,72,69,0.65), rgba(208,100,96,0.55))",
  },
};

const GOLD_THEME = {
  glow: "rgba(212,168,67,0.18)",
  line: "rgba(212,168,67,0.55)",
  solid: "rgba(212,168,67,0.95)",
  soft: "rgba(212,168,67,0.12)",
  gradient: "linear-gradient(to bottom right, #D4A843, #C49B3B)",
  gradientFaded: "linear-gradient(to bottom right, rgba(212,168,67,0.65), rgba(196,155,59,0.55))",
};

const SCRIPT_LABEL: Record<
  NonNullable<WritingBoardLoadingProps["scriptType"]>,
  string
> = {
  hiragana: "Cargando hiragana",
  katakana: "Cargando katakana",
  kanji: "Cargando kanji",
};

const SCRIPT_SYMBOL: Record<
  NonNullable<WritingBoardLoadingProps["scriptType"]>,
  string
> = {
  hiragana: "あ",
  katakana: "ア",
  kanji: "漢",
};

const SCRIPT_SIDE_SYMBOLS: Record<
  NonNullable<WritingBoardLoadingProps["scriptType"]>,
  [string, string]
> = {
  hiragana: ["い", "う"],
  katakana: ["イ", "ウ"],
  kanji: ["山", "川"],
};

export default function WritingBoardLoading({
  scriptType = "kanji",
}: WritingBoardLoadingProps) {
  const mastered = useMasteredModules();
  const isMastered = mastered.has(scriptType);
  const theme = isMastered ? GOLD_THEME : SCRIPT_THEME[scriptType];
  const shogiGradient = isMastered
    ? "from-[#D4A843] to-[#C49B3B]"
    : "from-[#7B3F8A] to-[#A866B5]";
  const isHiragana = scriptType === "hiragana";
  const { graphicsProfile } = usePlatformMotion();
  const qualityProfile = useWritingBoardQuality(graphicsProfile);
  const shapeClass =
    scriptType === "kanji"
      ? "rounded-full"
      : scriptType === "katakana"
        ? "rounded-xl"
        : "rounded-[16px]";
  const sideSize =
    scriptType === "kanji"
      ? { width: 56, height: 56 }
      : scriptType === "katakana"
        ? { width: 48, height: 64 }
        : { width: 52, height: 64 };
  const centerSize =
    scriptType === "kanji"
      ? { width: 70, height: 70 }
      : scriptType === "katakana"
        ? { width: 62, height: 82 }
        : { width: 64, height: 82 };
  const centerSymbolClass =
    scriptType === "kanji"
      ? "text-[32px] sm:text-[36px]"
      : "text-[30px] sm:text-[34px]";

  return (
    <div className="absolute inset-0 overflow-hidden bg-surface-primary">
      {/* Same board background used in the writing map */}
      <div
        className="absolute inset-0"
        data-kanji-quality={qualityProfile.tier}
        data-kanji-parallax={
          graphicsProfile.shouldUseParallax ? "active" : "inactive"
        }
      >
        <WritingBoardBackground
          qualityProfile={qualityProfile}
          graphicsProfile={graphicsProfile}
          scriptType={scriptType}
        />
      </div>

      {/* Board grid lines */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: [
            "repeating-linear-gradient(0deg, transparent, transparent 159px, rgba(18,18,22,0.15) 160px)",
            "repeating-linear-gradient(90deg, transparent, transparent 159px, rgba(18,18,22,0.15) 160px)",
          ].join(","),
        }}
      />

      {/* Atmosphere */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `radial-gradient(ellipse 48% 34% at 50% 50%, ${theme.soft} 0%, transparent 82%)`,
        }}
      />

      {/* Main loader */}
      <div className="relative z-10 flex h-full flex-col items-center justify-center px-4 pt-24 pb-8 sm:px-6 sm:pt-28">
        <div className="relative h-[180px] w-[280px] sm:h-[220px] sm:w-[340px]">
          {/* animated lines */}
          <motion.div
            className="absolute left-[52px] top-[88px] h-[2px] origin-left rounded-full sm:left-[68px] sm:top-[110px]"
            style={{
              width: 86,
              background: theme.line,
              boxShadow: `0 0 9px ${theme.soft}`,
            }}
            initial={{ scaleX: 0, opacity: 0.35 }}
            animate={{ scaleX: [0, 1, 1], opacity: [0.35, 1, 0.75] }}
            transition={{
              duration: 1.8,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />

          <motion.div
            className="absolute left-[138px] top-[88px] h-[2px] origin-left rounded-full sm:left-[172px] sm:top-[110px]"
            style={{
              width: 86,
              background: theme.line,
              boxShadow: `0 0 9px ${theme.soft}`,
            }}
            initial={{ scaleX: 0, opacity: 0.35 }}
            animate={{ scaleX: [0, 1, 1], opacity: [0.35, 1, 0.75] }}
            transition={{
              duration: 1.8,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 0.3,
            }}
          />

          {/* node 1 */}
          <motion.div
            className="absolute left-[24px] top-[64px] z-20 sm:left-[32px] sm:top-[84px]"
            style={{ filter: `drop-shadow(0 6px 16px ${theme.glow})` }}
            animate={{ y: [0, -5, 0], scale: [1, 1.03, 1] }}
            transition={{
              duration: 2.4,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            {isHiragana ? (
              <div
                className="relative flex items-center justify-center"
                style={{ width: sideSize.width, height: sideSize.height }}
              >
                <div className="scale-[1.15] opacity-75">
                  <ShogiSymbolBox
                    symbol={SCRIPT_SIDE_SYMBOLS[scriptType][0]}
                    gradient={shogiGradient}
                    hoverTransition=""
                  />
                </div>
              </div>
            ) : (
              <div
                className={`relative flex items-center justify-center ${shapeClass}`}
                style={{
                  width: sideSize.width,
                  height: sideSize.height,
                  background: theme.gradientFaded,
                }}
              >
                <span className="select-none text-[18px] font-bold leading-none text-white/60">
                  {SCRIPT_SIDE_SYMBOLS[scriptType][0]}
                </span>
              </div>
            )}
          </motion.div>

          {/* node 2 */}
          <motion.div
            className="absolute left-[110px] top-[56px] z-20 sm:left-[138px] sm:top-[76px]"
            style={{ filter: `drop-shadow(0 8px 24px ${theme.glow})` }}
            animate={{
              y: [0, 6, 0, 0, -4, 0],
              scale: [1, 1.04, 1, 1, 1.12, 1],
            }}
            transition={{
              duration: 1.8,
              repeat: Infinity,
              ease: "easeInOut",
              times: [0, 0.18, 0.32, 0.42, 0.55, 1],
            }}
          >
            {isHiragana ? (
              <div
                className="relative flex items-center justify-center"
                style={{ width: centerSize.width, height: centerSize.height }}
              >
                <motion.div
                  className="absolute inset-0 rounded-full"
                  style={{
                    background: `radial-gradient(circle, ${theme.soft} 0%, transparent 72%)`,
                  }}
                  animate={{
                    opacity: [0.45, 0.75, 0.45, 0.45, 1, 0.55],
                    scale: [1, 1.03, 1, 1, 1.14, 1.02],
                  }}
                  transition={{
                    duration: 1.8,
                    repeat: Infinity,
                    ease: "easeInOut",
                    times: [0, 0.18, 0.32, 0.42, 0.55, 1],
                  }}
                />
                <div className="relative z-10 scale-[1.45]">
                  <ShogiSymbolBox
                    symbol={SCRIPT_SYMBOL[scriptType]}
                    gradient={shogiGradient}
                    hoverTransition=""
                  />
                </div>
              </div>
            ) : (
              <div
                className={`relative flex items-center justify-center overflow-hidden ${shapeClass}`}
                style={{
                  width: centerSize.width,
                  height: centerSize.height,
                  background: theme.gradient,
                }}
              >
                <motion.div
                  className={`absolute inset-0 ${shapeClass}`}
                  style={{
                    background: `radial-gradient(circle, ${theme.soft} 0%, transparent 70%)`,
                  }}
                  animate={{
                    opacity: [0.45, 0.75, 0.45, 0.45, 1, 0.55],
                    scale: [1, 1.03, 1, 1, 1.14, 1.02],
                  }}
                  transition={{
                    duration: 1.8,
                    repeat: Infinity,
                    ease: "easeInOut",
                    times: [0, 0.18, 0.32, 0.42, 0.55, 1],
                  }}
                />
                <span
                  className={`select-none font-black leading-none text-white ${centerSymbolClass}`}
                  style={{ filter: `drop-shadow(0 0 8px ${theme.glow})` }}
                >
                  {SCRIPT_SYMBOL[scriptType]}
                </span>
              </div>
            )}
          </motion.div>

          {/* node 3 */}
          <motion.div
            className="absolute left-[214px] top-[64px] z-20 sm:left-[258px] sm:top-[84px]"
            style={{ filter: `drop-shadow(0 6px 16px ${theme.glow})` }}
            animate={{ y: [0, -4, 0], scale: [1, 1.03, 1] }}
            transition={{
              duration: 2.5,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 0.4,
            }}
          >
            {isHiragana ? (
              <div
                className="relative flex items-center justify-center"
                style={{ width: sideSize.width, height: sideSize.height }}
              >
                <motion.div
                  className="scale-[1.15] opacity-75"
                  animate={{ opacity: [0.42, 0.8, 0.42] }}
                  transition={{
                    duration: 1.4,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: 0.55,
                  }}
                >
                  <ShogiSymbolBox
                    symbol={SCRIPT_SIDE_SYMBOLS[scriptType][1]}
                    gradient={shogiGradient}
                    hoverTransition=""
                  />
                </motion.div>
              </div>
            ) : (
              <div
                className={`relative flex items-center justify-center ${shapeClass}`}
                style={{
                  width: sideSize.width,
                  height: sideSize.height,
                  background: theme.gradientFaded,
                }}
              >
                <motion.span
                  className="select-none text-[18px] font-bold leading-none text-white/60"
                  animate={{ opacity: [0.35, 0.8, 0.35] }}
                  transition={{
                    duration: 1.4,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: 0.55,
                  }}
                >
                  {SCRIPT_SIDE_SYMBOLS[scriptType][1]}
                </motion.span>
              </div>
            )}
          </motion.div>

          {/* flowing particle */}
            <motion.div
            className="absolute top-[84px] z-10 h-[10px] w-[10px] rounded-full sm:top-[106px]"
            style={{
                left: 48,
                background: theme.solid,
                boxShadow: `0 0 18px ${theme.glow}`,
            }}
            animate={{
                x: [0, 86, 86, 190],
                opacity: [0, 1, 1, 0.95, 0],
                scale: [0.7, 1, 1.3, 1, 0.8],
            }}
            transition={{
                duration: 1.8,
                repeat: Infinity,
                ease: "easeInOut",
                times: [0, 0.42, 0.52, 0.82, 1],
            }}
            />

          {/* orbit rings */}
          <motion.div
            className="absolute left-[124px] top-[70px] rounded-full border sm:left-[154px] sm:top-[90px]"
            style={{
              width: 42,
              height: 42,
              borderColor: theme.soft,
            }}
            animate={{ scale: [0.85, 1.35], opacity: [0.55, 0] }}
            transition={{
              duration: 1.9,
              repeat: Infinity,
              ease: "easeOut",
            }}
          />
          <motion.div
            className="absolute left-[120px] top-[66px] rounded-full border sm:left-[150px] sm:top-[86px]"
            style={{
              width: 50,
              height: 50,
              borderColor: theme.soft,
            }}
            animate={{ scale: [0.8, 1.5], opacity: [0.4, 0] }}
            transition={{
              duration: 1.9,
              repeat: Infinity,
              ease: "easeOut",
              delay: 0.3,
            }}
          />
        </div>

        {/* Copy */}
        <motion.div
          className="mt-1 flex flex-col items-center text-center"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: "easeOut" }}
        >
          <p className="text-sm font-medium tracking-[0.18em] uppercase text-content-primary/90">
            {SCRIPT_LABEL[scriptType]}
          </p>

          <div className="mt-3 flex items-center gap-2">
            {[0, 1, 2].map((dot) => (
              <motion.span
                key={dot}
                className="block rounded-full"
                style={{
                  width: 6,
                  height: 6,
                  background: theme.solid,
                  boxShadow: `0 0 12px ${theme.glow}`,
                }}
                animate={{
                  y: [0, -6, 0],
                  opacity: [0.35, 1, 0.35],
                  scale: [0.9, 1.1, 0.9],
                }}
                transition={{
                  duration: 1.1,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: dot * 0.12,
                }}
              />
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}