const LOCKED_HISTORY_ITEMS = [
  {
    title: "Conversación de viaje",
    time: "08 may · 10:32",
    active: true,
  },
  {
    title: "Practica de restaurante",
    time: "07 may · 18:10",
    active: false,
  },
  {
    title: "Vocabulario de oficina",
    time: "06 may · 09:45",
    active: false,
  },
];

const LOCKED_RECOMMENDATIONS = [
  {
    label: "Tema",
    title: "Repasar expresiones cotidianas y saludos comunes.",
    action: "Ir al mapa",
  },
  {
    label: "Gramatica",
    title: "Practicar estructuras para pedir direcciones con confianza.",
    action: "Ir al tablero",
  },
];

function LockedHistorySection({ mobile = false }: { mobile?: boolean }) {
  return (
    <section className="flex h-full min-h-0 flex-col overflow-hidden rounded-[30px] border border-[#BA5149]/14 bg-[linear-gradient(180deg,rgba(255,255,255,0.94),rgba(255,248,246,0.92))] shadow-[0_16px_48px_rgba(153,51,49,0.08)] dark:border-[#BA5149]/12 dark:bg-[linear-gradient(180deg,rgba(33,14,18,0.94),rgba(23,10,14,0.92))]">
      <div className="shrink-0 border-b border-[#BA5149]/12 px-4 py-4 sm:px-5">
        <div className="h-11 rounded-2xl bg-gradient-to-r from-[#BA5149] via-[#A83F3A] to-[#8A2F2A] shadow-[0_12px_30px_rgba(153,51,49,0.16)]" />
      </div>

      <div className={`min-h-0 flex-1 space-y-3 px-3 py-3 sm:px-4 ${mobile ? "" : ""}`}>
        {LOCKED_HISTORY_ITEMS.map((item) => (
          <div
            key={item.title}
            className={[
              "rounded-[24px] border px-4 py-4",
              item.active
                ? "border-[#BA5149]/24 bg-[#BA5149]/7"
                : "border-[#BA5149]/10 bg-white/72 dark:bg-white/4",
            ].join(" ")}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <div className="h-4 w-36 rounded-full bg-[#BA5149]/72 dark:bg-[#BA5149]/58" />
                  {item.active ? (
                    <div className="h-6 w-16 rounded-full bg-[#BA5149]/12" />
                  ) : null}
                </div>
                <div className="mt-2 h-3 w-28 rounded-full bg-[#DFC0BA]/86 dark:bg-[#744441]/62" />
              </div>
            </div>

            <div className="mt-3 flex justify-end gap-2">
              <div className="h-8 w-20 rounded-full border border-[#BA5149]/14 bg-white/80 dark:bg-white/6" />
              <div className="h-8 w-16 rounded-full border border-[#E8A19A]/36 bg-[#FFF0EE] dark:bg-[#3B171C]" />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function LockedRecommendationsSection({ mobile = false }: { mobile?: boolean }) {
  return (
    <section className="flex h-full min-h-0 flex-col overflow-hidden rounded-[30px] border border-[#BA5149]/14 bg-[linear-gradient(180deg,rgba(255,255,255,0.94),rgba(255,248,246,0.92))] shadow-[0_16px_48px_rgba(153,51,49,0.08)] dark:border-[#BA5149]/12 dark:bg-[linear-gradient(180deg,rgba(33,14,18,0.94),rgba(23,10,14,0.92))]">
      <div className={`shrink-0 border-b border-[#BA5149]/12 ${mobile ? "px-3 py-3 sm:px-5 sm:py-4" : "px-4 py-4 sm:px-5"}`}>
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="h-5 w-44 rounded-full bg-[#BA5149]/72 dark:bg-[#BA5149]/58" />
          </div>
          <div className="flex items-center gap-2">
            <div className="h-7 w-10 rounded-full bg-[#BA5149]/10" />
            {mobile ? <div className="h-10 w-10 rounded-2xl border border-[#BA5149]/12 bg-white/75 dark:bg-white/6" /> : null}
          </div>
        </div>
      </div>

      <div className={`min-h-0 flex-1 space-y-3 ${mobile ? "px-3 py-3 sm:px-5 sm:py-4" : "px-4 py-4 sm:px-5"}`}>
        {LOCKED_RECOMMENDATIONS.map((recommendation) => (
          <article
            key={recommendation.title}
            className={`rounded-[24px] border border-[#BA5149]/12 bg-white/80 shadow-sm dark:bg-white/4 ${mobile ? "px-3 py-3.5 sm:px-4 sm:py-4" : "px-4 py-4"}`}
          >
            <div className="flex flex-wrap items-center gap-2">
              <div className="h-6 w-14 rounded-full bg-[#BA5149]/10" />
              <div className="h-3 w-24 rounded-full bg-[#DFC0BA]/86 dark:bg-[#744441]/62" />
            </div>

            <div className="mt-3 h-4 w-full rounded-full bg-[#BA5149]/18 dark:bg-[#BA5149]/14" />
            <div className="mt-2 h-4 w-[85%] rounded-full bg-[#EBD1CD]/92 dark:bg-[#663C39]/56" />

            <div className="mt-4 flex justify-end">
              <div className="h-9 w-28 rounded-full border border-[#BA5149]/20 bg-[#BA5149]/8" />
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

export function ChatbotLockedPreview() {
  return (
    <div className="pointer-events-none flex h-full min-h-[76dvh] select-none flex-col gap-4 p-3 sm:min-h-[80dvh] sm:p-4 lg:min-h-[calc(100dvh-9rem)] lg:flex-row lg:gap-5 lg:p-6">
      <div className="flex min-h-0 flex-1 flex-col gap-4 lg:gap-5">
        <div className="flex items-center justify-between rounded-[28px] border border-[#BA5149]/14 bg-[linear-gradient(180deg,rgba(255,255,255,0.9),rgba(255,247,245,0.85))] px-5 py-4 shadow-[0_16px_42px_rgba(153,51,49,0.08)] dark:border-[#BA5149]/12 dark:bg-[linear-gradient(180deg,rgba(35,16,21,0.92),rgba(24,12,16,0.88))]">
          <div className="space-y-2">
            <div className="h-3 w-20 rounded-full bg-[#D8A39B]/65 dark:bg-[#8E4B49]/60" />
            <div className="h-6 w-40 rounded-full bg-[#BA5149]/75 dark:bg-[#BA5149]/65" />
          </div>
          <div className="flex gap-2">
            <div className="h-11 w-11 rounded-2xl border border-[#BA5149]/18 bg-[#FFF6F4] dark:border-[#BA5149]/12 dark:bg-[#231217]" />
            <div className="h-11 w-11 rounded-2xl bg-gradient-to-br from-[#BA5149] to-[#8E332E] shadow-[0_10px_26px_rgba(153,51,49,0.18)]" />
            <div className="relative h-11 w-11 rounded-2xl border border-[#BA5149]/18 bg-[#FFF6F4] dark:border-[#BA5149]/12 dark:bg-[#231217]">
              <div className="absolute right-2 top-2 h-2.5 w-2.5 rounded-full bg-[#BA5149]" />
            </div>
          </div>
        </div>

        <div className="flex flex-1 flex-col justify-between rounded-[32px] border border-[#BA5149]/14 bg-[linear-gradient(180deg,rgba(255,255,255,0.94),rgba(255,248,246,0.92))] p-4 shadow-[0_20px_70px_rgba(153,51,49,0.1)] dark:border-[#BA5149]/12 dark:bg-[linear-gradient(180deg,rgba(36,16,21,0.94),rgba(22,10,14,0.92))] sm:p-5 lg:p-6">
          <div className="space-y-4 sm:space-y-5">
            <div className="flex justify-start">
              <div className="max-w-[82%] rounded-[26px] rounded-bl-md border border-[#BA5149]/10 bg-[#FFF3F1] px-4 py-3 dark:border-[#BA5149]/10 dark:bg-[#2A151A] sm:max-w-[70%]">
                <div className="h-3 w-20 rounded-full bg-[#BA5149]/70 dark:bg-[#BA5149]/60" />
                <div className="mt-3 h-3 w-40 rounded-full bg-[#E2B8B2]/85 dark:bg-[#88514F]/70 sm:w-52" />
                <div className="mt-2 h-3 w-32 rounded-full bg-[#F0CDC8]/90 dark:bg-[#6E3D3A]/68 sm:w-44" />
              </div>
            </div>

            <div className="flex justify-end">
              <div className="max-w-[68%] rounded-[26px] rounded-br-md bg-gradient-to-br from-[#BA5149] to-[#8D312D] px-4 py-3 shadow-[0_14px_34px_rgba(153,51,49,0.16)] sm:max-w-[58%]">
                <div className="h-3 w-32 rounded-full bg-white/72 sm:w-40" />
                <div className="mt-2 h-3 w-24 rounded-full bg-white/52 sm:w-28" />
              </div>
            </div>

            <div className="flex justify-start">
              <div className="max-w-[84%] rounded-[26px] rounded-bl-md border border-[#BA5149]/10 bg-[#FFF7F6] px-4 py-3 dark:border-[#BA5149]/10 dark:bg-[#251217] sm:max-w-[76%]">
                <div className="h-3 w-28 rounded-full bg-[#BA5149]/68 dark:bg-[#BA5149]/58" />
                <div className="mt-3 h-3 w-44 rounded-full bg-[#E3BBB5]/82 dark:bg-[#82504D]/68 sm:w-60" />
                <div className="mt-2 h-3 w-40 rounded-full bg-[#F0D0CB]/84 dark:bg-[#72423F]/62 sm:w-52" />
                <div className="mt-3 flex gap-2">
                  <div className="h-8 w-20 rounded-full bg-[#BA5149]/16 dark:bg-[#BA5149]/14" />
                  <div className="h-8 w-24 rounded-full bg-[#BA5149]/10 dark:bg-[#BA5149]/10" />
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 space-y-3 rounded-[28px] border border-[#BA5149]/14 bg-[linear-gradient(180deg,rgba(255,250,249,0.98),rgba(255,243,241,0.92))] px-4 py-4 dark:border-[#BA5149]/12 dark:bg-[linear-gradient(180deg,rgba(30,14,18,0.98),rgba(23,10,14,0.94))] sm:px-5 sm:py-5">
            <div className="flex items-center gap-3">
              <div className="h-10 flex-1 rounded-2xl bg-[#F7E1DD] dark:bg-[#3B1C21]" />
              <div className="h-10 w-10 rounded-2xl border border-[#BA5149]/18 bg-white dark:border-[#BA5149]/14 dark:bg-[#291318]" />
              <div className="h-10 w-12 rounded-2xl bg-gradient-to-br from-[#BA5149] to-[#8D312D]" />
            </div>
            <div className="flex gap-2 overflow-hidden">
              {Array.from({ length: 4 }).map((_, index) => (
                <div
                  key={index}
                  className="h-8 min-w-[88px] rounded-full bg-[#BA5149]/10 dark:bg-[#BA5149]/10"
                />
              ))}
            </div>
          </div>
        </div>

        <div className="grid gap-4 lg:hidden">
          <LockedHistorySection mobile />
          <LockedRecommendationsSection mobile />
        </div>
      </div>

      <div className="hidden min-h-0 w-full max-w-[440px] flex-col gap-4 lg:flex lg:basis-[40%]">
        <div className="min-h-0 flex-1">
          <LockedHistorySection />
        </div>
        <div className="min-h-0 flex-1">
          <LockedRecommendationsSection />
        </div>
      </div>
    </div>
  );
}