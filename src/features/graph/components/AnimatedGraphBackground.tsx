"use client";

import { useEffect, useRef } from "react";

type Props = {
  className?: string;
  density?: number;
  maxDist?: number;
  speed?: number;
  variant?: "normal" | "dimmed";
  mode?: "parent" | "screen";
  edgeMargin?: number;
  zoom?: number;
  spread?: number;
  depth?: number;
};

type BaseNode = {
  id: number;
  seed: number;
  seed2: number;
  angle: number;
  radial: number;
  height: number;
  depth: number;
  size: number;
  cluster: number;
  phase: number;
  orbit: number;
  bias: number;
};

type ProjectedNode = {
  x: number;
  y: number;
  z: number;
  radius: number;
  alpha: number;
  accent: number;
};

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

function rotateY(x: number, z: number, angle: number) {
  const cos = Math.cos(angle);
  const sin = Math.sin(angle);
  return {
    x: x * cos - z * sin,
    z: x * sin + z * cos,
  };
}

function rotateX(y: number, z: number, angle: number) {
  const cos = Math.cos(angle);
  const sin = Math.sin(angle);
  return {
    y: y * cos - z * sin,
    z: y * sin + z * cos,
  };
}

function createNodes(count: number): BaseNode[] {
  return Array.from({ length: count }, (_, id) => ({
    id,
    seed: Math.random() * Math.PI * 2,
    seed2: Math.random() * Math.PI * 2,
    angle: (id / Math.max(1, count)) * Math.PI * 2,
    radial: 0.18 + Math.random() * 0.82,
    height: Math.random() * 2 - 1,
    depth: Math.random() * 2 - 1,
    size: 1.2 + Math.random() * 2.8,
    cluster: id % 6,
    phase: Math.random() * Math.PI * 2,
    orbit: 0.24 + Math.random() * 0.78,
    bias: Math.random() * 2 - 1,
  }));
}

function getAmbientPosition(node: BaseNode, time: number) {
  const a = node.angle + node.seed * 0.35;
  const r = node.radial;
  const d = node.depth;

  return {
    x: Math.cos(a) * (0.48 + r * 0.8),
    y: Math.sin(a * 1.18) * (0.4 + r * 0.62),
    z: d * 0.9 + Math.sin(a * 2 + time * 0.45) * 0.22,
  };
}

