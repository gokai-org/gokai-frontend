"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  HelpCircle,
  BookOpen,
  MessageCircle,
  Lightbulb,
  Rocket,
  Zap,
  ChevronDown,
  Search,
  ExternalLink,
  Mail,
  Star,
  Heart,
  Sparkles,
  GraduationCap,
  Target,
  BarChart3,
  Settings,
  Library,
  PenTool,
} from "lucide-react";
import { DashboardShell, DashboardHeader } from "@/features/dashboard";
import SupportContactForm from "@/features/support/components/SupportContactForm";
import { useGuideTour } from "@/features/help/components/GuideTourProvider";
import { getTourByIndex } from "@/features/help/components/tourData";

/* ── helpers ── */
const ease: [number, number, number, number] = [0.22, 1, 0.36, 1];

/* ── tipos ── */
interface FaqItem {
  question: string;
  answer: string;
}

interface GuideCard {
  icon: React.ReactNode;
  title: string;
  description: string;
  color: string;
  bgColor: string;
  tourIndex: number;
}

/* ── data ── */
const faqs: FaqItem[] = [
  {
    question: "¿Cómo empiezo a aprender japonés en Gokai?",
    answer:
      "Después de registrarte, completa el onboarding donde seleccionas tus intereses y nivel. Luego accede al Dashboard donde encontrarás lecciones, ejercicios y tu biblioteca de kanji personalizada. Te recomendamos comenzar con las lecciones básicas de hiragana y katakana.",
  },
  {
    question: "¿Qué es el sistema de repaso espaciado (SRS)?",
    answer:
      "El sistema de repaso espaciado es un método científico de memorización que programa las revisiones en intervalos óptimos. Gokai utiliza este sistema para que repases kanji y vocabulario justo antes de que los olvides, maximizando tu retención a largo plazo con el mínimo esfuerzo.",
  },
  {
    question: "¿Cómo funciona la biblioteca de kanji?",
    answer:
      "La biblioteca organiza todos los kanji por nivel de dificultad. Puedes explorar cada kanji con sus lecturas, significados, trazos y palabras de ejemplo. Marca tus favoritos y lleva un seguimiento de tu progreso individual.",
  },
  {
    question: "¿Puedo usar el chatbot para practicar conversación?",
    answer:
      "¡Sí! Nuestro chatbot con IA te permite practicar conversación en japonés en tiempo real. Puedes elegir diferentes escenarios, niveles de dificultad y recibir correcciones instantáneas con explicaciones detalladas.",
  },
  {
    question: "¿Cómo interpreto mis estadísticas de progreso?",
    answer:
      "En la sección de Estadísticas encontrarás métricas detalladas: racha de estudio, kanji aprendidos, precisión en revisiones y tiempo invertido. El gráfico de actividad muestra tu consistencia diaria y las tendencias te ayudan a identificar áreas de mejora.",
  },
  {
    question: "¿Qué planes de membresía hay disponibles?",
    answer:
      "Ofrecemos un plan gratuito con acceso limitado y planes premium que desbloquean todas las lecciones, el chatbot avanzado, estadísticas completas y contenido exclusivo. Visita la sección de Membresía para ver los detalles y precios actualizados.",
  },
  {
    question: "¿Cómo personalizo mi experiencia de aprendizaje?",
    answer:
      "Ve a Configuración donde puedes ajustar el idioma de la interfaz, las notificaciones, apariencia de la plataforma, preferencias de estudio, accesibilidad y privacidad. También puedes configurar metas diarias para mantener tu motivación.",
  },
  {
    question: "¿Mis datos están seguros?",
    answer:
      "Absolutamente. Utilizamos encriptación de extremo a extremo y cumplimos con las regulaciones de protección de datos. Tu progreso se guarda automáticamente en la nube y puedes exportar tus datos en cualquier momento desde la configuración de tu perfil.",
  },
];

