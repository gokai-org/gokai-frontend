import { ReactNode } from "react";
import { motion } from "framer-motion";

interface SettingsItemProps {
  label: string;
  description?: string;
  children: ReactNode;
  icon?: ReactNode;
}

export function SettingsItem({ label, description, children, icon }: SettingsItemProps) {
  return (
    <motion.div
      whileHover={{ y: -1 }}
      transition={{ duration: 0.18 }}
      className="flex flex-col gap-3 rounded-xl border border-gray-100 bg-gradient-to-r from-white to-[#993331]/[0.02] p-4 sm:flex-row sm:items-start sm:justify-between sm:gap-4"
    >
      <div className="flex items-start gap-3 flex-1">
        {icon && <div className="mt-1 rounded-lg bg-[#993331]/10 p-1.5 text-[#993331]">{icon}</div>}
        <div className="flex-1">
          <label className="block text-sm font-semibold text-gray-900">
            {label}
          </label>
          {description && (
            <p className="mt-1 text-xs text-gray-500 leading-relaxed">
              {description}
            </p>
          )}
        </div>
      </div>
      <div className="flex items-center gap-2 sm:flex-shrink-0">
        {children}
      </div>
    </motion.div>
  );
}
