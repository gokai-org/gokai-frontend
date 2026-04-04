export function getStatsBannerMessage(
  accuracy: number,
  streak: number,
  hasData: boolean,
) {
  if (!hasData)
    return {
      title: "¡Bienvenido a tus estadísticas!",
      subtitle: "Aquí verás tu progreso a medida que estudies.",
    };

  if (streak >= 7 && accuracy >= 80)
    return {
      title: "¡Racha imparable!",
      subtitle: "Tu consistencia y precisión son admirables.",
    };

  if (accuracy >= 90)
    return {
      title: "¡Excelente precisión!",
      subtitle: "Tu dominio del japonés está en otro nivel.",
    };

  if (accuracy >= 70)
    return {
      title: "¡Buen progreso!",
      subtitle: "Sigue así, vas por buen camino.",
    };

  if (streak >= 3)
    return {
      title: "¡Buena racha!",
      subtitle: "La constancia es la clave del éxito.",
    };

  if (accuracy > 0)
    return {
      title: "¡Sigue practicando!",
      subtitle: "Cada sesión te acerca más a la fluidez.",
    };

  return {
    title: "¡Tu aventura comienza aquí!",
    subtitle: "Completa tu primera lección para ver tus estadísticas.",
  };
}