const guides: GuideCard[] = [
  {
    icon: <GraduationCap className="w-6 h-6" />,
    title: "Primeros pasos",
    description:
      "Configura tu perfil, elige tu nivel y comienza tu primera lección de japonés.",
    color: "text-blue-600 dark:text-blue-400",
    bgColor: "bg-blue-50 dark:bg-blue-950/30",
    tourIndex: 0,
  },
  {
    icon: <Library className="w-6 h-6" />,
    title: "Explorar la biblioteca",
    description:
      "Descubre miles de kanji organizados por nivel de dificultad con ejemplos interactivos.",
    color: "text-purple-600 dark:text-purple-400",
    bgColor: "bg-purple-50 dark:bg-purple-950/30",
    tourIndex: 1,
  },
  {
    icon: <Target className="w-6 h-6" />,
    title: "Sistema de revisiones",
    description:
      "Aprende cómo funciona el SRS y cómo maximizar tu retención de vocabulario.",
    color: "text-emerald-600 dark:text-emerald-400",
    bgColor: "bg-emerald-50 dark:bg-emerald-950/30",
    tourIndex: 2,
  },
  {
    icon: <MessageCircle className="w-6 h-6" />,
    title: "Chatbot de conversación",
    description:
      "Practica japonés con IA: escenarios reales, correcciones y audio nativo.",
    color: "text-amber-600 dark:text-amber-400",
    bgColor: "bg-amber-50 dark:bg-amber-950/30",
    tourIndex: 3,
  },
  {
    icon: <BarChart3 className="w-6 h-6" />,
    title: "Estadísticas y progreso",
    description:
      "Interpreta tus métricas, identifica patrones y optimiza tu rutina de estudio.",
    color: "text-rose-600 dark:text-rose-400",
    bgColor: "bg-rose-50 dark:bg-rose-950/30",
    tourIndex: 4,
  },
  {
    icon: <Settings className="w-6 h-6" />,
    title: "Personalización",
    description:
      "Ajusta notificaciones, metas diarias, temas y preferencias de accesibilidad.",
    color: "text-indigo-600 dark:text-indigo-400",
    bgColor: "bg-indigo-50 dark:bg-indigo-950/30",
    tourIndex: 5,
  },
];

const tips = [
  {
    icon: <Zap className="w-5 h-5" />,
    title: "Estudia todos los días",
    description:
      "Aunque sean solo 10 minutos, la consistencia es la clave del éxito.",
  },
  {
    icon: <PenTool className="w-5 h-5" />,
    title: "Practica la escritura",
    description:
      "Trazar los kanji a mano refuerza la memoria muscular y visual.",
  },
  {
    icon: <Star className="w-5 h-5" />,
    title: "No te saltes las revisiones",
    description:
      "El SRS funciona mejor cuando completas tus revisiones a tiempo.",
  },
  {
    icon: <Heart className="w-5 h-5" />,
    title: "Disfruta el proceso",
    description:
      "Conecta con contenido que te guste: anime, manga, música o cultura.",
  },
];

/* ── componente FAQ Accordion ── */
function FaqAccordion({ item, index }: { item: FaqItem; index: number }) {
  const [open, setOpen] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease, delay: index * 0.05 }}
    >
      <button onClick={() => setOpen(!open)} className="w-full text-left group">
        <div
          className={`flex items-start gap-4 p-5 rounded-2xl transition-all duration-300 ${
            open
              ? "bg-accent/5 border border-accent/15"
              : "bg-surface-secondary/80 border border-transparent hover:bg-surface-tertiary/80 hover:border-border-default"
          }`}
        >
          <div
            className={`mt-0.5 w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors duration-300 ${
              open
                ? "bg-accent text-content-inverted"
                : "bg-surface-tertiary/80 text-content-tertiary group-hover:bg-accent/10 group-hover:text-accent"
            }`}
          >
            <HelpCircle className="w-4 h-4" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-3">
              <h3
                className={`font-bold text-sm transition-colors duration-300 ${
                  open ? "text-accent" : "text-content-primary"
                }`}
              >
                {item.question}
              </h3>
              <motion.div
                animate={{ rotate: open ? 180 : 0 }}
                transition={{ duration: 0.3, ease }}
              >
                <ChevronDown
                  className={`w-5 h-5 flex-shrink-0 transition-colors duration-300 ${
                    open ? "text-accent" : "text-content-muted"
                  }`}
                />
              </motion.div>
            </div>
            <AnimatePresence initial={false}>
              {open && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.35, ease }}
                >
                  <p className="text-sm text-content-secondary leading-relaxed mt-3 pr-8">
                    {item.answer}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </button>
    </motion.div>
  );
}

