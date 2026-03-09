"use client";

import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

export type MembershipIntent = "free" | "premium";

interface PlanOption {
  intent: MembershipIntent;
  title: string;
  subtitle: string;
  price: string;
  period: string;
  buttonText: string;
  bullets: string[];
  highlight?: boolean;
}

const PLANS: PlanOption[] = [
  {
    intent: "free",
    title: "GOKAI",
    subtitle: "Perfecto para comenzar tu viaje en japonés sin compromiso.",
    price: "$ 0",
    period: "MXN / mensual",
    buttonText: "Comenzar gratis",
    bullets: ["Acceso a módulos básicos.", "Grafo limitado.", "Sin chatbot."],
  },
  {
    intent: "premium",
    title: "GOKAI+",
    subtitle: "Desbloquea todo el poder de la IA y repasos inteligentes.",
    price: "$ 229",
    period: "MXN / mensual",
    buttonText: "Suscribirme",
    bullets: ["IA completa.", "Chatbot ilimitado.", "Estadísticas avanzadas."],
    highlight: true,
  },
];

interface MembershipPickerProps {
  mode?: "link" | "callback";
  onSelect?: (intent: MembershipIntent) => void;
  animateOnMount?: boolean;
  className?: string;
}

export default function MembershipPicker({
  mode = "link",
  onSelect,
  animateOnMount = false,
  className = "",
}: MembershipPickerProps) {
  const router = useRouter();
  const headerBg = "bg-[#b34a45]";

  return (
    <div className={["mx-auto grid max-w-5xl grid-cols-1 gap-8 md:grid-cols-2", className].join(" ")}>
      {PLANS.map((plan, idx) => {
        const card = (
          <motion.div
            key={plan.intent}
            {...(animateOnMount
              ? {
                  initial: { opacity: 0, y: 40 },
                  animate: { opacity: 1, y: 0 },
                  transition: { delay: idx * 0.15, duration: 0.6, ease: "easeOut" },
                }
              : {
                  initial: { opacity: 0, y: 40 },
                  whileInView: { opacity: 1, y: 0 },
                  viewport: { once: true, margin: "-50px" },
                  transition: { delay: idx * 0.15, duration: 0.6, ease: "easeOut" },
                })}
            whileHover={{ y: -12, scale: 1.02, transition: { duration: 0.3 } }}
            className={[
              "relative overflow-hidden rounded-[28px] bg-white ring-1 ring-black/10 shadow-[0_18px_55px_rgba(0,0,0,0.18)] hover:shadow-[0_25px_70px_rgba(0,0,0,0.25)] transition-shadow cursor-pointer",
              plan.highlight ? "ring-2 ring-[#993331]/40" : "",
            ].join(" ")}
          >
            {/* Decorative circles */}
            <div className="pointer-events-none absolute inset-0 -z-10" />
            <div className="pointer-events-none absolute -left-8 top-1/2 -z-10 h-16 w-16 -translate-y-1/2 rounded-full bg-white ring-1 ring-black/10" />
            <div className="pointer-events-none absolute -right-8 top-1/2 -z-10 h-16 w-16 -translate-y-1/2 rounded-full bg-white ring-1 ring-black/10" />

            {/* Header */}
            <div className={[headerBg, "px-8 pt-7 pb-6"].join(" ")}>
              <h3 className="text-3xl font-extrabold tracking-wide text-white">{plan.title}</h3>
              <p className="mt-2 text-sm md:text-base text-white/90">{plan.subtitle}</p>
            </div>

            {/* Body */}
            <div className="bg-white px-8 pb-8 pt-7">
              <div className="rounded-2xl bg-white ring-1 ring-black/10 shadow-sm p-5">
                <div className="flex items-end gap-3">
                  <span className="text-neutral-300 text-2xl font-extrabold">$</span>
                  <div className="flex items-baseline gap-3">
                    <span className="text-5xl font-extrabold tracking-tight text-neutral-900">
                      {plan.price.replace("$", "").trim()}
                    </span>
                    <span className="text-xs md:text-sm text-neutral-400">{plan.period}</span>
                  </div>
                </div>

                <motion.div
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  className="mt-4 w-full rounded-xl bg-[#993331] py-3 text-center text-base font-extrabold text-white shadow-sm hover:bg-[#882d2d] transition-colors"
                >
                  {plan.buttonText}
                </motion.div>
              </div>

              <ul className="mt-6 space-y-3 text-left">
                {plan.bullets.map((b, bIdx) => (
                  <motion.li
                    key={b}
                    {...(animateOnMount
                      ? {
                          initial: { opacity: 0, x: -20 },
                          animate: { opacity: 1, x: 0 },
                          transition: { delay: 0.3 + bIdx * 0.1, duration: 0.4 },
                        }
                      : {
                          initial: { opacity: 0, x: -20 },
                          whileInView: { opacity: 1, x: 0 },
                          viewport: { once: true },
                          transition: { delay: 0.3 + bIdx * 0.1, duration: 0.4 },
                        })}
                    className="flex items-start gap-3 text-sm md:text-base text-neutral-800"
                  >
                    <motion.span
                      {...(animateOnMount
                        ? {
                            initial: { scale: 0 },
                            animate: { scale: 1 },
                            transition: { delay: 0.4 + bIdx * 0.1, type: "spring", stiffness: 200 },
                          }
                        : {
                            initial: { scale: 0 },
                            whileInView: { scale: 1 },
                            viewport: { once: true },
                            transition: { delay: 0.4 + bIdx * 0.1, type: "spring", stiffness: 200 },
                          })}
                      className="mt-[2px] inline-flex h-6 w-6 items-center justify-center rounded-full bg-white ring-1 ring-black/10"
                    >
                      <span className="text-[#993331] font-black">✓</span>
                    </motion.span>
                    <span>{b}</span>
                  </motion.li>
                ))}
              </ul>
            </div>
          </motion.div>
        );

        if (mode === "link") {
          return (
            <div
              key={plan.intent}
              className="block cursor-pointer"
              onClick={() => {
                router.replace(`/auth/login?mode=register&intent=${plan.intent}`);
              }}
              role="link"
            >
              {card}
            </div>
          );
        }

        return (
          <div
            key={plan.intent}
            onClick={() => onSelect?.(plan.intent)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onSelect?.(plan.intent);
              }
            }}
          >
            {card}
          </div>
        );
      })}
    </div>
  );
}
