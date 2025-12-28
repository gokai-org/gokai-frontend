"use client";

import { useEffect, useRef } from "react";

type Props = {
  className?: string;
  density?: number; // nodos por área
  maxDist?: number;
  speed?: number;
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
}: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number | null>(null);
  const resizeTimer = useRef<number | null>(null);

  useEffect(() => {
    // Captura una vez y regresa si no existe
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx2d = canvas.getContext("2d");
    if (!ctx2d) return;
    const cvs = canvas as HTMLCanvasElement;
    const ctx = ctx2d as CanvasRenderingContext2D;

    const prefersReduced =
      typeof window !== "undefined" &&
      window.matchMedia &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let w = 0;
    let h = 0;
    let dpr = 1;

    const nodes: Node[] = [];

    const rand = (min: number, max: number) => Math.random() * (max - min) + min;

    const createNode = (x?: number, y?: number): Node => {
      const isRed = Math.random() < 0.45;
      return {
        x: x ?? Math.random() * w,
        y: y ?? Math.random() * h,
        vx: (Math.random() * 2 - 1) * speed,
        vy: (Math.random() * 2 - 1) * speed,
        r: isRed ? rand(10, 28) : rand(10, 26),
        color: isRed ? "red" : "white",
      };
    };

    function setCanvasSize() {
      const parent = cvs.parentElement;

      dpr = Math.min(window.devicePixelRatio || 1, 2);

      const newW = parent?.clientWidth || window.innerWidth;
      const newH = parent?.clientHeight || window.innerHeight;

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
      for (const n of nodes) {
        if (n.x < -60) n.x = -60;
        if (n.x > w + 60) n.x = w + 60;
        if (n.y < -60) n.y = -60;
        if (n.y > h + 60) n.y = h + 60;
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
      for (const n of nodes) {
        n.x += n.vx;
        n.y += n.vy;

        // wrap infinito
        if (n.x < -60) n.x = w + 60;
        if (n.x > w + 60) n.x = -60;
        if (n.y < -60) n.y = h + 60;
        if (n.y > h + 60) n.y = -60;
      }
    }

    function draw() {
      ctx.clearRect(0, 0, w, h);

      // Aristas
      ctx.lineCap = "round";
      ctx.lineJoin = "round";

      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const a = nodes[i];
          const b = nodes[j];
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const dist = Math.hypot(dx, dy);
          if (dist > maxDist) continue;

          const alpha = 1 - dist / maxDist;

          ctx.strokeStyle = `rgba(153, 51, 49, ${0.55 * alpha})`;
          ctx.lineWidth = 2.2 * alpha;

          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.stroke();
        }
      }

      // Nodos
      for (const n of nodes) {
        ctx.save();

        ctx.shadowBlur = 18;
        ctx.shadowColor =
          n.color === "red"
            ? "rgba(153,51,49,0.30)"
            : "rgba(0,0,0,0.10)";

        ctx.beginPath();
        ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);

        ctx.fillStyle =
          n.color === "red"
            ? "rgba(153, 51, 49, 0.92)"
            : "rgba(255, 255, 255, 0.98)";
        ctx.fill();

        ctx.shadowBlur = 0;
        ctx.lineWidth = 1;
        ctx.strokeStyle =
          n.color === "red"
            ? "rgba(153,51,49,0.22)"
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

    // Init
    initOrResize();

    if (prefersReduced) draw();
    else rafRef.current = requestAnimationFrame(step);

    const onResize = () => {
      if (resizeTimer.current) window.clearTimeout(resizeTimer.current);
      resizeTimer.current = window.setTimeout(() => {
        initOrResize();
        resizeTimer.current = null;
      }, 150);
    };

    const parentEl = cvs.parentElement;
    let ro: ResizeObserver | null = null;

    if (typeof ResizeObserver !== "undefined" && parentEl) {
      ro = new ResizeObserver(() => onResize());
      ro.observe(parentEl);
    } else {
      window.addEventListener("resize", onResize);
    }

    return () => {
      if (ro) ro.disconnect();
      else window.removeEventListener("resize", onResize);

      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      if (resizeTimer.current) window.clearTimeout(resizeTimer.current);
    };
  }, [density, maxDist, speed]);

  return (
    <canvas
      ref={canvasRef}
      className={["absolute inset-0 z-0 h-full w-full pointer-events-none", className].join(
        " "
      )}
      aria-hidden="true"
    />
  );
}