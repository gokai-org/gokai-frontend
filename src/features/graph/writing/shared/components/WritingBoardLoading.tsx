"use client";

import { motion } from "framer-motion";
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
    gradientFaded: "linear-gradient(to bottom right, #693674, #8f54a0)",
  },
  katakana: {
    glow: "rgba(27,80,120,0.18)",
    line: "rgba(27,80,120,0.55)",
    solid: "rgba(46,130,181,0.95)",
    soft: "rgba(27,80,120,0.12)",
    gradient: "linear-gradient(to bottom right, #1B5078, #2E82B5)",
    gradientFaded: "linear-gradient(to bottom right, #174768, #276f96)",
  },
  kanji: {
    glow: "rgba(186,72,69,0.18)",
    line: "rgba(186,72,69,0.55)",
    solid: "rgba(186,72,69,0.95)",
    soft: "rgba(186,72,69,0.12)",
    gradient: "linear-gradient(to bottom right, #BA4845, #D06460)",
    gradientFaded: "linear-gradient(to bottom right, #a43f3c, #bf5a56)",
  },
};

const GOLD_THEME = {
  glow: "rgba(212,168,67,0.18)",
  line: "rgba(212,168,67,0.55)",
  solid: "rgba(212,168,67,0.95)",
  soft: "rgba(212,168,67,0.12)",
  gradient: "linear-gradient(to bottom right, #D4A843, #C49B3B)",
  gradientFaded: "linear-gradient(to bottom right, #bc973a, #a98631)",
};

const SHOGI_PATH =
  "path('M 18 3 Q 22 0 26 3 L 40 15 Q 44 18 44 23 L 44 50 Q 44 56 38 56 L 6 56 Q 0 56 0 50 L 0 23 Q 0 18 4 15 Z')";

// SHOGI_PATH scaled ~1.455× to fill the 64×82 center container
const SHOGI_PATH_LARGE =
  "path('M 26 4 Q 32 0 38 4 L 58 22 Q 64 26 64 34 L 64 73 Q 64 82 55 82 L 9 82 Q 0 82 0 73 L 0 34 Q 0 26 6 22 Z')";

interface WritingLoaderPieceProps {
  scriptType: NonNullable<WritingBoardLoadingProps["scriptType"]>;
  symbol: string;
  theme: (typeof SCRIPT_THEME)["hiragana"];
  width: number;
  height: number;
  isCenter?: boolean;
}

function WritingLoaderPiece({
  scriptType,
  symbol,
  theme,
  width,
  height,
  isCenter = false,
}: WritingLoaderPieceProps) {
  if (scriptType === "hiragana") {
    const shogiPath = isCenter ? SHOGI_PATH_LARGE : SHOGI_PATH;
    return (
      <div
        className="relative flex items-center justify-center"
        style={{ width, height, clipPath: shogiPath }}
      >
        <div
          className="absolute inset-0"
          style={{
            background: isCenter ? theme.gradient : theme.gradientFaded,
            boxShadow: `inset 0 1px 0 rgba(255,255,255,0.24), 0 10px 22px ${theme.glow}`,
          }}
        />
        <div
          className="pointer-events-none absolute inset-[1px]"
          style={{
            border: "1px solid rgba(255,255,255,0.18)",
          }}
        />
        <span
          className={[
            "relative z-10 select-none font-black leading-none text-white",
            isCenter ? "text-[30px] sm:text-[34px]" : "text-[18px]",
          ].join(" ")}
          style={{ filter: `drop-shadow(0 0 8px ${theme.glow})` }}
        >
          {symbol}
        </span>
      </div>
    );
  }

  if (scriptType === "katakana") {
    return (
      <div
        className="relative flex items-center justify-center rounded-[16px]"
        style={{
          width,
          height,
          background: isCenter ? theme.gradient : theme.gradientFaded,
          boxShadow: `inset 0 1px 0 rgba(255,255,255,0.18), 0 10px 22px ${theme.glow}`,
        }}
      >
        <div className="pointer-events-none absolute inset-[1px] rounded-[15px] border border-white/14" />
        <span
          className={[
            "relative z-10 select-none font-black leading-none text-white",
            isCenter ? "text-[30px] sm:text-[34px]" : "text-[18px]",
          ].join(" ")}
          style={{ filter: `drop-shadow(0 0 8px ${theme.glow})` }}
        >
          {symbol}
        </span>
      </div>
    );
  }

  return (
    <div
      className="relative flex items-center justify-center overflow-hidden rounded-full"
      style={{
        width,
        height,
        background: isCenter ? theme.gradient : theme.gradientFaded,
        boxShadow: `inset 0 1px 0 rgba(255,255,255,0.18), 0 10px 22px ${theme.glow}`,
      }}
    >
      <div className="pointer-events-none absolute inset-[1px] rounded-full border border-white/14" />
      <span
        className={[
          "relative z-10 select-none font-black leading-none text-white",
          isCenter ? "text-[32px] sm:text-[36px]" : "text-[18px]",
        ].join(" ")}
        style={{ filter: `drop-shadow(0 0 8px ${theme.glow})` }}
      >
        {symbol}
      </span>
    </div>
  );
}

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
  const { graphicsProfile } = usePlatformMotion();
  const qualityProfile = useWritingBoardQuality(graphicsProfile);
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

  return (
    <div
      className="absolute inset-0 overflow-hidden bg-surface-primary"
      data-mastery-golden={isMastered ? "true" : "false"}
    >
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
            <WritingLoaderPiece
              scriptType={scriptType}
              symbol={SCRIPT_SIDE_SYMBOLS[scriptType][0]}
              theme={theme}
              width={sideSize.width}
              height={sideSize.height}
            />
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

            <div className="relative z-10">
              <WritingLoaderPiece
                scriptType={scriptType}
                symbol={SCRIPT_SYMBOL[scriptType]}
                theme={theme}
                width={centerSize.width}
                height={centerSize.height}
                isCenter
              />
            </div>
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
            <motion.div
              animate={{ opacity: [0.82, 1, 0.82] }}
              transition={{
                duration: 1.4,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 0.55,
              }}
            >
              <WritingLoaderPiece
                scriptType={scriptType}
                symbol={SCRIPT_SIDE_SYMBOLS[scriptType][1]}
                theme={theme}
                width={sideSize.width}
                height={sideSize.height}
              />
            </motion.div>
          </motion.div>

          {/* flowing particle */}
            <motion.div
            className="absolute top-[84px] z-10 h-[10px] w-[10px] rounded-full sm:top-[106px]"
            style={{
                left: "48px",
                background: theme.solid,
                boxShadow: `0 0 18px ${theme.glow}`,
            }}
            animate={{
                left: ["48px", "calc(50% - 5px)", "calc(50% - 5px)", "238px"],
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