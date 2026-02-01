import { ReactNode } from "react";

interface SettingsSectionProps {
  title: string;
  description?: string;
  children: ReactNode;
}

export function SettingsSection({ title, description, children }: SettingsSectionProps) {
  return (
    <div className="border-b border-gray-100 pb-4 md:pb-6 last:border-b-0">
      <div className="mb-3 md:mb-4">
        <h3 className="text-base md:text-lg font-semibold text-gray-900">{title}</h3>
        {description && (
          <p className="mt-1 text-xs md:text-sm text-gray-500">{description}</p>
        )}
      </div>
      <div className="space-y-3 md:space-y-4">
        {children}
      </div>
    </div>
  );
}
