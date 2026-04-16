"use client";

import { motion } from "framer-motion";
import { GrammarBoardBackdrop } from "./overlays/GrammarBoardBackdrop";

type TileTone = "neutral" | "accent";

interface GrammarLoaderTileProps {
  symbol: string;
  tone: TileTone;
  width: number;
  height: number;
  symbolClassName: string;
}

const TILE_PALETTES: Record<
  TileTone,
  {
    shell: string;
    highlight: string;
    atmosphere: string;
    innerBorder: string;
    symbol: string;
  }
> = {
  neutral: {
    shell:
      "bg-[#e8e4e1] border-black/10 shadow-[0_16px_36px_rgba(16,16,18,0.08)] dark:bg-[#0b0b0b] dark:border-white/10 dark:shadow-[0_18px_42px_rgba(0,0,0,0.52)]",
    highlight:
      "bg-gradient-to-br from-white/12 via-transparent to-transparent dark:from-white/6",
    atmosphere:
      "bg-[radial-gradient(circle_at_92%_14%,rgba(255,255,255,0.16),transparent_34%),radial-gradient(circle_at_12%_88%,rgba(255,255,255,0.1),transparent_28%)] dark:bg-[radial-gradient(circle_at_92%_14%,rgba(255,255,255,0.08),transparent_34%),radial-gradient(circle_at_12%_88%,rgba(255,255,255,0.04),transparent_28%)]",
    innerBorder: "border-white/60 dark:border-white/8",
    symbol:
      "text-[rgba(88,82,77,0.82)] dark:text-[rgba(228,220,213,0.7)]",
  },
  accent: {
    shell:
      "bg-[#ba4845] border-[#9f3b38] shadow-[0_18px_42px_rgba(186,72,69,0.24)] dark:bg-[#b43f3c] dark:border-[#cf726d] dark:shadow-[0_20px_46px_rgba(120,26,24,0.44)]",
    highlight:
      "bg-gradient-to-br from-white/16 via-transparent to-transparent dark:from-white/10",
    atmosphere:
      "bg-[radial-gradient(circle_at_92%_14%,rgba(255,255,255,0.2),transparent_34%),radial-gradient(circle_at_12%_88%,rgba(255,255,255,0.12),transparent_28%)] dark:bg-[radial-gradient(circle_at_92%_14%,rgba(255,255,255,0.14),transparent_34%),radial-gradient(circle_at_12%_88%,rgba(255,255,255,0.08),transparent_28%)]",
    innerBorder: "border-white/32 dark:border-white/14",
    symbol:
      "text-[rgba(248,234,231,0.82)] dark:text-[rgba(239,223,220,0.76)]",
  },
};

function GrammarLoaderTile({
  symbol,
  tone,
  width,
  height,
  symbolClassName,
}: GrammarLoaderTileProps) {
  const palette = TILE_PALETTES[tone];

  return (
    <div
      className={`relative overflow-hidden rounded-[18px] border ${palette.shell}`}
      style={{ width, height }}
    >
      <div className={`pointer-events-none absolute inset-0 ${palette.highlight}`} />
      <div className={`pointer-events-none absolute inset-0 ${palette.atmosphere}`} />
      <div
        className={`pointer-events-none absolute inset-[1px] rounded-[17px] border ${palette.innerBorder}`}
      />

      <div className="relative z-10 flex h-full items-center justify-center">
        <span
          className={[
            "select-none font-black leading-none tracking-[0.04em]",
            palette.symbol,
            symbolClassName,
          ].join(" ")}
        >
          {symbol}
        </span>
      </div>
    </div>
  );
}

