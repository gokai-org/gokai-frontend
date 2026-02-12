"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import AnimatedGraphBackground from "@/features/graph/components/AnimatedGraphBackground";
import { saveUserInterests, UserInterest } from "@/shared/lib/api/user";

const INTEREST_SECTIONS = [
  {
    id: "entretenimiento",
    title: "Entretenimiento",
    description: "Tus pasiones y hobbies favoritos",
    interests: [
      { id: "anime-manga", kanji: "アニメ・マンガ", meaning: "Anime y Manga", color: "bg-[#A64949]" },
      { id: "videojuegos", kanji: "ビデオゲーム", meaning: "Videojuegos", color: "bg-[#C17B6F]" },
      { id: "hobbies", kanji: "趣味・娯楽", meaning: "Hobbies y Ocio", color: "bg-[#E8C468]" },
      { id: "musica-cine", kanji: "音楽・映画・テレビ", meaning: "Música, Cine y TV", color: "bg-[#2B2B2B]" },
    ],
  },
  {
    id: "vida-diaria",
    title: "Cotidianidad y Emociones",
    description: "Tu día a día y relaciones",
    interests: [
      { id: "vida-diaria", kanji: "日常生活", meaning: "Vida Diaria", color: "bg-[#FF9B71]" },
      { id: "familia", kanji: "家族・人間関係", meaning: "Familia y Relaciones", color: "bg-[#FFB6A3]" },
      { id: "sentimientos", kanji: "感情・状態", meaning: "Sentimientos y Estados", color: "bg-[#FFCDB8]" },
    ],
  },
  {
    id: "conocimiento",
    title: "Conocimiento",
    description: "Aprendizaje y educación",
    interests: [
      { id: "educacion", kanji: "教育", meaning: "Educación", color: "bg-[#5B9BD5]" },
      { id: "tecnologia", kanji: "技術", meaning: "Tecnología", color: "bg-[#70AD47]" },
      { id: "numeros", kanji: "数字・量", meaning: "Números y Cantidades", color: "bg-[#FFC000]" },
      { id: "fechas", kanji: "日付・時間", meaning: "Fechas y Horario", color: "bg-[#ED7D31]" },
    ],
  },
  {
    id: "salud-bienestar",
    title: "Salud y Bienestar",
    description: "Cuidado personal y naturaleza",
    interests: [
      { id: "medicina", kanji: "医療・健康", meaning: "Medicina y Salud", color: "bg-[#E74C3C]" },
      { id: "clima", kanji: "天気・自然", meaning: "Clima y Naturaleza", color: "bg-[#8FA882]" },
      { id: "deportes", kanji: "スポーツ", meaning: "Deportes", color: "bg-[#3498DB]" },
    ],
  },
  {
    id: "mundo-sociedad",
    title: "Mundo y Sociedad",
    description: "Viajes y cultura global",
    interests: [
      { id: "geografia", kanji: "地理・国", meaning: "Geografía y Países", color: "bg-[#27AE60]" },
      { id: "ciudad", kanji: "都市・場所", meaning: "Ciudad y Lugares", color: "bg-[#95A5A6]" },
      { id: "transporte", kanji: "交通手段", meaning: "Medios de Transporte", color: "bg-[#34495E]" },
      { id: "viajes", kanji: "旅行・観光", meaning: "Viajes y Turismo", color: "bg-[#16A085]" },
    ],
  },
  {
    id: "estilo-comunicacion",
    title: "Estilo y Comunicación",
    description: "Expresión y apariencia",
    interests: [
      { id: "moda", kanji: "服・ファッション", meaning: "Ropa y Moda", color: "bg-[#9B59B6]" },
      { id: "colores", kanji: "色・外見", meaning: "Colores y Apariencia", color: "bg-[#E91E63]" },
      { id: "medios", kanji: "メディア", meaning: "Medios de Comunicación", color: "bg-[#607D8B]" },
    ],
  },
];

const MAX_FREE_SELECTIONS = 6; // Una selección por cada categoría

