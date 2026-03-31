"use client";

import {
  useRef, useState, useEffect,
  useCallback, useMemo, useLayoutEffect,
} from "react";
import { motion, useMotionValue, animate } from "framer-motion";
import type { PanInfo } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { FEATURES } from "@/features/landing/data/landingData";
import { FeatureCard } from "@/features/landing";
import { staggerContainer } from "@/features/landing/lib/motionVariants";

const EASE    = [0.22, 1, 0.36, 1] as const;
const GAP     = 24;       // gap-6 = 24 px
const AUTO_MS = 2_600;    // ms por slide
const N       = FEATURES.length;

function calcPerView(): number {
  if (typeof window === "undefined") return 3;
  return window.innerWidth >= 1024 ? 3 : window.innerWidth >= 640 ? 2 : 1;
}

export function LandingExperienceSection() {
  // Lista triple: [clon-final | reales | clon-inicio] → loop infinito
  const items = useMemo(
    () => [...FEATURES, ...FEATURES, ...FEATURES],
    [],
  );

  const [perView,  setPerView ] = useState(3);
  const [isPaused, setIsPaused] = useState(false);
  const [realIdx,  setRealIdx ] = useState(0); // 0..N-1 para dots

  const containerRef = useRef<HTMLDivElement>(null);
  const perViewRef   = useRef(3);            // ref para acceso síncrono
  const x            = useMotionValue(0);
  const idxRef       = useRef(N);            // empieza en N = primer item real
  const lockRef      = useRef(false);

  /* ── Step (lee de refs, siempre fresco) ──────────────── */
  const getStep = useCallback((): number => {
    if (!containerRef.current) return 380;
    return (containerRef.current.offsetWidth + GAP) / perViewRef.current;
  }, []);

  /* ── Responsive ───────────────────────────────────────── */
  useEffect(() => {
    const onResize = () => {
      const pv = calcPerView();
      perViewRef.current = pv;
      setPerView(pv);
    };
    onResize();
    window.addEventListener("resize", onResize, { passive: true });
    return () => window.removeEventListener("resize", onResize);
  }, []);

  /* ── Snap instantáneo cuando cambia perView ───────────── */
  useLayoutEffect(() => {
    x.set(-(idxRef.current * getStep()));
  }, [perView, getStep]);

  /* ── Mover con warp infinito (onComplete) ─────────────── */
  const moveTo = useCallback(
    (idx: number) => {
      if (lockRef.current) return;
      const s = getStep();
      lockRef.current = true;
      idxRef.current  = idx;
      setRealIdx(((idx - N) % N + N) % N);

      animate(x, -(idx * s), {
        duration : 0.48,
        ease     : [...EASE] as number[],
        onComplete: () => {
          lockRef.current = false;
          let warp = idx;
          if      (idx < N     ) warp = idx + N;
          else if (idx >= N * 2) warp = idx - N;
          if (warp !== idx) {
            x.set(-(warp * getStep()));
            idxRef.current = warp;
            setRealIdx(((warp - N) % N + N) % N);
          }
        },
      });
    },
    [getStep, x],
  );

  /* ── Auto-avance ──────────────────────────────────────── */
  useEffect(() => {
    if (isPaused) return;
    const id = setInterval(() => {
      if (!lockRef.current) moveTo(idxRef.current + 1);
    }, AUTO_MS);
    return () => clearInterval(id);
  }, [isPaused, moveTo]);

  /* ── Drag ─────────────────────────────────────────────── */
  const onDragStart = useCallback(() => {
    lockRef.current = false;
    setIsPaused(true);
  }, []);

  const onDragEnd = useCallback(
    (_: unknown, info: PanInfo) => {
      setIsPaused(false);
      const { offset, velocity } = info;
      if      (offset.x < -50 || velocity.x < -200) moveTo(idxRef.current + 1);
      else if (offset.x >  50 || velocity.x >  200) moveTo(idxRef.current - 1);
      else                                           moveTo(idxRef.current);
    },
    [moveTo],
  );

  return (
    <motion.div
      className="mt-12"
      variants={staggerContainer(0.08, 0.1)}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* ── Track ─────────────────────────────────────── */}
      <div
        ref={containerRef}
        className="relative overflow-hidden pt-3 pb-14 lg:-mx-16 xl:-mx-24"
        style={{
          maskImage:
            'linear-gradient(to right, transparent 0%, black 4%, black 96%, transparent 100%)',
          WebkitMaskImage:
            'linear-gradient(to right, transparent 0%, black 4%, black 96%, transparent 100%)',
        }}
      >
        <motion.div
          className="flex gap-6 cursor-grab active:cursor-grabbing select-none"
          style={{ x }}
          drag="x"
          dragConstraints={{ left: -(items.length * 800), right: 800 }}
          dragElastic={0.05}
          dragMomentum={false}
          onDragStart={onDragStart}
          onDragEnd={onDragEnd}
        >
          {items.map((feature, i) => (
            <div
              key={`${feature.title}-${i}`}
              className="flex-shrink-0 w-full h-[320px] sm:h-[370px] sm:w-[calc(50%-12px)] lg:h-[420px] lg:w-[calc(33.333%-16px)]"
            >
              <FeatureCard {...feature} index={i % N} />
            </div>
          ))}
        </motion.div>
      </div>

      {/* ── Controles ─────────────────────────────────── */}
      <div className="mt-4 flex items-center justify-center gap-4">
        <motion.button
          onClick={() => moveTo(idxRef.current - 1)}
          aria-label="Anterior"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          className="flex h-10 w-10 items-center justify-center rounded-full border border-accent/20 bg-surface-primary text-accent shadow-sm transition-colors hover:border-accent/40 hover:bg-accent/5"
        >
          <ChevronLeft className="h-5 w-5" />
        </motion.button>

        <div className="flex items-center gap-2">
          {Array.from({ length: N }).map((_, i) => (
            <button
              key={i}
              onClick={() => moveTo(N + i)}
              aria-label={`Diapositiva ${i + 1}`}
              className={[
                "h-2 rounded-full transition-all duration-300",
                i === realIdx
                  ? "w-7 bg-accent"
                  : "w-2 bg-accent/25 hover:bg-accent/50",
              ].join(" ")}
            />
          ))}
        </div>

        <motion.button
          onClick={() => moveTo(idxRef.current + 1)}
          aria-label="Siguiente"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          className="flex h-10 w-10 items-center justify-center rounded-full border border-accent/20 bg-surface-primary text-accent shadow-sm transition-colors hover:border-accent/40 hover:bg-accent/5"
        >
          <ChevronRight className="h-5 w-5" />
        </motion.button>
      </div>
    </motion.div>
  );
}