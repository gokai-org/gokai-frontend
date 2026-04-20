"use client";

import UserGraph from "@/features/graph/explore/components/UserGraph";

export default function Page() {
  // Ejemplo: Mostrar el progreso del usuario
  // En producción, obtener estos datos de la API o estado global
  const userId = "user123";
  const currentLevel = 1;
  const completedActivities = 6;

  return (
    <div
      data-help-target="graph-canvas"
      className="absolute inset-0 h-full w-full overflow-hidden bg-surface-primary z-0"
    >
      <UserGraph
        userId={userId}
        level={currentLevel}
        completedActivities={completedActivities}
      />
    </div>
  );
}
