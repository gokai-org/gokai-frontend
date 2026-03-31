"use client";

import { motion } from "framer-motion";
import { MembershipPicker } from "@/features/landing";
import { staggerContainer, fadeUp } from "@/features/landing/lib/motionVariants";

export function LandingPlansSection() {
  return (
    <motion.div
      className="mt-12"
      variants={staggerContainer(0.1, 0.05)}
    >
      <motion.div variants={fadeUp}>
        <MembershipPicker mode="link" />
      </motion.div>
    </motion.div>
  );
}