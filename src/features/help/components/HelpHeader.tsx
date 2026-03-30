"use client";

import { HelpCircle } from "lucide-react";
import { DashboardHeader } from "@/features/dashboard";

export default function HelpHeader() {
  return (
    <DashboardHeader
      icon={<HelpCircle className="w-7 h-7 text-content-inverted" strokeWidth={2.5} />}
      title="Centro de Ayuda"
      subtitle="Todo lo que necesitas para dominar Gokai"
      japaneseText="助け"
    />
  );
}