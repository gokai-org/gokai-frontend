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

    let w = 0;
    let h = 0;
    let dpr = 1;

    const nodes: Node[] = [];
    const rand = (min: number, max: number) => Math.random() * (max - min) + min;

    const getPad = () => edgeMargin ?? (mode === "screen" ? 120 : 60);

    const createNode = (x?: number, y?: number): Node => {
      const isRed = Math.random() < 0.45;
      const pad = getPad();

      const spawnX =
        x ?? (w > 2 * pad ? pad + Math.random() * (w - 2 * pad) : Math.random() * w);
      const spawnY =
        y ?? (h > 2 * pad ? pad + Math.random() * (h - 2 * pad) : Math.random() * h);

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
      ctx.clearRect(0, 0, w, h);

      // Aristas
      ctx.lineCap = "round";
      ctx.lineJoin = "round";

      const strokeAlphaBase = variant === "dimmed" ? 0.35 : 0.55;
      const lineWidthBase = variant === "dimmed" ? 1.6 : 2.2;

      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const a = nodes[i];
          const b = nodes[j];
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const dist = Math.hypot(dx, dy);
          if (dist > maxDist) continue;

          const alpha = 1 - dist / maxDist;

          ctx.strokeStyle = `rgba(153, 51, 49, ${strokeAlphaBase * alpha})`;
          ctx.lineWidth = lineWidthBase * alpha;

          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.stroke();
        }
      }

      // Nodos
      for (const n of nodes) {
        ctx.save();

        ctx.shadowBlur = variant === "dimmed" ? 12 : 18;
        ctx.shadowColor =
          n.color === "red"
            ? variant === "dimmed"
              ? "rgba(153,51,49,0.22)"
              : "rgba(153,51,49,0.30)"
            : variant === "dimmed"
              ? "rgba(0,0,0,0.08)"
              : "rgba(0,0,0,0.10)";

        ctx.beginPath();
        ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);

        ctx.fillStyle =
          n.color === "red"
            ? variant === "dimmed"
              ? "rgba(153, 51, 49, 0.80)"
              : "rgba(153, 51, 49, 0.92)"
            : variant === "dimmed"
              ? "rgba(255, 255, 255, 0.90)"
              : "rgba(255, 255, 255, 0.98)";
        ctx.fill();

        ctx.shadowBlur = 0;
        ctx.lineWidth = 1;
        ctx.strokeStyle =
          n.color === "red"
            ? variant === "dimmed"
              ? "rgba(153,51,49,0.18)"
              : "rgba(153,51,49,0.22)"
            : variant === "dimmed"
              ? "rgba(0,0,0,0.06)"
              : "rgba(0,0,0,0.08)";
        ctx.stroke();

        ctx.restore();
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
