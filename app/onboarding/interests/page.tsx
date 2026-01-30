"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import AnimatedGraphBackground from "@/components/graph/AnimatedGraphBackground";

const INTERESTS = [
  {
    id: "1",
    kanji: "アニメ・マンガ",
    meaning: "Anime y Manga",
    color: "bg-[#A64949]",
  },
  {
    id: "2",
    kanji: "ビデオゲーム",
    meaning: "Videojuegos",
    color: "bg-[#C17B6F]",
  },
  {
    id: "3",
    kanji: "趣味・娯楽",
    meaning: "Hobbies y Ocio",
    color: "bg-[#E8C468]",
  },
  {
    id: "4",
    kanji: "音楽・映画・テレビ",
    meaning: "Música, Cine, TV",
    color: "bg-[#2B2B2B]",
  },
  {
    id: "5",
    kanji: "天気・自然",
    meaning: "Clima y Naturaleza",
    color: "bg-[#8FA882]",
  },
];

export default function InterestsPage() {
  const router = useRouter();
  const [selectedInterest, setSelectedInterest] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleContinue = async () => {
    if (!selectedInterest) return;

    setLoading(true);
    
    try {
      const selectedTheme = INTERESTS.find(i => i.id === selectedInterest);
      console.log("Guardando interés seleccionado:", {
        themeId: selectedInterest,
        themeName: selectedTheme?.meaning,
      });

      // Guardar la selección en el backend
      const response = await fetch("/api/user/preferences", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ themeId: selectedInterest }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: "Error desconocido" }));
        console.error("Error al guardar interés:", errorData);
        throw new Error("Error al guardar preferencias");
      }

      const data = await response.json();
      console.log("Interés guardado correctamente en el usuario:", data);

      // Redirigir al dashboard
      router.push("/dashboard/graph");
    } catch (error) {
      console.error("Error guardando interés:", error);
      router.push("/dashboard/graph");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="relative min-h-screen bg-neutral-50 overflow-hidden">
      {/* Fondo animado interactivo */}
      <AnimatedGraphBackground 
        variant="dimmed" 
        density={0.00006}
        maxDist={200}
        speed={0.18}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-white/20 via-white/10 to-white/30" />

      <div className="relative z-10 min-h-screen flex flex-col">
        {/* Header */}
        <header className="px-6 py-4">
          <div className="flex items-center gap-3">
            <Image
              src="/logos/gokai-logo.svg"
              alt="Gokai"
              width={48}
              height={48}
              priority
            />
            <span className="text-2xl font-bold text-neutral-900">GOKAI</span>
            <span className="text-sm text-neutral-500">語界</span>
          </div>
        </header>

        {/* Contenido principal */}
        <div className="flex-1 flex items-start px-6 lg:px-16 xl:px-20 py-2 lg:py-2">
          <div className="w-full max-w-[1600px] mx-auto">
            {/* Título */}
            <div className="text-left mb-4 lg:mb-6">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-neutral-900 mb-3 leading-tight">
                Crearemos un camino de<br />aprendizaje perfecto para ti.
              </h1>
              <p className="text-xl md:text-2xl text-neutral-600 font-medium">
                Selecciona tu área de interés principal
              </p>
            </div>

            {/* Grid de intereses */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8 md:gap-10 lg:gap-12 mb-6">
              {INTERESTS.map((interest) => (
                <div key={interest.id} className="flex flex-col items-center">
                  <button
                    onClick={() => setSelectedInterest(interest.id)}
                    className={`
                      relative rounded-2xl p-6 w-full aspect-[3/4] transition-all duration-300
                      ${interest.color} text-white flex items-center justify-center
                      ${selectedInterest === interest.id 
                        ? 'ring-4 ring-[#993331] scale-105 shadow-2xl' 
                        : 'hover:scale-105 hover:shadow-xl'
                      }
                    `}
                  >
                    {/* Texto en japonés */}
                    <div className="text-center">
                      <div className="text-2xl md:text-3xl font-bold leading-tight whitespace-pre-line">
                        {interest.kanji.split('・').join('\n·\n')}
                      </div>
                    </div>

                    {/* Indicador de selección */}
                    {selectedInterest === interest.id && (
                      <div className="absolute top-3 right-3 w-6 h-6 bg-white rounded-full flex items-center justify-center">
                        <svg className="w-4 h-4 text-[#993331]" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                    )}
                  </button>
                  
                  {/* Nombre en español debajo */}
                  <p className="mt-8 text-base font-semibold text-neutral-800 text-center">
                    {interest.meaning}
                  </p>
                </div>
              ))}
            </div>

            {/* Traducción del seleccionado */}
            {selectedInterest && (
              <div className="text-left mb-2">
                <p className="text-lg font-semibold text-neutral-700">
                  Has seleccionado: {INTERESTS.find(i => i.id === selectedInterest)?.meaning}
                </p>
              </div>
            )}

            {/* Botón de continuar y nota sobre suscripción */}
            <div className="flex flex-col items-center md:items-end justify-center md:justify-end gap-3 md:ml-auto md:max-w-md">
              <button
                onClick={handleContinue}
                disabled={!selectedInterest || loading}
                className={`
                  px-12 py-3.5 rounded-full text-lg font-semibold
                  transition-all duration-300
                  ${selectedInterest && !loading
                    ? 'bg-[#993331] text-white hover:bg-[#882d2d] shadow-lg hover:shadow-xl scale-100 hover:scale-105'
                    : 'bg-neutral-200 text-neutral-400 cursor-not-allowed'
                  }
                `}
              >
                {loading ? 'Guardando...' : 'Comenzar'}
              </button>

              {/* Nota sobre suscripción */}
              <div className="text-center md:text-right max-w-md px-4 md:px-0">
                <p className="text-sm leading-relaxed text-neutral-600">
                  Con la suscripción gratuita puedes elegir un área de interés.
                  {' '}
                  <span className="text-[#993331] font-semibold">Actualiza a Premium</span>
                  {' '}
                  para acceder a todas las áreas.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
