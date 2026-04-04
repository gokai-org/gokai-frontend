import { ReactNode } from "react";
import { motion } from "framer-motion";

interface SettingsItemProps {
  label: string;
  description?: string;
  children: ReactNode;
  icon?: ReactNode;
}

export function SettingsItem({
  label,
  description,
  children,
  icon,
}: SettingsItemProps) {
  return (
    <motion.div
      whileHover={{ y: -1 }}
      transition={{ duration: 0.18 }}
      className="flex flex-col gap-3 rounded-xl border border-border-subtle bg-surface-elevated p-4 sm:flex-row sm:items-center sm:justify-between sm:gap-4"
    >
      <div className="flex items-start gap-3 flex-1">
        {icon && (
          <div className="mt-1 rounded-lg bg-accent-subtle p-1.5 text-accent">
            {icon}
          </div>
        )}
        <div className="flex-1">
          <label className="block text-sm font-semibold text-content-primary">
            {label}
          </label>
          {description && (
            <p className="mt-1 text-xs text-content-tertiary leading-relaxed">
              {description}
            </p>
          )}
        </div>
      </div>
      <div className="w-full min-w-0 flex flex-col gap-2 sm:w-auto sm:flex-row sm:items-center sm:justify-end sm:flex-shrink-0">
        {children}
      </div>
    </motion.div>
  );
}