/* ── componente principal ── */
export default function HelpPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"guides" | "faq" | "tips">(
    "guides",
  );
  const [supportOpen, setSupportOpen] = useState(false);
  const { startTour } = useGuideTour();

  const handleStartGuide = (tourIndex: number) => {
    const tour = getTourByIndex(tourIndex);
    if (tour) startTour(tour);
  };

  const filteredFaqs = faqs.filter(
    (faq) =>
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const tabs = [
    {
      key: "guides" as const,
      label: "Guías",
      icon: <BookOpen className="w-4 h-4" />,
    },
    {
      key: "faq" as const,
      label: "Preguntas frecuentes",
      icon: <HelpCircle className="w-4 h-4" />,
    },
    {
      key: "tips" as const,
      label: "Consejos",
      icon: <Lightbulb className="w-4 h-4" />,
    },
  ];

  return (
    <DashboardShell
      header={
        <DashboardHeader
          icon={
            <HelpCircle
              className="w-7 h-7 text-content-inverted"
              strokeWidth={2.5}
            />
          }
          title="Centro de Ayuda"
          subtitle="Todo lo que necesitas para dominar Gokai"
          japaneseText="助け"
        />
      }
    >
      <div className="space-y-8 pb-12">
        {/* ── Hero Banner ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease }}
          className="relative overflow-hidden bg-gradient-to-r from-accent to-accent-hover rounded-3xl p-8 md:p-10 text-content-inverted shadow-lg"
        >
          {/* decorativas */}
          <div className="absolute top-[-40px] right-[-20px] w-44 h-44 bg-surface-primary/5 rounded-full" />
          <div className="absolute bottom-[-30px] left-[30%] w-32 h-32 bg-surface-primary/5 rounded-full" />
          <div className="absolute top-[50%] right-[20%] w-20 h-20 bg-surface-primary/5 rounded-full" />

          <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 rounded-2xl bg-surface-primary/15 flex items-center justify-center backdrop-blur-sm">
                  <Sparkles className="w-6 h-6 text-content-inverted" />
                </div>
                <div>
                  <h2 className="text-2xl font-extrabold tracking-tight">
                    ¿En qué podemos ayudarte?
                  </h2>
                  <p className="text-white/70 text-sm mt-0.5">
                    Encuentra respuestas, guías y consejos para tu aprendizaje
                  </p>
                </div>
              </div>

              {/* Buscador */}
              <div className="mt-5 relative max-w-lg">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/50" />
                <input
                  type="text"
                  placeholder="Buscar en el centro de ayuda..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    if (e.target.value.length > 0) setActiveTab("faq");
                  }}
                  className="w-full pl-12 pr-5 py-3.5 bg-surface-primary/10 backdrop-blur-sm rounded-2xl text-sm text-content-inverted placeholder-white/50 outline-none border border-white/15 focus:border-white/30 focus:bg-surface-primary/15 transition-all duration-300"
                />
              </div>
            </div>

            {/* Stats rápidas */}
            <div className="flex gap-4 md:gap-6">
              <div className="text-center">
                <div className="text-3xl font-extrabold">8</div>
                <div className="text-xs text-white/60 font-medium mt-0.5">
                  Guías
                </div>
              </div>
              <div className="w-px bg-surface-primary/20" />
              <div className="text-center">
                <div className="text-3xl font-extrabold">{faqs.length}</div>
                <div className="text-xs text-white/60 font-medium mt-0.5">
                  FAQs
                </div>
              </div>
              <div className="w-px bg-surface-primary/20" />
              <div className="text-center">
                <div className="text-3xl font-extrabold">24/7</div>
                <div className="text-xs text-white/60 font-medium mt-0.5">
                  Soporte
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* ── Tabs ── */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease, delay: 0.1 }}
          className="flex items-center gap-2 bg-surface-tertiary rounded-full p-1.5 w-fit"
        >
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`relative flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-bold transition-all duration-300 ${
                activeTab === tab.key
                  ? "bg-surface-primary text-accent shadow-sm"
                  : "text-content-tertiary hover:text-content-secondary"
              }`}
            >
              {tab.icon}
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          ))}
        </motion.div>

        {/* ── Contenido de Guías ── */}
        <AnimatePresence mode="wait">
          {activeTab === "guides" && (
            <motion.div
              key="guides"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.4, ease }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5"
            >
              {guides.map((guide, i) => (
                <motion.div
                  key={guide.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, ease, delay: i * 0.08 }}
                  whileHover={{
                    y: -4,
                    boxShadow: "0 12px 24px -4px rgba(153,51,49,0.12)",
                  }}
                  onClick={() => handleStartGuide(guide.tourIndex)}
                  className="group bg-surface-primary rounded-2xl p-6 border border-border-subtle shadow-sm cursor-pointer transition-colors duration-300 hover:border-accent/20"
                >
                  <div className="flex items-start gap-4">
                    <div
                      className={`w-12 h-12 rounded-2xl ${guide.bgColor} ${guide.color} flex items-center justify-center flex-shrink-0 transition-transform duration-300 group-hover:scale-110`}
                    >
                      {guide.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-content-primary text-sm mb-1.5 group-hover:text-accent transition-colors duration-300">
                        {guide.title}
                      </h3>
                      <p className="text-xs text-content-tertiary leading-relaxed">
                        {guide.description}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 mt-4 text-xs font-bold text-accent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <span>Ver más</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}

          {/* ── Contenido de FAQ ── */}
          {activeTab === "faq" && (
            <motion.div
              key="faq"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.4, ease }}
              className="space-y-3"
            >
              {filteredFaqs.length > 0 ? (
                filteredFaqs.map((faq, i) => (
                  <FaqAccordion key={i} item={faq} index={i} />
                ))
              ) : (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center py-16"
                >
                  <div className="w-16 h-16 rounded-full bg-surface-tertiary flex items-center justify-center mx-auto mb-4">
                    <Search className="w-7 h-7 text-content-muted" />
                  </div>
                  <h3 className="font-bold text-content-primary mb-1">
                    No se encontraron resultados
                  </h3>
                  <p className="text-sm text-content-tertiary">
                    Intenta con otros términos de búsqueda
                  </p>
                </motion.div>
              )}
            </motion.div>
          )}

          {/* ── Contenido de Tips ── */}
          {activeTab === "tips" && (
            <motion.div
              key="tips"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.4, ease }}
              className="space-y-6"
            >
              {/* Tips Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {tips.map((tip, i) => (
                  <motion.div
                    key={tip.title}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, ease, delay: i * 0.08 }}
                    whileHover={{ y: -2 }}
                    className="flex items-start gap-4 bg-surface-primary rounded-2xl p-6 border border-border-subtle shadow-sm"
                  >
                    <div className="w-11 h-11 rounded-xl bg-accent/10 text-accent flex items-center justify-center flex-shrink-0">
                      {tip.icon}
                    </div>
                    <div>
                      <h3 className="font-bold text-content-primary text-sm mb-1">
                        {tip.title}
                      </h3>
                      <p className="text-xs text-content-tertiary leading-relaxed">
                        {tip.description}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Consejo destacado */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease, delay: 0.35 }}
                className="relative overflow-hidden bg-gradient-to-br from-amber-50 to-orange-50 rounded-3xl p-8 border border-amber-100"
              >
                <div className="absolute top-[-20px] right-[-10px] w-28 h-28 bg-amber-200/20 rounded-full" />
                <div className="absolute bottom-[-15px] left-[40%] w-20 h-20 bg-orange-200/20 rounded-full" />

                <div className="relative z-10 flex items-start gap-5">
                  <div className="w-14 h-14 rounded-2xl bg-amber-500/15 flex items-center justify-center flex-shrink-0">
                    <Rocket className="w-7 h-7 text-amber-600" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-content-primary mb-2">
                      Consejo del día
                    </h3>
                    <p className="text-sm text-content-secondary leading-relaxed mb-4">
                      La mejor forma de aprender kanji es en contexto. En lugar
                      de memorizar caracteres aislados, intenta leer frases
                      completas y asociar cada kanji con situaciones reales. Tu
                      cerebro recordará mejor las historias que los datos
                      sueltos. ¡Usa el chatbot para practicar en contexto!
                    </p>
                    <div className="flex items-center gap-2 text-xs font-bold text-amber-600">
                      <Lightbulb className="w-4 h-4" />
                      <span>
                        Basado en investigación de aprendizaje cognitivo
                      </span>
                    </div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Contact CTA ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease, delay: 0.4 }}
          className="bg-surface-primary rounded-3xl p-8 border border-border-subtle shadow-sm"
        >
          <div className="flex flex-col md:flex-row items-center gap-6 md:gap-8">
            <div className="w-16 h-16 rounded-2xl bg-accent/10 flex items-center justify-center flex-shrink-0">
              <MessageCircle className="w-8 h-8 text-accent" />
            </div>
            <div className="flex-1 text-center md:text-left">
              <h3 className="font-extrabold text-content-primary text-lg mb-1">
                ¿No encontraste lo que buscabas?
              </h3>
              <p className="text-sm text-content-tertiary leading-relaxed">
                Nuestro equipo de soporte está aquí para ayudarte. Escríbenos y
                te responderemos lo antes posible.
              </p>
            </div>
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => setSupportOpen(true)}
              className="bg-gradient-to-r from-accent to-accent-hover text-content-inverted px-8 py-3.5 rounded-full font-bold text-sm shadow-lg shadow-accent/20 hover:shadow-xl hover:shadow-accent/25 transition-shadow duration-300 flex items-center gap-2 flex-shrih-0"
            >
              <Mail className="w-4 h-4" />
              Contactar soporte
            </motion.button>
          </div>
        </motion.div>

        {/* ── Support Contact Form (modal) ── */}
        <SupportContactForm
          open={supportOpen}
          onClose={() => setSupportOpen(false)}
        />
      </div>
    </DashboardShell>
  );
}
