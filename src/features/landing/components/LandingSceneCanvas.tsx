"use client";

import { useEffect, useRef } from "react";
import { useLandingScrollTimeline } from "@/features/landing/hooks/useLandingScrollTimeline";
import { useLandingScene } from "@/features/landing/hooks/useLandingScene";
import type { LandingSceneState } from "@/features/landing/types";
import { clamp, lerp } from "@/features/landing/lib/landingSceneMath";

type MorphShapeId =
  | "heroOrb"
  | "writeBloom"
  | "readWave"
  | "thinkCore"
  | "speakBurst"
  | "listenHalo"
  | "ambient";

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

type ShapePose = {
  shape: MorphShapeId;
  spread: number;
};

const SECTION_SHAPES: Record<string, ShapePose> = {
  inicio: { shape: "heroOrb", spread: 1 },
  caracteristicas: { shape: "writeBloom", spread: 0.98 },
  leer: { shape: "readWave", spread: 1.06 },
  pensar: { shape: "thinkCore", spread: 0.94 },
  hablar: { shape: "speakBurst", spread: 1.1 },
  escuchar: { shape: "listenHalo", spread: 1.02 },
  "como-funciona": { shape: "ambient", spread: 1.14 },
  experiencia: { shape: "ambient", spread: 1 },
  planes: { shape: "ambient", spread: 0.9 },
  contacto: { shape: "ambient", spread: 0.84 },
};

function getSectionPose(sectionId: string | null | undefined): ShapePose {
  return SECTION_SHAPES[sectionId ?? "inicio"] ?? SECTION_SHAPES.inicio;
}

