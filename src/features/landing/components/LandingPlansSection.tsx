"use client";

import { motion } from "framer-motion";
import { MembershipPicker } from "@/features/landing";

export function LandingPlansSection() {
  return (
    <motion.div
      className="mt-12"
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.45 }}
    >
      <MembershipPicker mode="link" />
    </motion.div>
  );
}