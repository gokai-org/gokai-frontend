"use client";

import { motion } from "framer-motion";
import {
  fadeUp,
  fadeUpSoft,
  staggerContainer,
} from "@/features/landing/lib/motionVariants";

interface LandingSectionTitleProps {
  id: string;
  titleA?: string;
  titleB?: string;
  desc?: string;
  isCenter?: boolean;
}

export function LandingSectionTitle({
  id,
  titleA,
  titleB,
  desc,
  isCenter = false,
}: LandingSectionTitleProps) {
  if (id === "experiencia") {
    return (
      <motion.div className="text-center" variants={staggerContainer(0.1)}>
        <motion.p
          variants={fadeUpSoft}
          className="text-2xl font-extrabold text-accent md:text-4xl"
        >
          Más que una app de idiomas
        </motion.p>
        <motion.h2
          variants={fadeUp}
          className="mt-2 text-4xl font-extrabold tracking-tight md:text-6xl lg:text-7xl"
        >
          Una experiencia inteligente
        </motion.h2>
      </motion.div>
    );
  }

  if (id === "planes") {
    return (
      <motion.div className="text-center" variants={staggerContainer(0.1)}>
        <motion.p
          variants={fadeUpSoft}
          className="text-3xl font-extrabold text-accent md:text-5xl"
        >
          Empieza gratis
        </motion.p>
        <motion.h2
          variants={fadeUp}
          className="mt-2 text-4xl font-extrabold tracking-tight md:text-6xl lg:text-7xl"
        >
          Desbloquea todo con <span className="text-accent">GOKAI+</span>
        </motion.h2>
      </motion.div>
    );
  }

  if (id === "contacto") {
    return (
      <motion.div className="text-center" variants={staggerContainer(0.1)}>
        <motion.h2
          variants={fadeUp}
          className="text-4xl font-extrabold tracking-tight md:text-6xl lg:text-7xl"
        >
          <span className="block text-accent">{titleA}</span>
          <span className="block">{titleB}</span>
        </motion.h2>
        <motion.p
          variants={fadeUpSoft}
          className="mx-auto mt-4 max-w-3xl text-base leading-relaxed text-content-secondary md:text-xl"
        >
          {desc}
        </motion.p>
      </motion.div>
    );
  }

  return (
    <motion.div variants={staggerContainer(0.1)}>
      <motion.h2
        variants={fadeUp}
        className={[
          "font-extrabold leading-[1.02] tracking-tight",
          isCenter
            ? id === "como-funciona"
              ? "text-4xl md:text-6xl lg:text-7xl"
              : "text-5xl md:text-7xl lg:text-8xl"
            : "text-3xl sm:text-5xl md:text-7xl",
        ].join(" ")}
      >
        <span className={isCenter ? "block lg:inline" : "block"}>{titleA}</span>
        <span
          className={
            isCenter
              ? "block text-accent lg:ml-3 lg:inline"
              : "block text-accent"
          }
        >
          {titleB}
        </span>
      </motion.h2>

      <motion.p
        variants={fadeUpSoft}
        className={[
          "leading-relaxed text-content-secondary",
          isCenter
            ? "mx-auto mt-3 max-w-3xl text-base md:text-xl"
            : "mt-3 text-sm sm:text-base md:text-2xl",
        ].join(" ")}
      >
        {desc}
      </motion.p>
    </motion.div>
  );
}