export default function AnimatedGraphBackground({
  className = "",
  density = 0.000082,
  maxDist = 250,
  speed = 0.2,
  variant = "normal",
  mode = "parent",
  edgeMargin,
  zoom = 0.90,
  spread = 1.28,
  depth = 1.36,
}: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number | null>(null);
  const resizeTimerRef = useRef<number | null>(null);
  const nodesRef = useRef<BaseNode[]>([]);
  const isDarkRef = useRef(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

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

    const prefersReducedMotion =
      typeof window !== "undefined" &&
      typeof window.matchMedia === "function" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let width = 0;
    let height = 0;
    let dpr = 1;
    let lastSizeProbe = 0;

    const setCanvasSize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);

      let nextWidth = 0;
      let nextHeight = 0;

      if (mode === "screen") {
        nextWidth = window.innerWidth;
        nextHeight = window.innerHeight;
      } else {
        const parent = canvas.parentElement;
        nextWidth = Math.max(
          parent?.clientWidth || 0,
          parent?.scrollWidth || 0,
          window.innerWidth,
        );
        nextHeight = Math.max(
          parent?.clientHeight || 0,
          parent?.scrollHeight || 0,
          window.innerHeight,
        );
      }

      if (nextWidth === width && nextHeight === height) return;

      width = nextWidth;
      height = nextHeight;

      canvas.width = Math.max(1, Math.floor(width * dpr));
      canvas.height = Math.max(1, Math.floor(height * dpr));
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const reconcileNodes = () => {
      const target = Math.max(28, Math.floor(width * height * density));
      const current = nodesRef.current.length;

      if (current < target) {
        const extra = createNodes(target - current).map((node, index) => ({
          ...node,
          id: current + index,
        }));
        nodesRef.current = [...nodesRef.current, ...extra];
      } else if (current > target) {
        nodesRef.current = nodesRef.current.slice(0, target);
      }
    };

    const initOrResize = () => {
      setCanvasSize();

      if (nodesRef.current.length === 0) {
        const initial = Math.max(28, Math.floor(width * height * density));
        nodesRef.current = createNodes(initial);
      } else {
        reconcileNodes();
      }
    };

    const drawBackground = (anchorX: number, anchorY: number) => {
      const isDark = isDarkRef.current;

      ctx.clearRect(0, 0, width, height);

      const radial = ctx.createRadialGradient(
        anchorX,
        anchorY,
        0,
        anchorX,
        anchorY,
        Math.max(width, height) * 0.86,
      );

      if (isDark) {
        radial.addColorStop(0, "rgba(153,51,49,0.10)");
        radial.addColorStop(0.45, "rgba(153,51,49,0.035)");
        radial.addColorStop(1, "rgba(0,0,0,0)");
      } else {
        radial.addColorStop(0, "rgba(153,51,49,0.055)");
        radial.addColorStop(0.45, "rgba(153,51,49,0.018)");
        radial.addColorStop(1, "rgba(255,255,255,0)");
      }

      ctx.fillStyle = radial;
      ctx.fillRect(0, 0, width, height);

      const vignette = ctx.createRadialGradient(
        width * 0.5,
        height * 0.5,
        Math.min(width, height) * 0.12,
        width * 0.5,
        height * 0.5,
        Math.max(width, height) * 0.82,
      );

      vignette.addColorStop(0, "rgba(0,0,0,0)");
      vignette.addColorStop(0.72, "rgba(0,0,0,0)");
      vignette.addColorStop(
        1,
        variant === "dimmed" ? "rgba(0,0,0,0.14)" : "rgba(0,0,0,0.10)",
      );

      ctx.fillStyle = vignette;
      ctx.fillRect(0, 0, width, height);
    };

    const drawFrame = (timestamp: number) => {
      rafRef.current = window.requestAnimationFrame(drawFrame);

      // Keep canvas synced with parent growth that does not always trigger ResizeObserver.
      if (mode === "parent" && timestamp - lastSizeProbe > 250) {
        lastSizeProbe = timestamp;

        const prevWidth = width;
        const prevHeight = height;

        setCanvasSize();

        if (prevWidth !== width || prevHeight !== height) {
          reconcileNodes();
        }
      }

      if (!width || !height) return;

      const isDark = isDarkRef.current;
      const isMobile = width < 768;
      const time = timestamp * 0.00042;

      const rotationY = time * speed * 0.18;
      const rotationX = Math.sin(time * 0.5) * 0.08;

      const anchorX = width * (isMobile ? 0.5 : 0.58);
      const anchorY = height * 0.5;

      const scale =
        Math.min(width, height) * (isMobile ? 0.56 : 0.68) * zoom;

      const cameraDistance = isMobile ? 2.55 : 2.2;

      drawBackground(anchorX, anchorY);

      const projectedNodes: ProjectedNode[] = [];

      for (const node of nodesRef.current) {
        const pos = getAmbientPosition(node, time);

        const orbitX =
          Math.cos(time * (0.8 + node.orbit) + node.seed) * 0.06 * speed * 5;

        const orbitY =
          Math.sin(time * (0.72 + node.orbit) + node.phase) * 0.06 * speed * 5;

        const orbitZ =
          Math.sin(time * (0.5 + node.orbit) + node.seed2) * 0.08 * speed * 5;

        let x = (pos.x + orbitX) * spread;
        let y = (pos.y + orbitY) * spread;
        let z = (pos.z + orbitZ) * depth;

        z -= isMobile ? 0.7 : 1.05;

        const rotatedY = rotateY(x, z, rotationY);
        x = rotatedY.x;
        z = rotatedY.z;

        const rotatedX = rotateX(y, z, rotationX);
        y = rotatedX.y;
        z = rotatedX.z;

        const perspective = cameraDistance / Math.max(0.65, cameraDistance + z);

        const screenX = anchorX + x * scale * perspective;
        const screenY = anchorY + y * scale * perspective;

        const pulse = prefersReducedMotion
          ? 1
          : 1 + Math.sin(time * 1.4 + node.phase) * 0.12;

        const radius =
          node.size * perspective * pulse * (isMobile ? 1.55 : 1.92);

        const alpha = clamp(
          (variant === "dimmed" ? 0.72 : 0.92) * (0.28 + perspective * 0.76),
          0.18,
          1,
        );

        projectedNodes.push({
          x: screenX,
          y: screenY,
          z,
          radius,
          alpha,
          accent: node.cluster % 2,
        });
      }

      ctx.lineCap = "round";
      ctx.lineJoin = "round";

      const linkDistance = maxDist * (isMobile ? 0.95 : 1.08);

      for (let i = 0; i < projectedNodes.length; i++) {
        const a = projectedNodes[i];

        for (let j = i + 1; j < projectedNodes.length; j++) {
          const b = projectedNodes[j];
          const distance = Math.hypot(a.x - b.x, a.y - b.y);

          if (distance > linkDistance) continue;

          const alpha =
            (1 - distance / linkDistance) *
            (variant === "dimmed" ? 0.28 : 0.42);

          const mx = (a.x + b.x) * 0.5;
          const my = (a.y + b.y) * 0.5;
          const bend =
            Math.sin((a.x + b.y) * 0.003 + time) * (isMobile ? 14 : 22);

          ctx.strokeStyle = `rgba(153,51,49,${alpha})`;
          ctx.lineWidth = lerp(0.6, 1.8, 1 - distance / linkDistance);

          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.quadraticCurveTo(mx, my + bend, b.x, b.y);
          ctx.stroke();
        }
      }

      const sortedNodes = [...projectedNodes].sort((a, b) => a.z - b.z);

      for (const node of sortedNodes) {
        const glowRadius = node.radius * (isMobile ? 4.4 : 5.3);

        const glow = ctx.createRadialGradient(
          node.x,
          node.y,
          0,
          node.x,
          node.y,
          glowRadius,
        );

        const neutralFill = isDark
          ? `rgba(255,255,255,${node.alpha})`
          : `rgba(19,19,19,${node.alpha * 0.92})`;

        if (node.accent === 0) {
          glow.addColorStop(0, `rgba(184,66,61,${node.alpha * 0.22})`);
          glow.addColorStop(0.6, `rgba(184,66,61,${node.alpha * 0.08})`);
          glow.addColorStop(1, "rgba(184,66,61,0)");
        } else if (isDark) {
          glow.addColorStop(0, `rgba(255,255,255,${node.alpha * 0.22})`);
          glow.addColorStop(0.6, `rgba(255,255,255,${node.alpha * 0.08})`);
          glow.addColorStop(1, "rgba(255,255,255,0)");
        } else {
          glow.addColorStop(0, `rgba(0,0,0,${node.alpha * 0.14})`);
          glow.addColorStop(0.6, `rgba(0,0,0,${node.alpha * 0.05})`);
          glow.addColorStop(1, "rgba(0,0,0,0)");
        }

        ctx.fillStyle = glow;
        ctx.beginPath();
        ctx.arc(node.x, node.y, glowRadius, 0, Math.PI * 2);
        ctx.fill();

        ctx.beginPath();
        ctx.arc(node.x, node.y, Math.max(0.9, node.radius), 0, Math.PI * 2);
        ctx.fillStyle =
          node.accent === 0
            ? `rgba(153,51,49,${node.alpha * 0.98})`
            : neutralFill;
        ctx.fill();
      }
    };

    initOrResize();

    rafRef.current = window.requestAnimationFrame(drawFrame);

    const handleResize = () => {
      if (resizeTimerRef.current) {
        window.clearTimeout(resizeTimerRef.current);
      }

      resizeTimerRef.current = window.setTimeout(() => {
        initOrResize();
        resizeTimerRef.current = null;
      }, 120);
    };

    let resizeObserver: ResizeObserver | null = null;

    if (mode === "parent") {
      const parent = canvas.parentElement;

      if (typeof ResizeObserver !== "undefined" && parent) {
        resizeObserver = new ResizeObserver(() => {
          handleResize();
        });
        resizeObserver.observe(parent);
      } else {
        window.addEventListener("resize", handleResize);
      }
    } else {
      window.addEventListener("resize", handleResize);
    }

    return () => {
      if (resizeObserver) {
        resizeObserver.disconnect();
      } else {
        window.removeEventListener("resize", handleResize);
      }

      themeObserver.disconnect();

      if (rafRef.current !== null) {
        window.cancelAnimationFrame(rafRef.current);
      }

      if (resizeTimerRef.current !== null) {
        window.clearTimeout(resizeTimerRef.current);
      }
    };
  }, [density, maxDist, speed, variant, mode, edgeMargin, zoom, spread, depth]);

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