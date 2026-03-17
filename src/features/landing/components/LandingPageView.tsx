"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import AnimatedGraphBackground from "@/features/graph/components/AnimatedGraphBackground";
import { SECTIONS } from "@/features/landing/data/landingData";
import { useLandingPage } from "@/features/landing/hooks/useLandingPage";
import {
  LandingHeader,
  LandingLogoAside,
  LandingSectionTitle,
  LandingHowSection,
  LandingExperienceSection,
  LandingPlansSection,
  LandingContactSection,
  LandingFooter,
} from "@/features/landing";

export function LandingPageView() {
  const {
    logoWrapRef,
    howSectionRef,
    activeId,
    showLogo,
    howTab,
    setHowTab,
    how,
    isCenterMode,
    showGraph,
  } = useLandingPage();

  return (
    <main className="relative min-h-screen overflow-x-hidden bg-[#f6f4f3] pt-[76px] text-neutral-900">
      <div className="pointer-events-none fixed inset-0 z-0">
        <AnimatedGraphBackground
          className={[
            "transition-opacity duration-700",
            showGraph ? "opacity-60" : "opacity-0",
          ].join(" ")}
          mode="screen"
          variant="dimmed"
          edgeMargin={140}
          density={0.00006}
          maxDist={180}
          speed={0.2}
        />
      </div>

      <LandingHeader activeId={activeId} />

      <div className="relative z-10 mx-auto max-w-7xl px-4 md:px-6">
        <div
          className={[
            "grid grid-cols-1 gap-10 lg:gap-16",
            isCenterMode ? "lg:grid-cols-1" : "lg:grid-cols-2",
          ].join(" ")}
        >
          <div
            className={[
              "py-10",
              isCenterMode ? "lg:ml-0" : "lg:-ml-10 xl:-ml-16 2xl:-ml-24",
            ].join(" ")}
          >
            {SECTIONS.map((section) => {
              const isActive = activeId === section.id;
              const isCenter = (section.layout ?? "split") === "center";

              return (
                <motion.section
                  key={section.id}
                  id={section.id}
                  data-section
                  ref={section.id === "como-funciona" ? howSectionRef : undefined}
                  initial={{ opacity: 0, y: 36 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-100px" }}
                  transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
                  className={[
                    "scroll-mt-28",
                    "min-h-[calc(100vh-76px)]",
                    "flex items-center py-14",
                    isCenter ? "justify-center" : "",
                  ].join(" ")}
                >
                  <div
                    className={[
                      isCenter
                        ? "mx-auto w-full max-w-6xl text-center"
                        : "max-w-2xl",
                      "transition-all duration-500",
                      isActive
                        ? "translate-y-0 opacity-100"
                        : section.id === "contacto"
                          ? "translate-y-0 opacity-100"
                          : "translate-y-0 opacity-100 md:translate-y-2 md:opacity-75",
                    ].join(" ")}
                  >
                    <LandingSectionTitle
                      id={section.id}
                      titleA={section.titleA}
                      titleB={section.titleB}
                      desc={section.desc}
                      isCenter={isCenter}
                    />

                    {section.cta && !isCenter && (
                      <motion.div
                        className="mt-8"
                        initial={{ opacity: 0, scale: 0.96 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.15, duration: 0.35 }}
                      >
                        <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                          <Link
                            href={section.cta.href}
                            className="inline-flex rounded-full bg-gradient-to-r from-[#993331] to-[#7a2927] px-8 py-4 text-lg font-semibold text-white shadow-lg shadow-[#993331]/20 transition-all duration-300 hover:shadow-xl"
                          >
                            {section.cta.label}
                          </Link>
                        </motion.div>
                      </motion.div>
                    )}

                    {section.id === "inicio" && (
                      <div className="mt-14 flex items-center gap-2 text-xs text-neutral-400">
                        <span>Desliza para ver más</span>
                        <span className="translate-y-[1px]">↓</span>
                      </div>
                    )}

                    {section.id === "como-funciona" && (
                      <LandingHowSection
                        howTab={howTab}
                        setHowTab={setHowTab}
                        how={how}
                      />
                    )}

                    {section.id === "experiencia" && <LandingExperienceSection />}

                    {section.id === "planes" && <LandingPlansSection />}

                    {section.id === "contacto" && <LandingContactSection />}
                  </div>
                </motion.section>
              );
            })}
          </div>

          <LandingLogoAside
            showLogo={showLogo}
            isCenterMode={isCenterMode}
            logoWrapRef={logoWrapRef}
          />
        </div>
      </div>

      <LandingFooter />
    </main>
  );
}