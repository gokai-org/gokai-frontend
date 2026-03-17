"use client";

import { motion } from "framer-motion";
import { ContactCard } from "@/features/landing";

export function LandingContactSection() {
  return (
    <motion.div
      className="mt-10"
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
    >
      <ContactCard />
    </motion.div>
  );
}