"use client";

import { motion } from "framer-motion";
import { ContactCard } from "@/features/landing";
import { fadeUp } from "@/features/landing/lib/motionVariants";

export function LandingContactSection() {
  return (
    <motion.div className="mt-20 sm:mt-24 lg:mt-24" variants={fadeUp}>
      <ContactCard />
    </motion.div>
  );
}