export default function InterestsPage() {
  const router = useRouter();
  const [showIntro, setShowIntro] = useState(true);
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
  const [selectedInterests, setSelectedInterests] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const currentSection = INTEREST_SECTIONS[currentSectionIndex];
  const totalSections = INTEREST_SECTIONS.length;
  const progress = ((currentSectionIndex + 1) / totalSections) * 100;
  const selectedCount = Object.keys(selectedInterests).length;
  const currentSectionHasSelection = !!selectedInterests[currentSection.id];

  const handleInterestToggle = (interestId: string) => {
    setSelectedInterests((prev) => {
      const newSelections = { ...prev };
      
      if (newSelections[currentSection.id] === interestId) {
        delete newSelections[currentSection.id];
      } else {
        newSelections[currentSection.id] = interestId;
      }
      
      return newSelections;
    });
  };

  const handleNext = () => {
    if (currentSectionIndex < totalSections - 1) {
      setCurrentSectionIndex((prev) => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentSectionIndex > 0) {
      setCurrentSectionIndex((prev) => prev - 1);
    }
  };

  const handleFinish = async () => {
    if (selectedCount === 0) return;

    setLoading(true);
    
    try {
      // Convertir selectedInterests al formato esperado por el backend
      const interests: UserInterest[] = Object.entries(selectedInterests).map(([categoryId, interestId]) => ({
        categoryId,
        interestId,
      }));
      
      console.log("Guardando intereses seleccionados:", interests);

      // Usar la función API preparada para el backend
      await saveUserInterests(interests);
      
      console.log("Intereses guardados correctamente");
      router.push("/dashboard/graph");
    } catch (error) {
      console.error("Error guardando intereses:", error);
      // En caso de error, igual continuar (por UX)
      router.push("/dashboard/graph");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="relative min-h-screen bg-neutral-50 overflow-hidden">
      <AnimatedGraphBackground 
        variant="dimmed" 
        density={0.00006}
        maxDist={200}
        speed={0.18}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-white/20 via-white/10 to-white/30" />

      {/* Pantalla de introducción */}
      <AnimatePresence>
        {showIntro && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            onAnimationComplete={() => {
              setTimeout(() => setShowIntro(false), 3000);
            }}
            className="absolute inset-0 z-50 flex items-center justify-center backdrop-blur-sm bg-white/40"
          >
            <div className="max-w-5xl mx-auto px-6 text-center">
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.3, duration: 0.6, type: "spring" }}
              >
                <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-neutral-900 mb-6 leading-tight px-4">
                  Crearemos un camino de aprendizaje perfecto para ti
                </h1>
                <motion.p
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.8, duration: 0.5 }}
                  className="text-xl sm:text-2xl md:text-3xl text-neutral-700 font-medium px-4"
                >
                  Selecciona un interés en cada categoría
                </motion.p>
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 1.3, duration: 0.4 }}
                  className="mt-8 inline-block"
                >
                  <div className="w-16 h-16 border-4 border-[#993331] border-t-transparent rounded-full animate-spin" />
                </motion.div>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

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

        {/* Barra de progreso */}
        <div className="px-6 lg:px-16 xl:px-20 mb-6">
          <div className="max-w-[1600px] mx-auto">
            <div className="flex items-center gap-4 mb-3">
              <div className="flex-1 h-2 bg-neutral-200 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-[#993331] to-[#C17B6F]"
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.5, ease: "easeOut" }}
                />
              </div>
              <div className="text-sm font-semibold text-neutral-700 whitespace-nowrap">
                {currentSectionIndex + 1} / {totalSections}
              </div>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-neutral-600">
                Categoría: <span className="font-semibold text-neutral-900">{currentSection.title}</span>
              </span>
              <span className={`font-semibold ${currentSectionHasSelection ? 'text-green-600' : 'text-[#993331]'}`}>
                {currentSectionHasSelection ? '✓ Seleccionado' : 'Selecciona uno'}
              </span>
            </div>
          </div>
        </div>

        {/* Contenido principal */}
        <div className="flex-1 px-6 lg:px-16 xl:px-20 pb-8">
          <div className="max-w-[1600px] mx-auto">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentSection.id}
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                transition={{ duration: 0.4, ease: "easeInOut" }}
              >
                {/* Título de la sección */}
                <div className="text-left mb-6">
                  <motion.div
                    initial={{ y: -20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.4 }}
                  >
                    <h1 className="text-3xl md:text-4xl font-bold text-neutral-900 leading-tight">
                      {currentSection.title}
                    </h1>
                    <p className="text-lg text-neutral-600 mt-1">
                      {currentSection.description}
                    </p>
                  </motion.div>
                </div>

                {/* Grid de intereses de la sección actual */}
                <div className="flex flex-wrap justify-center gap-4 sm:gap-6 md:gap-8 lg:gap-10 mb-6 max-w-[90rem] mx-auto">
                  {currentSection.interests.map((interest, index) => {
                    const isSelected = selectedInterests[currentSection.id] === interest.id;

                    return (
                      <motion.div
                        key={interest.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.08, duration: 0.3 }}
                        className="flex flex-col items-center w-36 sm:w-48 md:w-56 lg:w-64 xl:w-72"
                      >
                        <button
                          onClick={() => handleInterestToggle(interest.id)}
                          className={`
                            relative rounded-lg sm:rounded-xl p-3 sm:p-4 w-full aspect-[3/4] transition-all duration-300
                            ${interest.color} text-white flex items-center justify-center
                            ${isSelected 
                              ? 'ring-2 sm:ring-4 ring-[#993331] scale-105 shadow-2xl' 
                              : 'hover:scale-105 hover:shadow-xl'
                            }
                          `}
                        >
                          <div className="text-center">
                            <div className="text-base sm:text-xl md:text-2xl lg:text-3xl font-bold leading-tight whitespace-pre-line">
                              {interest.kanji.split('・').join('\n·\n')}
                            </div>
                          </div>

                          {isSelected && (
                            <motion.div
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              className="absolute top-1.5 right-1.5 sm:top-2 sm:right-2 w-5 h-5 sm:w-6 sm:h-6 bg-white rounded-full flex items-center justify-center shadow-lg"
                            >
                              <svg className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-[#993331]" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                            </motion.div>
                          )}
                        </button>
                        
                        <p className="mt-3 sm:mt-4 md:mt-6 text-xs sm:text-sm md:text-base font-semibold text-neutral-800 text-center leading-tight">
                          {interest.meaning}
                        </p>
                      </motion.div>
                    );
                  })}
                </div>

                {/* Indicador de selecciones y controles de navegación */}
                <div className="flex flex-col gap-4 mt-6">
                  {/* Centro - Resumen de selecciones (arriba en móvil, centro en desktop) */}
                  <div className="text-center order-1 md:order-2">
                    {selectedCount > 0 && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="inline-block bg-white/80 backdrop-blur-sm px-5 py-2 rounded-full shadow-lg"
                      >
                        <p className="text-sm text-neutral-600">
                          <span className="font-bold text-[#993331] text-base">{selectedCount}</span>
                          {' '}de {MAX_FREE_SELECTIONS} categorías completadas
                        </p>
                      </motion.div>
                    )}
                  </div>

                  {/* Botones de navegación (izquierda y derecha en móvil) */}
                  <div className="flex items-center justify-between gap-4 order-2 md:order-1">
                    {/* Botón Anterior */}
                    <button
                      onClick={handlePrevious}
                      disabled={currentSectionIndex === 0}
                      className={`
                        px-4 sm:px-6 py-2.5 rounded-full text-sm sm:text-base font-semibold
                        transition-all duration-300
                        ${currentSectionIndex > 0
                          ? 'bg-neutral-200 text-neutral-700 hover:bg-neutral-300'
                          : 'bg-neutral-100 text-neutral-400 cursor-not-allowed'
                        }
                      `}
                    >
                      ← Anterior
                    </button>

                    {/* Botón Siguiente/Finalizar */}
                    {currentSectionIndex < totalSections - 1 ? (
                      <button
                        onClick={handleNext}
                        className="px-4 sm:px-6 py-2.5 rounded-full text-sm sm:text-base font-semibold bg-[#993331] text-white hover:bg-[#882d2d] shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                      >
                        Siguiente →
                      </button>
                    ) : (
                      <button
                        onClick={handleFinish}
                        disabled={selectedCount === 0 || loading}
                        className={`
                          px-6 sm:px-10 py-2.5 rounded-full text-sm sm:text-base font-semibold
                          transition-all duration-300
                          ${selectedCount > 0 && !loading
                            ? 'bg-[#993331] text-white hover:bg-[#882d2d] shadow-lg hover:shadow-xl scale-100 hover:scale-105'
                            : 'bg-neutral-200 text-neutral-400 cursor-not-allowed'
                          }
                        `}
                      >
                        {loading ? 'Guardando...' : 'Comenzar mi viaje'}
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>

            {/* Nota sobre suscripción */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="mt-4 text-center max-w-2xl mx-auto"
            >
              <div className="bg-white/60 backdrop-blur-sm px-5 py-3 rounded-xl shadow-md">
                <p className="text-xs leading-relaxed text-neutral-600">
                  Con la suscripción <span className="font-semibold">gratuita</span> puedes elegir{' '}
                  <span className="font-bold text-[#993331]">un interés por categoría</span>.
                  {' '}
                  <span className="text-[#993331] font-semibold cursor-pointer hover:underline">
                    Actualiza a Premium
                  </span>
                  {' '}
                  para acceder a todos los intereses y contenido exclusivo.
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </main>
  );
}
