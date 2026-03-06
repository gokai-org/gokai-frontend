"use client";

import { useState } from "react";
import Link from "next/link";
import { 
  Settings, 
  Bell, 
  Palette, 
  Globe, 
  BookOpen, 
  Accessibility, 
  Lock, 
  User 
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

export function SettingsSidebar({ activeItem = "general", onItemChange }: SettingsSidebarProps) {
  const [selected, setSelected] = useState(activeItem);

  const handleItemClick = (itemId: string) => {
    setSelected(itemId);
    onItemChange?.(itemId);
  };

  return (
    <aside className="w-20 md:w-72 bg-white border-r border-gray-200 min-h-screen">
      <div className="px-2 md:pl-0 md:pr-4 py-6">
        <h2 className="hidden md:block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4 pl-3">
          Configuración
        </h2>
        <nav className="space-y-1">
          {menuItems.map((item) => {
            const IconComponent = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => handleItemClick(item.id)}
                className={`
                  w-full flex items-center justify-center md:justify-start gap-3 px-2 md:px-3 py-2 rounded-lg text-sm font-medium transition-colors
                  ${selected === item.id 
                    ? 'bg-[#993331]/10 text-[#993331] border border-[#993331]/20' 
                    : 'text-gray-700 hover:bg-gray-50'
                  }
                `}
                title={item.label}
              >
                <div className={`
                  flex items-center justify-center w-8 h-8 rounded-lg transition-all flex-shrink-0
                  ${selected === item.id 
                    ? 'bg-gradient-to-br from-[#993331] to-[#BA5149] text-white' 
                    : 'bg-gray-100 text-gray-600'
                  }
                `}>
                  <IconComponent className="w-4 h-4" />
                </div>
                <span className="hidden md:inline">{item.label}</span>
                {selected === item.id && (
                  <span className="hidden md:inline ml-auto w-1.5 h-1.5 bg-[#993331] rounded-full"></span>
                )}
              </button>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}
