"use client";

import { ReactNode } from "react";
import { SettingsItem } from "@/features/configuration/components/SettingsItem";
import { Toggle } from "@/shared/ui/Toggle";
import { Dropdown } from "@/shared/ui/Dropdown";

interface SettingsToggleItemProps {
  label: string;
  description?: string;
  enabled?: boolean;
  onChange?: (enabled: boolean) => void;
  disabled?: boolean;
  icon?: ReactNode;
}

interface SettingsSelectItemProps {
  label: string;
  description?: string;
  value: string;
  options: string[];
  onChange?: (value: string) => void;
  className?: string;
  icon?: ReactNode;
}

interface SettingsToggleSelectItemProps {
  label: string;
  description?: string;
  toggleEnabled?: boolean;
  onToggleChange?: (enabled: boolean) => void;
  toggleDisabled?: boolean;
  value: string;
  options: string[];
  onChange?: (value: string) => void;
  icon?: ReactNode;
}

export function SettingsToggleItem({
  label,
  description,
  enabled,
  onChange,
  disabled,
  icon,
}: SettingsToggleItemProps) {
  return (
    <SettingsItem label={label} description={description} icon={icon}>
      <div className="w-full flex items-center justify-start sm:w-auto sm:justify-end">
        <Toggle enabled={enabled} onChange={onChange} disabled={disabled} />
      </div>
    </SettingsItem>
  );
}

export function SettingsSelectItem({
  label,
  description,
  value,
  options,
  onChange,
  className,
  icon,
}: SettingsSelectItemProps) {
  return (
    <SettingsItem label={label} description={description} icon={icon}>
      <Dropdown
        value={value}
        options={options}
        onChange={onChange}
        className={className ?? "w-full sm:w-[220px]"}
      />
    </SettingsItem>
  );
}

export function SettingsToggleSelectItem({
  label,
  description,
  toggleEnabled,
  onToggleChange,
  toggleDisabled,
  value,
  options,
  onChange,
  icon,
}: SettingsToggleSelectItemProps) {
  return (
    <SettingsItem label={label} description={description} icon={icon}>
      <div className="flex flex-col sm:flex-row sm:items-center gap-2 w-full sm:w-auto">
        <div className="w-full flex items-center justify-start sm:w-auto sm:justify-end">
          <Toggle
            enabled={toggleEnabled}
            onChange={onToggleChange}
            disabled={toggleDisabled}
          />
        </div>
        <Dropdown
          value={value}
          options={options}
          onChange={onChange}
          className="w-full sm:w-[220px]"
        />
      </div>
    </SettingsItem>
  );
}
