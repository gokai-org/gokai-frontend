const OVERVIEW_CARD_WIDTHS = ["w-24", "w-28", "w-20", "w-32"];

export function StatsLockedPreview() {
  return (
    <div className="pointer-events-none flex min-h-[78dvh] select-none flex-col gap-5 p-4 sm:min-h-[82dvh] sm:p-6 lg:min-h-[calc(100dvh-9rem)]">
      <div className="flex justify-end">
        <div className="h-12 w-[220px] rounded-2xl border border-[#BA5149]/14 bg-[linear-gradient(180deg,rgba(255,255,255,0.92),rgba(255,247,245,0.88))] shadow-[0_16px_42px_rgba(153,51,49,0.08)] dark:border-[#BA5149]/12 dark:bg-[linear-gradient(180deg,rgba(35,16,21,0.92),rgba(24,12,16,0.88))]" />
      </div>

      <section className="rounded-[34px] border border-[#BA5149]/14 bg-[linear-gradient(180deg,rgba(255,255,255,0.94),rgba(255,248,246,0.92))] p-5 shadow-[0_20px_70px_rgba(153,51,49,0.1)] dark:border-[#BA5149]/12 dark:bg-[linear-gradient(180deg,rgba(36,16,21,0.94),rgba(22,10,14,0.92))] lg:p-7">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-3">
            <div className="h-4 w-28 rounded-full bg-[#D8A39B]/65 dark:bg-[#8E4B49]/60" />
            <div className="h-8 w-[260px] rounded-full bg-[#BA5149]/76 dark:bg-[#BA5149]/64 sm:w-[360px]" />
            <div className="h-4 w-[220px] rounded-full bg-[#E2B8B2]/85 dark:bg-[#88514F]/70 sm:w-[420px]" />
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {Array.from({ length: 3 }).map((_, index) => (
              <div
                key={index}
                className="rounded-[24px] border border-[#BA5149]/12 bg-white/74 px-4 py-4 shadow-sm dark:bg-white/4"
              >
                <div className="h-3 w-16 rounded-full bg-[#D8A39B]/72 dark:bg-[#8E4B49]/62" />
                <div className="mt-3 h-8 w-14 rounded-full bg-[#BA5149]/18 dark:bg-[#BA5149]/14" />
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {OVERVIEW_CARD_WIDTHS.map((widthClassName, index) => (
          <article
            key={index}
            className="rounded-[28px] border border-[#BA5149]/14 bg-[linear-gradient(180deg,rgba(255,255,255,0.94),rgba(255,248,246,0.92))] p-5 shadow-[0_16px_48px_rgba(153,51,49,0.08)] dark:border-[#BA5149]/12 dark:bg-[linear-gradient(180deg,rgba(33,14,18,0.94),rgba(23,10,14,0.92))]"
          >
            <div className={`h-3 rounded-full bg-[#D8A39B]/72 dark:bg-[#8E4B49]/62 ${widthClassName}`} />
            <div className="mt-4 h-9 w-20 rounded-full bg-[#BA5149]/18 dark:bg-[#BA5149]/14" />
            <div className="mt-4 h-3 w-full rounded-full bg-[#EBD1CD]/92 dark:bg-[#663C39]/56" />
            <div className="mt-2 h-3 w-[78%] rounded-full bg-[#F0D0CB]/84 dark:bg-[#72423F]/62" />
          </article>
        ))}
      </section>

      <section className="grid gap-5 xl:grid-cols-[1.35fr_0.95fr]">
        <article className="rounded-[34px] border border-[#BA5149]/14 bg-[linear-gradient(180deg,rgba(255,255,255,0.94),rgba(255,248,246,0.92))] p-5 shadow-[0_20px_60px_rgba(153,51,49,0.08)] dark:border-[#BA5149]/12 dark:bg-[linear-gradient(180deg,rgba(36,16,21,0.94),rgba(22,10,14,0.92))] lg:p-6">
          <div className="h-4 w-36 rounded-full bg-[#BA5149]/74 dark:bg-[#BA5149]/58" />
          <div className="mt-3 h-3 w-56 rounded-full bg-[#E2B8B2]/85 dark:bg-[#88514F]/70" />
          <div className="mt-6 flex h-[260px] items-end gap-3 rounded-[28px] border border-[#BA5149]/10 bg-white/72 px-4 py-5 dark:bg-white/4">
            {Array.from({ length: 10 }).map((_, index) => (
              <div key={index} className="flex flex-1 flex-col justify-end gap-2">
                <div
                  className="rounded-t-[18px] bg-gradient-to-t from-[#993331] to-[#D46A61]"
                  style={{ height: `${22 + (index % 5) * 24}%` }}
                />
                <div className="h-2 rounded-full bg-[#BA5149]/10" />
              </div>
            ))}
          </div>
        </article>

        <article className="rounded-[34px] border border-[#BA5149]/14 bg-[linear-gradient(180deg,rgba(255,255,255,0.94),rgba(255,248,246,0.92))] p-5 shadow-[0_20px_60px_rgba(153,51,49,0.08)] dark:border-[#BA5149]/12 dark:bg-[linear-gradient(180deg,rgba(36,16,21,0.94),rgba(22,10,14,0.92))] lg:p-6">
          <div className="h-4 w-40 rounded-full bg-[#BA5149]/74 dark:bg-[#BA5149]/58" />
          <div className="mt-3 h-3 w-48 rounded-full bg-[#E2B8B2]/85 dark:bg-[#88514F]/70" />
          <div className="mt-5 space-y-3">
            {Array.from({ length: 5 }).map((_, index) => (
              <div
                key={index}
                className="rounded-[22px] border border-[#BA5149]/10 bg-white/78 px-4 py-4 dark:bg-white/4"
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="h-3 w-28 rounded-full bg-[#BA5149]/72 dark:bg-[#BA5149]/58" />
                  <div className="h-3 w-10 rounded-full bg-[#D8A39B]/72 dark:bg-[#8E4B49]/62" />
                </div>
                <div className="mt-3 h-2.5 rounded-full bg-[#BA5149]/10">
                  <div
                    className="h-2.5 rounded-full bg-gradient-to-r from-[#993331] to-[#D46A61]"
                    style={{ width: `${34 + index * 12}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </article>
      </section>

      <section className="rounded-[34px] border border-[#BA5149]/14 bg-[linear-gradient(180deg,rgba(255,255,255,0.94),rgba(255,248,246,0.92))] p-5 shadow-[0_20px_60px_rgba(153,51,49,0.08)] dark:border-[#BA5149]/12 dark:bg-[linear-gradient(180deg,rgba(36,16,21,0.94),rgba(22,10,14,0.92))] lg:p-6">
        <div className="h-4 w-44 rounded-full bg-[#BA5149]/74 dark:bg-[#BA5149]/58" />
        <div className="mt-3 h-3 w-64 rounded-full bg-[#E2B8B2]/85 dark:bg-[#88514F]/70" />
        <div className="mt-5 grid grid-cols-7 gap-2 sm:gap-3">
          {Array.from({ length: 35 }).map((_, index) => (
            <div
              key={index}
              className={[
                "aspect-square rounded-[14px] border border-[#BA5149]/10",
                index % 6 === 0
                  ? "bg-gradient-to-br from-[#BA5149] to-[#8A2F2A]"
                  : index % 3 === 0
                    ? "bg-[#BA5149]/22"
                    : "bg-[#BA5149]/8",
              ].join(" ")}
            />
          ))}
        </div>
      </section>
    </div>
  );
}