export default function GrammarBoardLoading() {
  return (
    <div className="absolute inset-0 overflow-hidden bg-surface-primary">
      <GrammarBoardBackdrop />

      <div className="pointer-events-none absolute inset-0 opacity-60 [background-image:repeating-linear-gradient(0deg,transparent,transparent_159px,rgba(18,18,22,0.08)_160px),repeating-linear-gradient(90deg,transparent,transparent_159px,rgba(18,18,22,0.08)_160px)] dark:opacity-35 dark:[background-image:repeating-linear-gradient(0deg,transparent,transparent_159px,rgba(255,255,255,0.05)_160px),repeating-linear-gradient(90deg,transparent,transparent_159px,rgba(255,255,255,0.05)_160px)]" />

      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_48%_34%_at_50%_50%,rgba(186,72,69,0.08)_0%,transparent_82%)] dark:bg-[radial-gradient(ellipse_48%_34%_at_50%_50%,rgba(186,72,69,0.12)_0%,transparent_82%)]" />

      <div className="relative z-10 flex h-full flex-col items-center justify-center px-4 pt-24 pb-8 sm:px-6 sm:pt-28">
        <div className="relative h-[180px] w-[280px] sm:h-[220px] sm:w-[340px]">
          <motion.div
            className="absolute left-[52px] top-[88px] h-[2px] origin-left rounded-full sm:left-[68px] sm:top-[110px]"
            style={{
              width: 86,
              background: "rgba(186,72,69,0.55)",
              boxShadow: "0 0 9px rgba(186,72,69,0.12)",
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
              background: "rgba(186,72,69,0.55)",
              boxShadow: "0 0 9px rgba(186,72,69,0.12)",
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

          <motion.div
            className="absolute left-[18px] top-[60px] z-20 sm:left-[26px] sm:top-[80px]"
            style={{ filter: "drop-shadow(0 8px 20px rgba(0,0,0,0.12))" }}
            animate={{ y: [0, -5, 0], scale: [1, 1.03, 1] }}
            transition={{
              duration: 2.4,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            <GrammarLoaderTile
              symbol="助"
              tone="neutral"
              width={66}
              height={60}
              symbolClassName="text-[1.8rem] sm:text-[2rem]"
            />
          </motion.div>

          <motion.div
            className="absolute left-[102px] top-[50px] z-20 sm:left-[130px] sm:top-[70px]"
            style={{ filter: "drop-shadow(0 10px 24px rgba(186,72,69,0.24))" }}
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
              className="absolute inset-0 rounded-[22px]"
              style={{
                background:
                  "radial-gradient(circle, rgba(186,72,69,0.12) 0%, transparent 72%)",
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
              <GrammarLoaderTile
                symbol="文"
                tone="accent"
                width={78}
                height={78}
                symbolClassName="text-[2.05rem] sm:text-[2.35rem]"
              />
            </div>
          </motion.div>

          <motion.div
            className="absolute left-[212px] top-[60px] z-20 sm:left-[256px] sm:top-[80px]"
            style={{ filter: "drop-shadow(0 8px 20px rgba(0,0,0,0.12))" }}
            animate={{ y: [0, -4, 0], scale: [1, 1.03, 1] }}
            transition={{
              duration: 2.5,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 0.4,
            }}
          >
            <motion.div
              animate={{ opacity: [0.42, 0.8, 0.42] }}
              transition={{
                duration: 1.4,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 0.55,
              }}
            >
              <GrammarLoaderTile
                symbol="語"
                tone="neutral"
                width={66}
                height={60}
                symbolClassName="text-[1.8rem] sm:text-[2rem]"
              />
            </motion.div>
          </motion.div>

          <motion.div
            className="absolute top-[84px] z-10 h-[10px] w-[10px] rounded-full sm:top-[106px]"
            style={{
              left: "48px",
              background: "rgba(186,72,69,0.95)",
              boxShadow: "0 0 18px rgba(186,72,69,0.18)",
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

          <motion.div
            className="absolute left-[124px] top-[70px] rounded-full border sm:left-[154px] sm:top-[90px]"
            style={{
              width: 42,
              height: 42,
              borderColor: "rgba(186,72,69,0.12)",
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
              borderColor: "rgba(186,72,69,0.12)",
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

        <motion.div
          className="mt-1 flex flex-col items-center text-center"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: "easeOut" }}
        >
          <p className="text-sm font-medium tracking-[0.18em] uppercase text-content-primary/90">
            Cargando gramatica
          </p>

          <div className="mt-3 flex items-center gap-2">
            {[0, 1, 2].map((dot) => (
              <motion.span
                key={dot}
                className="block rounded-full"
                style={{
                  width: 6,
                  height: 6,
                  background: "rgba(186,72,69,0.95)",
                  boxShadow: "0 0 12px rgba(186,72,69,0.18)",
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