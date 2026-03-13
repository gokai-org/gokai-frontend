"use client";

import { motion } from "framer-motion";

interface PlanCardProps {
  variant: "free" | "plus";
  title: string;
  subtitle: string;
  price: string;
  period: string;
  buttonText: string;
  bullets: string[];
  index: number;
}

export default function PlanCard({
  variant,
  title,
  subtitle,
  price,
  period,
  buttonText,
  bullets,
  index,
}: PlanCardProps) {
  const headerBg = "bg-[#b34a45]";

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ delay: index * 0.15, duration: 0.6, ease: "easeOut" }}
      whileHover={{ y: -12, scale: 1.02, transition: { duration: 0.3 } }}
      className="relative overflow-hidden rounded-[28px] bg-white ring-1 ring-black/10 shadow-[0_18px_55px_rgba(0,0,0,0.18)] hover:shadow-[0_25px_70px_rgba(0,0,0,0.25)] transition-shadow"
    >
      <div className="pointer-events-none absolute inset-0 -z-10" />
      <div className="pointer-events-none absolute -left-8 top-1/2 -z-10 h-16 w-16 -translate-y-1/2 rounded-full bg-white ring-1 ring-black/10" />
      <div className="pointer-events-none absolute -right-8 top-1/2 -z-10 h-16 w-16 -translate-y-1/2 rounded-full bg-white ring-1 ring-black/10" />

      <div className={[headerBg, "px-8 pt-7 pb-6"].join(" ")}>
        <h3 className="text-3xl font-extrabold tracking-wide text-white">
          {title}
        </h3>
        <p className="mt-2 text-sm md:text-base text-white/90">{subtitle}</p>
      </div>

      <div className="bg-white px-8 pb-8 pt-7">
        <div className="rounded-2xl bg-white ring-1 ring-black/10 shadow-sm p-5">
          <div className="flex items-end gap-3">
            <span className="text-neutral-300 text-2xl font-extrabold">$</span>
            <div className="flex items-baseline gap-3">
              <span className="text-5xl font-extrabold tracking-tight text-neutral-900">
                {price.replace("$", "").trim()}
              </span>
              <span className="text-xs md:text-sm text-neutral-400">
                {period}
              </span>
            </div>
          </div>

          <motion.button
            type="button"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            className="mt-4 w-full rounded-xl bg-[#993331] py-3 text-base font-extrabold text-white shadow-sm hover:bg-[#882d2d] transition-colors"
          >
            {buttonText}
          </motion.button>
        </div>

        <ul className="mt-6 space-y-3 text-left">
          {bullets.map((b, idx) => (
            <motion.li
              key={b}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 + idx * 0.1, duration: 0.4 }}
              className="flex items-start gap-3 text-sm md:text-base text-neutral-800"
            >
              <motion.span
                initial={{ scale: 0 }}
                whileInView={{ scale: 1 }}
                viewport={{ once: true }}
                transition={{
                  delay: 0.4 + idx * 0.1,
                  type: "spring",
                  stiffness: 200,
                }}
                className="mt-[2px] inline-flex h-6 w-6 items-center justify-center rounded-full bg-white ring-1 ring-black/10"
              >
                <span className="text-[#993331] font-black">✓</span>
              </motion.span>
              <span>{b}</span>
            </motion.li>
          ))}
        </ul>
      </div>
    </motion.div>
  );
}
