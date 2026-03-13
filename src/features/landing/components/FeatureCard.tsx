"use client";

import Image from "next/image";
import { motion } from "framer-motion";

interface FeatureCardProps {
  title: string;
  desc: string;
  icon: string;
  index: number;
}

export default function FeatureCard({
  title,
  desc,
  icon,
  index,
}: FeatureCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ delay: index * 0.1, duration: 0.5, ease: "easeOut" }}
      whileHover={{ y: -8, transition: { duration: 0.2 } }}
      className="rounded-3xl bg-white/90 p-7 text-left shadow-[0_10px_30px_rgba(0,0,0,0.06)] ring-1 ring-black/5 backdrop-blur hover:shadow-[0_20px_40px_rgba(0,0,0,0.12)] transition-shadow"
    >
      <motion.div
        className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#993331]"
        whileHover={{ rotate: 360, scale: 1.1 }}
        transition={{ duration: 0.5 }}
      >
        <Image src={icon} alt="" width={30} height={30} />
      </motion.div>
      <h3 className="mt-5 text-2xl font-extrabold tracking-tight">{title}</h3>
      <p className="mt-3 text-base leading-relaxed text-neutral-700">{desc}</p>
    </motion.div>
  );
}
