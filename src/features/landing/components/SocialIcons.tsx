"use client";

import Link from "next/link";
import { Instagram, Linkedin, Mail } from "lucide-react";

export default function SocialIcons() {
  const items = [
    {
      label: "Instagram",
      href: "https://instagram.com",
      icon: <Instagram className="h-5 w-5" />,
    },
    {
      label: "LinkedIn",
      href: "https://linkedin.com",
      icon: <Linkedin className="h-5 w-5" />,
    },
    {
      label: "Correo",
      href: "mailto:contacto@gokai.app",
      icon: <Mail className="h-5 w-5" />,
    },
  ];

  return (
    <div className="flex flex-wrap gap-4">
      {items.map((item) => (
        <Link
          key={item.label}
          href={item.href}
          target={item.href.startsWith("http") ? "_blank" : undefined}
          rel={item.href.startsWith("http") ? "noreferrer" : undefined}
          className="inline-flex h-14 w-14 items-center justify-center rounded-2xl border border-black/5 bg-white text-neutral-700 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-[#993331]/15 hover:text-[#993331] hover:shadow-md"
          aria-label={item.label}
        >
          {item.icon}
        </Link>
      ))}
    </div>
  );
}