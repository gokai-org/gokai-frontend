"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { SECTIONS } from "@/features/landing/data/landingData";
import { useLandingPage } from "@/features/landing/hooks/useLandingPage";
import { useLandingScrollTimeline } from "@/features/landing/hooks/useLandingScrollTimeline";
import { scaleFade } from "@/features/landing/lib/motionVariants";

import { LandingHeader } from "@/features/landing/components/LandingHeader";
import { LandingSceneShell } from "@/features/landing/components/LandingSceneShell";
import { LandingSectionFrame } from "@/features/landing/components/LandingSectionFrame";
import { LandingHeroSection } from "@/features/landing/components/LandingHeroSection";
import { LandingSectionTitle } from "@/features/landing/components/LandingSectionTitle";
import { LandingHowSection } from "@/features/landing/components/LandingHowSection";
import { LandingExperienceSection } from "@/features/landing/components/LandingExperienceSection";
import { LandingPlansSection } from "@/features/landing/components/LandingPlansSection";
import { LandingContactSection } from "@/features/landing/components/LandingContactSection";
import { LandingFooter } from "@/features/landing/components/LandingFooter";
import { LandingExperienceBackdrop } from "@/features/landing/components/LandingExperienceBackdrop";

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function FixedSplitRail({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid items-center gap-8 lg:grid-cols-12 lg:gap-12 xl:gap-16">
      <div className="max-w-3xl lg:col-span-5 lg:col-start-1 lg:pt-10 xl:pt-14">
        {children}
      </div>

      <div
        className="hidden lg:block lg:col-start-7 lg:col-span-6 lg:min-h-[360px] xl:min-h-[420px]"
        aria-hidden="true"
      />
    </div>
  );
}

function SkillBlock({ section }: { section: (typeof SECTIONS)[number] }) {
  return (
    <FixedSplitRail>
      <div className="space-y-7">
        <LandingSectionTitle
          id={section.id}
          titleA={section.titleA}
          titleB={section.titleB}
          desc={section.desc}
        />

        {section.cta && (
          <motion.div
            variants={scaleFade}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.98 }}
          >
            <Link
              href={section.cta.href}
              className="inline-flex items-center gap-2 rounded-full border border-border-default/70 bg-surface-primary/72 px-5 py-3 text-sm font-semibold text-content-primary shadow-[var(--shadow-md)] backdrop-blur-xl"
            >
              {section.cta.label}
              <span>→</span>
            </Link>
          </motion.div>
        )}
      </div>
    </FixedSplitRail>
  );
}

