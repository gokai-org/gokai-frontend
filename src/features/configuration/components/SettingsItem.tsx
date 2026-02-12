import { ReactNode } from "react";

interface SettingsItemProps {
  label: string;
  description?: string;
  children: ReactNode;
  icon?: ReactNode;
}

export function SettingsItem({ label, description, children, icon }: SettingsItemProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 sm:gap-4">
      <div className="flex items-start gap-3 flex-1">
        {icon && <div className="mt-1">{icon}</div>}
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-900">
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
    </div>
  );
}
