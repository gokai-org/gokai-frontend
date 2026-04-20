"use client";

import { useState } from "react";
import {
  Settings,
  Bell,
  Palette,
  BookOpen,
  Accessibility,
  Lock,
  User,
} from "lucide-react";

interface SettingsMenuItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  href?: string;
}

interface SettingsSidebarProps {
  activeItem?: string;
  onItemChange?: (itemId: string) => void;
}

const menuItems: SettingsMenuItem[] = [
  { id: "general", label: "General", icon: Settings },
  { id: "notifications", label: "Notificaciones", icon: Bell },
  { id: "appearance", label: "Apariencia", icon: Palette },
  { id: "learning", label: "Preferencias de Estudio", icon: BookOpen },
  { id: "accessibility", label: "Accesibilidad", icon: Accessibility },
  { id: "privacy", label: "Privacidad", icon: Lock },
  { id: "account", label: "Cuenta", icon: User },
];

export function SettingsSidebar({
  activeItem = "general",
  onItemChange,
}: SettingsSidebarProps) {
  const [selected, setSelected] = useState(activeItem);

  const handleItemClick = (itemId: string) => {
    setSelected(itemId);
    onItemChange?.(itemId);
  };

  return (
    <>
      {/* Mobile: horizontal scrollable tab strip */}
      <div
        data-help-target="settings-sidebar"
        className="sm:hidden w-full border-b border-border-default bg-surface-primary overflow-x-auto flex-shrink-0"
      >
        <nav className="flex gap-1 px-2 py-2 min-w-max">
          {menuItems.map((item) => {
            const IconComponent = item.icon;
            const isActive = selected === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleItemClick(item.id)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-colors flex-shrink-0 ${
                  isActive
                    ? "bg-accent-subtle text-accent border border-accent/20"
                    : "text-content-secondary hover:bg-surface-secondary"
                }`}
                title={item.label}
              >
                <IconComponent className="w-3.5 h-3.5 flex-shrink-0" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* sm+: vertical sidebar */}
      <aside data-help-target="settings-sidebar" className="hidden sm:block sm:w-20 md:w-72 bg-surface-primary border-r border-border-default self-stretch flex-shrink-0">
        <div className="px-2 md:pl-0 md:pr-4 py-6">
          <h2 className="hidden md:block text-xs font-semibold text-content-tertiary uppercase tracking-wider mb-4 pl-3">
            Configuración
          </h2>
          <nav className="space-y-1">
            {menuItems.map((item) => {
              const IconComponent = item.icon;
              const isActive = selected === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleItemClick(item.id)}
                  className={`w-full flex items-center justify-center md:justify-start gap-3 px-2 md:px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-accent-subtle text-accent border border-accent/20"
                      : "text-content-secondary hover:bg-surface-secondary"
                  }`}
                  title={item.label}
                >
                  <div
                    className={`flex items-center justify-center w-8 h-8 rounded-lg transition-all flex-shrink-0 ${
                      isActive
                        ? "bg-gradient-to-br from-accent to-accent-hover text-content-inverted"
                        : "bg-surface-tertiary text-content-secondary"
                    }`}
                  >
                    <IconComponent className="w-4 h-4" />
                  </div>
                  <span className="hidden md:inline">{item.label}</span>
                  {isActive && (
                    <span className="hidden md:inline ml-auto w-1.5 h-1.5 bg-accent rounded-full" />
                  )}
                </button>
              );
            })}
          </nav>
        </div>
      </aside>
    </>
  );
}
