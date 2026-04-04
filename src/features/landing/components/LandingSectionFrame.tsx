"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { staggerContainer } from "@/features/landing/lib/motionVariants";

interface LandingSectionFrameProps {
  id: string;
  className?: string;
  innerClassName?: string;
  children: React.ReactNode;
  scrollMultiplier?: number;
}

export function LandingSectionFrame({
  id,
  className,
  innerClassName,
  children,
  scrollMultiplier = 1.6,
}: LandingSectionFrameProps) {
  const ref = useRef<HTMLElement | null>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  const innerY = useTransform(scrollYProgress, [0, 0.5, 1], [32, 0, -16]);
  const innerOpacity = useTransform(
    scrollYProgress,
    [0, 0.15, 0.85, 1],
    [0, 1, 1, 0],
  );

  const useStickyScroll = scrollMultiplier > 1;

  return (
    <section
      ref={ref}
      id={id}
      data-section
      className={[
        "relative scroll-mt-28",
        useStickyScroll ? "py-0" : "py-10 sm:py-14 lg:py-20",
        className ?? "",
      ].join(" ")}
      style={
        useStickyScroll
          ? { height: `${scrollMultiplier * 100}svh` }
          : { minHeight: "92svh" }
      }
    >
      {useStickyScroll ? (
        <div className="sticky top-0 flex h-[100svh] items-center">
          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-60px" }}
            variants={staggerContainer(0.08, 0.05)}
            style={{ y: innerY, opacity: innerOpacity }}
            className={[
              "w-full py-10 sm:py-14 lg:py-20",
              innerClassName ?? "",
            ].join(" ")}
          >
            {children}
          </motion.div>
        </div>
      ) : (
        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-60px" }}
          variants={staggerContainer(0.08, 0.05)}
          style={{ y: innerY, opacity: innerOpacity }}
          className={innerClassName}
        >
          {children}
        </motion.div>
      )}
    </section>
  );
}
