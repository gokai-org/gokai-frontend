"use client";

import UserGraph from "@/features/graph/components/UserGraph";

export default function Page() {
  // Ejemplo: Mostrar el progreso del usuario
  // En producción, obtén estos datos de tu API o estado global
  const userId = "user123";
  const currentLevel = 1;
  const completedActivities = 6;

  return (
    <div className="fixed inset-0 w-screen h-screen overflow-hidden bg-white z-0">
      <UserGraph 
        userId={userId} 
        level={currentLevel} 
        completedActivities={completedActivities} 
      />
    </div>
  );
}