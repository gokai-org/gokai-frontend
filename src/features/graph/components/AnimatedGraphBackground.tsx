"use client";

import { useEffect, useRef } from "react";

type Props = {
  className?: string;
  density?: number; // nodos por área
  maxDist?: number;
  speed?: number;
  variant?: "normal" | "dimmed";
  mode?: "parent" | "screen"; // posicionamiento y tamaño base
  edgeMargin?: number; // margen interno para evitar acercarse a bordes
};

type Node = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
  color: "red" | "white";
};

export default function AnimatedGraphBackground({
  className = "",
  density = 0.00008,
  maxDist = 180,
  speed = 0.22,
  variant = "normal",
  mode = "parent",
  edgeMargin,
}: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number | null>(null);
  const resizeTimer = useRef<number | null>(null);
  const isDarkRef = useRef(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx2d = canvas.getContext("2d");
    if (!ctx2d) return;

    const cvs = canvas;
    const ctx = ctx2d;

    const prefersReduced =
      typeof window !== "undefined" &&
      window.matchMedia &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const root = document.documentElement;

    const updateThemeMode = () => {
      isDarkRef.current = root.classList.contains("dark");
    };

    updateThemeMode();

    const themeObserver = new MutationObserver(() => {
      updateThemeMode();
    });

    themeObserver.observe(root, {
      attributes: true,
      attributeFilter: ["class"],
    });

    let w = 0;
    let h = 0;
    let dpr = 1;

    const nodes: Node[] = [];
    const rand = (min: number, max: number) =>
      Math.random() * (max - min) + min;

    const getPad = () => edgeMargin ?? (mode === "screen" ? 120 : 60);

    const createNode = (x?: number, y?: number): Node => {
      const isRed = Math.random() < 0.45;
      const pad = getPad();

      const spawnX =
        x ??
        (w > 2 * pad ? pad + Math.random() * (w - 2 * pad) : Math.random() * w);
      const spawnY =
        y ??
        (h > 2 * pad ? pad + Math.random() * (h - 2 * pad) : Math.random() * h);

      return {
        x: spawnX,
        y: spawnY,
        vx: (Math.random() * 2 - 1) * speed,
        vy: (Math.random() * 2 - 1) * speed,
        r: isRed ? rand(10, 28) : rand(10, 26),
        color: isRed ? "red" : "white",
      };
    };

    function setCanvasSize() {
      dpr = Math.min(window.devicePixelRatio || 1, 2);

      let newW = 0;
      let newH = 0;

      if (mode === "screen") {
        newW = window.innerWidth;
        newH = window.innerHeight;
      } else {
        const parent = cvs.parentElement;
        newW = parent?.clientWidth || window.innerWidth;
        newH = parent?.clientHeight || window.innerHeight;
      }

      if (newW === w && newH === h) return;

      w = newW;
      h = newH;

      cvs.width = Math.floor(w * dpr);
      cvs.height = Math.floor(h * dpr);
      cvs.style.width = `${w}px`;
      cvs.style.height = `${h}px`;

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    function reconcileNodesCount() {
      const target = Math.max(22, Math.floor(w * h * density));

      if (nodes.length < target) {
        const missing = target - nodes.length;
        for (let i = 0; i < missing; i++) nodes.push(createNode());
      } else if (nodes.length > target) {
        nodes.splice(target);
      }
    }

    function keepNodesInBoundsAfterResize() {
      const pad = getPad();
      for (const n of nodes) {
        if (n.x < -pad) n.x = -pad;
        if (n.x > w + pad) n.x = w + pad;
        if (n.y < -pad) n.y = -pad;
        if (n.y > h + pad) n.y = h + pad;
      }
    }

    function initOrResize() {
      setCanvasSize();

      if (nodes.length === 0) {
        const initial = Math.max(22, Math.floor(w * h * density));
        for (let i = 0; i < initial; i++) nodes.push(createNode());
      } else {
        reconcileNodesCount();
        keepNodesInBoundsAfterResize();
      }
    }

    function update() {
      const pad = getPad();
      for (const n of nodes) {
        n.x += n.vx;
        n.y += n.vy;

        // wrap infinito
        if (n.x < -pad) n.x = w + pad;
        if (n.x > w + pad) n.x = -pad;
        if (n.y < -pad) n.y = h + pad;
        if (n.y > h + pad) n.y = -pad;
      }
    }

    function draw() {
      const isDark = isDarkRef.current;

      ctx.clearRect(0, 0, w, h);

      // ── Aristas (curvas cuadráticas como en landing) ──
      ctx.lineCap = "round";
      ctx.lineJoin = "round";

      const strokeAlphaBase = variant === "dimmed" ? 0.30 : 0.45;
      const lineWidthBase = variant === "dimmed" ? 1.2 : 1.8;

      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const a = nodes[i];
          const b = nodes[j];
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const dist = Math.hypot(dx, dy);
          if (dist > maxDist) continue;

          const alpha = (1 - dist / maxDist);
          const fade = alpha * alpha; // cuadrático para fade más suave

          ctx.strokeStyle = `rgba(153, 51, 49, ${strokeAlphaBase * fade})`;
          ctx.lineWidth = lineWidthBase * alpha;

          // Curva cuadrática con punto medio desplazado
          const mx = (a.x + b.x) / 2 + (a.y - b.y) * 0.08;
          const my = (a.y + b.y) / 2 + (b.x - a.x) * 0.08;

          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.quadraticCurveTo(mx, my, b.x, b.y);
          ctx.stroke();
        }
      }

      // ── Nodos con glow radial (estilo landing) ──
      for (const n of nodes) {
        const isRed = n.color === "red";
        const glowR = n.r * (variant === "dimmed" ? 2.2 : 2.8);

        // Glow radial
        const grad = ctx.createRadialGradient(n.x, n.y, n.r * 0.4, n.x, n.y, glowR);
        if (isRed) {
          const glowA = variant === "dimmed" ? 0.12 : 0.18;
          grad.addColorStop(0, `rgba(153, 51, 49, ${glowA})`);
          grad.addColorStop(1, "rgba(153, 51, 49, 0)");
        } else if (isDark) {
          const glowA = variant === "dimmed" ? 0.06 : 0.10;
          grad.addColorStop(0, `rgba(255, 255, 255, ${glowA})`);
          grad.addColorStop(1, "rgba(255, 255, 255, 0)");
        } else {
          const glowA = variant === "dimmed" ? 0.05 : 0.08;
          grad.addColorStop(0, `rgba(0, 0, 0, ${glowA})`);
          grad.addColorStop(1, "rgba(0, 0, 0, 0)");
        }
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(n.x, n.y, glowR, 0, Math.PI * 2);
        ctx.fill();

        // Nodo sólido
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
        ctx.fillStyle = isRed
          ? variant === "dimmed"
            ? "rgba(153, 51, 49, 0.80)"
            : "rgba(153, 51, 49, 0.92)"
          : isDark
            ? variant === "dimmed"
              ? "rgba(255, 255, 255, 0.86)"
              : "rgba(255, 255, 255, 0.94)"
            : variant === "dimmed"
              ? "rgba(19, 19, 19, 0.82)"
              : "rgba(19, 19, 19, 0.92)";
        ctx.fill();

        // Borde sutil
        ctx.lineWidth = 1;
        ctx.strokeStyle = isRed
          ? variant === "dimmed"
            ? "rgba(153,51,49,0.15)"
            : "rgba(153,51,49,0.20)"
          : isDark
            ? variant === "dimmed"
              ? "rgba(255,255,255,0.06)"
              : "rgba(255,255,255,0.10)"
            : variant === "dimmed"
              ? "rgba(0,0,0,0.06)"
              : "rgba(0,0,0,0.10)";
        ctx.stroke();
      }
    }

    function step() {
      update();
      draw();
      rafRef.current = requestAnimationFrame(step);
    }

    // init
    initOrResize();
    if (prefersReduced) draw();
    else rafRef.current = requestAnimationFrame(step);

    const onResize = () => {
      if (resizeTimer.current) window.clearTimeout(resizeTimer.current);
      resizeTimer.current = window.setTimeout(() => {
        initOrResize();
        resizeTimer.current = null;
      }, 120);
    };

    let ro: ResizeObserver | null = null;

    if (mode === "parent") {
      const parentEl = cvs.parentElement;
      if (typeof ResizeObserver !== "undefined" && parentEl) {
        ro = new ResizeObserver(() => onResize());
        ro.observe(parentEl);
      } else {
        window.addEventListener("resize", onResize);
      }
    } else {
      // screen
      window.addEventListener("resize", onResize);
    }

    return () => {
      if (ro) ro.disconnect();
      else window.removeEventListener("resize", onResize);

      themeObserver.disconnect();

      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      if (resizeTimer.current) window.clearTimeout(resizeTimer.current);
    };
  }, [density, maxDist, speed, variant, mode, edgeMargin]);

  return (
    <canvas
      ref={canvasRef}
      className={[
        mode === "screen"
          ? "fixed inset-0 z-0 h-screen w-screen pointer-events-none"
          : "absolute inset-0 z-0 h-full w-full pointer-events-none",
        className,
      ].join(" ")}
      aria-hidden="true"
    />
  );
}
