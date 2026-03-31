"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import AnimatedGraphBackground from "@/features/graph/components/AnimatedGraphBackground";
import { sectionReveal, scaleFade } from "@/features/landing/lib/motionVariants";
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
    logoMobileRef,
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
    <main className="relative min-h-screen overflow-x-hidden bg-white pt-[76px] text-content-primary">
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
              !isCenterMode ? "pr-[130px] sm:pr-[160px] lg:pr-0" : "",
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
                  variants={sectionReveal}
                  initial="hidden"
                  whileInView="show"
                  viewport={{ once: true, amount: 0.15 }}
                  className={[
                    "scroll-mt-28",
                    "min-h-[calc(100vh-76px)]",
                    "flex items-center py-14 will-change-transform",
                    isCenter ? "justify-center" : "",
                  ].join(" ")}
                >
                  <div
                    className={[
                      isCenter
                        ? "mx-auto w-full max-w-6xl text-center"
                        : "max-w-2xl",
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
                        variants={scaleFade}
                        className="mt-8"
                      >
                        <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}>
                          <Link
                            href={section.cta.href}
                            className="group inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-accent to-accent-hover px-5 py-2.5 text-sm font-semibold text-content-inverted shadow-lg shadow-accent/20 transition-all duration-300 sm:px-8 sm:py-4 sm:text-base hover:shadow-[0_20px_44px_-14px_rgba(153,51,49,0.52)]"
                          >
                            {section.cta.label}
                            <span className="inline-block transition-transform duration-300 group-hover:translate-x-1">&rarr;</span>
                          </Link>
                        </motion.div>
                      </motion.div>
                    )}

                    {section.id === "inicio" && (
                      <div className="mt-14 flex items-center gap-2 text-xs text-content-muted">
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
            logoMobileRef={logoMobileRef}
          />
        </div>
      </div>

      <LandingFooter />
    </main>
  );
}