function createNodes(count: number): BaseNode[] {
  return Array.from({ length: count }, (_, id) => ({
    id,
    seed: Math.random() * Math.PI * 2,
    seed2: Math.random() * Math.PI * 2,
    angle: (id / count) * Math.PI * 2,
    radial: 0.18 + Math.random() * 0.82,
    height: Math.random() * 2 - 1,
    depth: Math.random() * 2 - 1,
    size: 1.15 + Math.random() * 2.65,
    cluster: id % 6,
    phase: Math.random() * Math.PI * 2,
    orbit: 0.24 + Math.random() * 0.78,
    bias: Math.random() * 2 - 1,
  }));
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

function easeInOutCubic(t: number) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

function mix(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

function getShapePosition(node: BaseNode, shape: MorphShapeId, time: number) {
  const a = node.angle + node.seed * 0.35;
  const r = node.radial;
  const h = node.height;
  const d = node.depth;

  switch (shape) {
    case "heroOrb": {
      const ring = 0.18 * Math.sin(time * 0.9 + node.phase);
      return {
        x: Math.cos(a) * (0.56 + r * 0.72 + ring),
        y: Math.sin(a * 1.15) * (0.42 + r * 0.56),
        z: d * 0.9 + Math.sin(a * 2 + time * 0.5) * 0.18,
      };
    }

    case "writeBloom": {
      const petal = 1 + 0.34 * Math.sin(4 * a + time * 0.8 + node.seed);
      return {
        x: Math.cos(a) * (0.28 + r * 0.7) * petal,
        y: Math.sin(a) * (0.42 + r * 0.9) * (0.82 + 0.28 * Math.cos(2 * a)),
        z: d * 0.72 + Math.sin(3 * a + node.phase) * 0.16,
      };
    }

    case "readWave": {
      const wave = Math.sin(a * 2.6 + time * 0.7 + node.seed) * 0.26;
      return {
        x: (node.bias * 1.1 + Math.cos(a) * 0.24) * (0.7 + r * 0.55),
        y: h * 0.92 + wave,
        z: d * 0.86 + Math.cos(a * 1.8 + time * 0.4) * 0.12,
      };
    }

    case "thinkCore": {
      const spiral = 0.18 + r * 0.82;
      return {
        x: Math.cos(a * 1.8 + r * 2.4) * spiral * 0.72,
        y: Math.sin(a * 1.8 + r * 2.4) * spiral * 0.72,
        z: mix(d * 0.96, 0, 0.18) + Math.cos(a * 2.2 + time * 0.55) * 0.22,
      };
    }

    case "speakBurst": {
      const burst = 0.48 + r * (0.52 + 0.34 * Math.sin(3 * a + time * 0.9));
      return {
        x: Math.cos(a) * burst,
        y: Math.sin(a) * burst * 0.76,
        z: d * 0.84 + Math.sin(5 * a + node.phase) * 0.2,
      };
    }

    case "listenHalo": {
      const outer = 0.62 + 0.12 * Math.sin(time * 0.6 + node.seed);
      return {
        x: Math.cos(a) * outer * (0.82 + r * 0.34),
        y: Math.sin(a) * outer * (0.82 + r * 0.34),
        z: d * 0.74 + Math.sin(a * 2 + time * 0.7) * 0.28,
      };
    }

    case "ambient":
    default:
      return {
        x: Math.cos(a) * (0.46 + r * 0.64),
        y: Math.sin(a * 1.2) * (0.4 + r * 0.54),
        z: d * 0.82,
      };
  }
}

function getMorphPosition(
  node: BaseNode,
  fromPose: ShapePose,
  toPose: ShapePose,
  blend: number,
  time: number,
) {
  const t = easeInOutCubic(clamp(blend, 0, 1));
  const from = getShapePosition(node, fromPose.shape, time);
  const to = getShapePosition(node, toPose.shape, time);

  return {
    x: mix(from.x * fromPose.spread, to.x * toPose.spread, t),
    y: mix(from.y * fromPose.spread, to.y * toPose.spread, t),
    z: mix(from.z, to.z, t),
  };
}

export function LandingSceneCanvas({ sectionIds }: { sectionIds: string[] }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const frameRef = useRef<number | null>(null);
  const pointerRef = useRef({ x: -9999, y: -9999 });
  const nodesRef = useRef<BaseNode[]>([]);
  const isDarkRef = useRef(false);

  const timeline = useLandingScrollTimeline(sectionIds);
  const scene = useLandingScene(timeline);

  const sceneRef = useRef(scene);
  const viewportRef = useRef(timeline.viewport);
  const timelineRef = useRef({
    activeProgress: timeline.activeProgress,
    globalProgress: timeline.globalProgress,
    blendToNext: timeline.blendToNext,
    activeId: timeline.activeId,
    nextId: timeline.nextId,
  });

  useEffect(() => {
    sceneRef.current = scene;
  }, [scene]);

  useEffect(() => {
    viewportRef.current = timeline.viewport;
  }, [timeline.viewport]);

  useEffect(() => {
    timelineRef.current = {
      activeProgress: timeline.activeProgress,
      globalProgress: timeline.globalProgress,
      blendToNext: timeline.blendToNext,
      activeId: timeline.activeId,
      nextId: timeline.nextId,
    };
  }, [
    timeline.activeId,
    timeline.nextId,
    timeline.activeProgress,
    timeline.globalProgress,
    timeline.blendToNext,
  ]);

  useEffect(() => {
    nodesRef.current = createNodes(scene.nodeCount);
  }, [scene.nodeCount]);

  useEffect(() => {
    const onPointerMove = (event: PointerEvent) => {
      pointerRef.current = {
        x: event.clientX,
        y: event.clientY,
      };
    };

    const onPointerLeave = () => {
      pointerRef.current = { x: -9999, y: -9999 };
    };

    window.addEventListener("pointermove", onPointerMove, { passive: true });
    window.addEventListener("pointerleave", onPointerLeave);

    return () => {
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerleave", onPointerLeave);
    };
  }, []);

  useEffect(() => {
    if (typeof document === "undefined") return;

    const root = document.documentElement;

    const updateThemeMode = () => {
      isDarkRef.current = root.classList.contains("dark");
    };

    updateThemeMode();

    const observer = new MutationObserver(() => {
      updateThemeMode();
    });

    observer.observe(root, {
      attributes: true,
      attributeFilter: ["class"],
    });

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => {
      const { width, height, dpr } = viewportRef.current;
      canvas.width = Math.max(1, Math.floor(width * dpr));
      canvas.height = Math.max(1, Math.floor(height * dpr));
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const drawBackground = (
      width: number,
      height: number,
      activeScene: LandingSceneState,
      anchorX: number,
      anchorY: number,
    ) => {
      ctx.clearRect(0, 0, width, height);

      const closeUp = activeScene.howCloseUp ?? 0;
      const fadeStrength = lerp(0.6, 1.15, activeScene.backgroundFade);

      const radial = ctx.createRadialGradient(
        anchorX,
        anchorY,
        0,
        anchorX,
        anchorY,
        Math.max(width, height) * lerp(0.34, 0.88, closeUp),
      );

      if (isDarkRef.current) {
        radial.addColorStop(
          0,
          `rgba(153,51,49,${(0.04 + closeUp * 0.06) * fadeStrength})`,
        );
        radial.addColorStop(
          0.5,
          `rgba(153,51,49,${(0.015 + closeUp * 0.025) * fadeStrength})`,
        );
        radial.addColorStop(1, "rgba(0,0,0,0)");
      } else {
        radial.addColorStop(
          0,
          `rgba(153,51,49,${(0.025 + closeUp * 0.035) * fadeStrength})`,
        );
        radial.addColorStop(
          0.5,
          `rgba(153,51,49,${(0.01 + closeUp * 0.015) * fadeStrength})`,
        );
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
      vignette.addColorStop(0.7, "rgba(0,0,0,0)");
      vignette.addColorStop(
        1,
        `rgba(0,0,0,${lerp(0.02, 0.18, activeScene.vignette)})`,
      );

      ctx.fillStyle = vignette;
      ctx.fillRect(0, 0, width, height);
    };

    resize();

    const render = (timestamp: number) => {
      frameRef.current = window.requestAnimationFrame(render);

      const activeScene = sceneRef.current;
      const motionState = timelineRef.current;
      const { width, height, dpr, reducedMotion, isMobile } =
        viewportRef.current;
      const isDark = isDarkRef.current;

      if (!width || !height) return;

      if (
        canvas.width !== Math.floor(width * dpr) ||
        canvas.height !== Math.floor(height * dpr)
      ) {
        resize();
      }

      const currentPose = getSectionPose(motionState.activeId);
      const nextPose = getSectionPose(
        motionState.nextId ?? motionState.activeId,
      );

      const time = timestamp * 0.00042;

      const closeUp = clamp(activeScene.howCloseUp ?? 0, 0, 1);
      const centerPull = clamp(activeScene.centerPull ?? 0, 0, 1);
      const cinematicZoom = activeScene.cinematicZoom ?? 1;

      const spreadX = lerp(
        1,
        activeScene.spreadX * (isMobile ? 1.03 : 1.08),
        closeUp,
      );

      const spreadY = lerp(
        1,
        activeScene.spreadY * (isMobile ? 1.02 : 1.06),
        closeUp,
      );

      const sceneDepth = lerp(
        1,
        activeScene.depth * (isMobile ? 1.18 : 1.32),
        closeUp,
      );

      const baseAnchorX =
        width * ((isMobile ? 0.5 : 0.66) + activeScene.focusX * 0.16);

      const baseAnchorY = height * (0.5 + activeScene.focusY * 0.18);

      const anchorX = lerp(baseAnchorX, width * 0.5, centerPull);
      const anchorY = lerp(baseAnchorY, height * 0.5, centerPull);

      const zoomBoost = lerp(1, cinematicZoom, closeUp * 0.38);

      const scale =
        Math.min(width, height) *
        lerp(0.4, isMobile ? 0.52 : 0.6, closeUp) *
        activeScene.zoom *
        zoomBoost;

      const cameraDistance = lerp(2.8, isMobile ? 2.45 : 2.18, closeUp);

      drawBackground(width, height, activeScene, anchorX, anchorY);

      const drawNodes: ProjectedNode[] = [];
      const pointer = pointerRef.current;

      const repulsionRadius = reducedMotion
        ? 0
        : lerp(160, 220, closeUp) *
          lerp(0.9, 1.25, activeScene.pointerInfluence * 10);
      const repulsionStrength = reducedMotion
        ? 0
        : lerp(36, 72, closeUp) *
          lerp(0.8, 1.35, activeScene.pointerInfluence * 10);

      for (const node of nodesRef.current) {
        const morph = getMorphPosition(
          node,
          currentPose,
          nextPose,
          motionState.blendToNext,
          time,
        );

        const orbitX =
          Math.cos(time * (0.8 + node.orbit) + node.seed) *
          0.06 *
          activeScene.drift;

        const orbitY =
          Math.sin(time * (0.7 + node.orbit) + node.phase) *
          0.06 *
          activeScene.drift;

        const orbitZ =
          Math.sin(time * (0.5 + node.orbit) + node.seed2) *
          0.08 *
          activeScene.drift;

        let x = (morph.x + orbitX) * spreadX;
        let y = (morph.y + orbitY) * spreadY;
        let z = (morph.z + orbitZ) * sceneDepth;

        z -= closeUp * (isMobile ? 0.65 : 1.05);

        const rotatedY = rotateY(x, z, activeScene.rotationY);
        x = rotatedY.x;
        z = rotatedY.z;

        const rotatedX = rotateX(y, z, activeScene.rotationX);
        y = rotatedX.y;
        z = rotatedX.z;

        const depth = cameraDistance / Math.max(0.65, cameraDistance + z);

        let screenX = anchorX + x * scale * depth;
        let screenY = anchorY + y * scale * depth;

        const dx = screenX - pointer.x;
        const dy = screenY - pointer.y;
        const distance = Math.hypot(dx, dy);

        let repelFactor = 0;

        if (repulsionRadius > 0 && distance < repulsionRadius) {
          const safeDistance = Math.max(0.001, distance);
          repelFactor = 1 - safeDistance / repulsionRadius;

          const directionX = dx / safeDistance;
          const directionY = dy / safeDistance;

          const force =
            repulsionStrength *
            repelFactor *
            repelFactor *
            (0.72 + depth * 0.45);

          screenX += directionX * force;
          screenY += directionY * force;
        }

        const pulse = reducedMotion
          ? 1
          : 1 + Math.sin(time * 1.4 + node.phase) * lerp(0.08, 0.16, closeUp);

        const radiusBoost = lerp(1, isMobile ? 1.55 : 1.95, closeUp);

        const radius =
          node.size *
          depth *
          (0.72 + activeScene.glow * 0.44) *
          pulse *
          radiusBoost *
          (1 + repelFactor * 0.2);

        const alphaBoost = lerp(1, 1.18, closeUp);

        const alpha =
          activeScene.nodeAlpha *
          alphaBoost *
          clamp(0.28 + depth * 0.74 + repelFactor * 0.08, 0.16, 1);

        drawNodes.push({
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

      const edgeBoost = lerp(1, 1.5, closeUp);

      for (let i = 0; i < drawNodes.length; i += 1) {
        const a = drawNodes[i];

        for (let j = i + 1; j < drawNodes.length; j += 1) {
          const b = drawNodes[j];
          const distance = Math.hypot(a.x - b.x, a.y - b.y);

          if (distance > activeScene.maxLinkDistance) continue;

          const alpha =
            (1 - distance / activeScene.maxLinkDistance) *
            activeScene.edgeAlpha *
            edgeBoost;

          const mx = (a.x + b.x) * 0.5;
          const my = (a.y + b.y) * 0.5;
          const bend =
            Math.sin((a.x + b.y) * 0.003 + time) * lerp(10, 24, closeUp);

          ctx.strokeStyle = `rgba(153,51,49,${alpha * 0.46})`;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.quadraticCurveTo(mx, my + bend, b.x, b.y);
          ctx.stroke();
        }
      }

      for (const node of drawNodes.sort((a, b) => a.z - b.z)) {
        const glow = ctx.createRadialGradient(
          node.x,
          node.y,
          0,
          node.x,
          node.y,
          node.radius * lerp(3.6, 5.4, closeUp),
        );

        const neutralNodeFill = isDark
          ? `rgba(255,255,255,${node.alpha})`
          : `rgba(16,16,16,${node.alpha * 0.92})`;

        if (node.accent === 0) {
          glow.addColorStop(0, `rgba(184,66,61,${node.alpha * 0.22})`);
          glow.addColorStop(0.6, `rgba(184,66,61,${node.alpha * 0.08})`);
          glow.addColorStop(1, "rgba(184,66,61,0)");
        } else {
          if (isDark) {
            glow.addColorStop(0, `rgba(255,255,255,${node.alpha * 0.24})`);
            glow.addColorStop(0.6, `rgba(255,255,255,${node.alpha * 0.08})`);
            glow.addColorStop(1, "rgba(255,255,255,0)");
          } else {
            glow.addColorStop(0, `rgba(0,0,0,${node.alpha * 0.18})`);
            glow.addColorStop(0.6, `rgba(0,0,0,${node.alpha * 0.06})`);
            glow.addColorStop(1, "rgba(0,0,0,0)");
          }
        }

        ctx.fillStyle = glow;
        ctx.beginPath();
        ctx.arc(
          node.x,
          node.y,
          node.radius * lerp(3.6, 5.4, closeUp),
          0,
          Math.PI * 2,
        );
        ctx.fill();

        ctx.fillStyle =
          node.accent === 0
            ? `rgba(153,51,49,${node.alpha * 0.98})`
            : neutralNodeFill;

        const finalRadius = Math.max(0.8, node.radius);

        ctx.beginPath();
        ctx.arc(node.x, node.y, finalRadius, 0, Math.PI * 2);
        ctx.fill();
      }
    };

    frameRef.current = window.requestAnimationFrame(render);
    window.addEventListener("resize", resize);

    return () => {
      window.removeEventListener("resize", resize);
      if (frameRef.current !== null) {
        window.cancelAnimationFrame(frameRef.current);
      }
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 h-full w-full"
      aria-hidden="true"
    />
  );
}