export function LandingPageView() {
  const {
    sectionIds,
    activeId: headerActiveId,
    howTab,
    setHowTab,
    how,
  } = useLandingPage();

  const timeline = useLandingScrollTimeline(sectionIds);
  const sceneActiveId = timeline.activeId;

  const howMetrics = timeline.sections["como-funciona"];
  const experienceMetrics = timeline.sections["experiencia"];
  const plansMetrics = timeline.sections["planes"];
  const viewportHeight = timeline.viewport.height || 1;

  const experienceSectionProgress = experienceMetrics
    ? clamp(
        -experienceMetrics.viewportOffset /
          Math.max(1, experienceMetrics.height - viewportHeight),
        0,
        1,
      )
    : 0;
  const plansExitProgress = plansMetrics
    ? clamp(
        (viewportHeight * 1.1 - plansMetrics.viewportOffset) /
          (viewportHeight * 0.85),
        0,
        1,
      )
    : 0;

  const isPortraitCompact =
    timeline.viewport.width > 0 &&
    timeline.viewport.width < 1024 &&
    timeline.viewport.height > timeline.viewport.width;

  const heroScrollMultiplier = timeline.viewport.isMobile
    ? 1.45
    : timeline.viewport.isTablet
      ? 1.62
      : 1.8;

  const skillScrollMultiplier = timeline.viewport.isMobile
    ? 1.22
    : timeline.viewport.isTablet
      ? 1.34
      : 1.5;

  const howScrollMultiplier = timeline.viewport.isMobile ? 1.52 : 1.7;

  const plansScrollMultiplier = isPortraitCompact
    ? 1
    : timeline.viewport.isTablet
      ? 1.76
      : 2.2;

  const contactScrollMultiplier = isPortraitCompact
    ? 1
    : timeline.viewport.isTablet
      ? 1.48
      : 1.8;

  // Fase 1 – arranca cuando "how" está al 76 % de su scroll (sale del viewport)
  // Llega hasta 0.45 para no cubrir el how completamente desde este lado.
  const fromHowSection = howMetrics
    ? ((): number => {
        const x = clamp((howMetrics.progress - 0.76) / 0.24, 0, 1);
        return x * x * (3 - 2 * x) * 0.45;
      })()
    : 0;

  // Fase 2 – completa el barrido conforme "experiencia" entra al viewport
  const fromExpSection = experienceMetrics
    ? clamp(
        (viewportHeight * 0.64 - experienceMetrics.viewportOffset) /
          (viewportHeight * 0.95),
        0,
        1,
      )
    : 0;

  const experienceTakeoverProgress = clamp(
    Math.max(fromHowSection, fromExpSection),
    0,
    1,
  );

  const heroSection = SECTIONS[0];

  const skillSections = SECTIONS.filter((section) =>
    ["caracteristicas", "leer", "pensar", "hablar", "escuchar"].includes(
      section.id,
    ),
  );

  const howSection = SECTIONS.find(
    (section) => section.id === "como-funciona",
  )!;
  const plansSection = SECTIONS.find((section) => section.id === "planes")!;
  const contactSection = SECTIONS.find((section) => section.id === "contacto")!;

  return (
    <main className="relative min-h-screen overflow-x-clip bg-surface-primary text-content-primary">
      <LandingSceneShell
        sectionIds={sectionIds}
        activeId={sceneActiveId}
        experienceProgress={experienceTakeoverProgress}
      />

      <LandingExperienceBackdrop
        activeId={sceneActiveId}
        experienceProgress={experienceTakeoverProgress}
        exitProgress={plansExitProgress}
      />

      <LandingHeader activeId={headerActiveId} />

      <div className="relative z-10 pb-10 pt-[88px]">
        <div className="mx-auto max-w-[1480px] px-4 sm:px-6 lg:px-10 xl:px-12">
          <LandingSectionFrame
            id={heroSection.id}
            className="pt-8 lg:pt-16"
            innerClassName="w-full"
            scrollMultiplier={heroScrollMultiplier}
          >
            <FixedSplitRail>
              <LandingHeroSection
                titleA={heroSection.titleA}
                titleB={heroSection.titleB}
                desc={heroSection.desc}
                cta={heroSection.cta}
              />
            </FixedSplitRail>
          </LandingSectionFrame>

          {skillSections.map((section) => (
            <LandingSectionFrame
              key={section.id}
              id={section.id}
              className=""
              innerClassName="w-full"
              scrollMultiplier={skillScrollMultiplier}
            >
              <SkillBlock section={section} />
            </LandingSectionFrame>
          ))}

          <LandingSectionFrame
            id={howSection.id}
            className=""
            innerClassName="mx-auto w-full max-w-7xl"
            scrollMultiplier={howScrollMultiplier}
          >
            <div className="text-center">
              <LandingSectionTitle
                id={howSection.id}
                titleA={howSection.titleA}
                titleB={howSection.titleB}
                desc={howSection.desc}
                isCenter
              />
            </div>

            <LandingHowSection
              howTab={howTab}
              setHowTab={setHowTab}
              how={how}
            />
          </LandingSectionFrame>

          {/* Sección experiencia fuera de LandingSectionFrame — el motion.div con y-transform
              de LandingSectionFrame rompería position:sticky en los descendientes.
              El id="experiencia" vive en el propio LandingExperienceSection. */}
          <LandingExperienceSection
            sectionProgress={experienceSectionProgress}
          />

          <LandingSectionFrame
            id={plansSection.id}
            className=""
            innerClassName="mx-auto w-full max-w-7xl pb-28 text-center sm:pb-32 lg:pb-36"
            scrollMultiplier={plansScrollMultiplier}
          >
            <LandingSectionTitle
              id={plansSection.id}
              titleA={plansSection.titleA}
              titleB={plansSection.titleB}
              desc={plansSection.desc}
              isCenter
            />
            <LandingPlansSection />
          </LandingSectionFrame>

          <LandingSectionFrame
            id={contactSection.id}
            className=""
            innerClassName="mx-auto w-full max-w-6xl pt-20 sm:pt-24 lg:pt-28"
            scrollMultiplier={contactScrollMultiplier}
          >
            <LandingSectionTitle
              id={contactSection.id}
              titleA={contactSection.titleA}
              titleB={contactSection.titleB}
              desc={contactSection.desc}
              isCenter
            />
            <LandingContactSection />
          </LandingSectionFrame>
        </div>

        <LandingFooter />
      </div>
    </main>
  );
}
