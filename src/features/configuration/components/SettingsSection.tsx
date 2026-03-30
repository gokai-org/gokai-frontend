import { ReactNode } from "react";
import { motion } from "framer-motion";

interface SettingsSectionProps {
  title: string;
  description?: string;
  children: ReactNode;
}

export function SettingsSection({
  title,
  description,
  children,
}: SettingsSectionProps) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.28, ease: "easeOut" }}
      className="rounded-2xl border border-border-default bg-surface-elevated p-4 shadow-sm md:p-6"
    >
      <div className="mb-4 md:mb-5">
        <h3 className="text-base md:text-lg font-semibold text-content-primary">
          {title}
        </h3>
        {description && (
          <p className="mt-1 text-xs md:text-sm text-content-tertiary leading-relaxed">
            {description}
          </p>
        )}
      </div>
      <div className="space-y-3 md:space-y-4">{children}</div>
    </motion.section>
  );
}
