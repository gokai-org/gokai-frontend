"use client";

import { motion } from "framer-motion";
import { FEATURES } from "@/features/landing/data/landingData";
import { FeatureCard } from "@/features/landing";

export function LandingExperienceSection() {
  return (
    <motion.div
      className="mt-12"
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.45 }}
    >
      <div className="mx-auto grid max-w-6xl grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {FEATURES.map((feature, index) => (
          <FeatureCard key={feature.title} {...feature} index={index} />
        ))}
      </div>
    </motion.div>
  );
}