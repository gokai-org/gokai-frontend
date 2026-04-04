"use client";

import { BookOpen } from "lucide-react";
import { AdminDashboardShell } from "@/features/admin/shared/components/AdminDashboardShell";
import { AdminPageHeader } from "@/features/admin/shared/components/AdminPageHeader";

export function AdminLessonsPanel() {

  return (
    <AdminDashboardShell
      header={
        <AdminPageHeader
          icon={
            <BookOpen
              className="h-7 w-7 text-content-inverted"
              strokeWidth={2.5}
            />
          }
          title="Lessons"
          japaneseText="課程"
          subtitle="Administracion de contenido y estado de lecciones"
        />
      }
    >
      <div className="space-y-6 pb-8"></div>
    </AdminDashboardShell>
  );
}
