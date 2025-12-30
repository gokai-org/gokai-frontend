"use client";

import React, { useEffect, useMemo, useState } from "react";
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  Node,
  Edge,
  Position,
  NodeProps,
  EdgeProps,
  BaseEdge,
  getStraightPath,
} from "reactflow";
import { AnimatePresence, motion } from "framer-motion";
import "reactflow/dist/style.css";

type IconKind = "home" | "write" | "read" | "listen" | "speak" | "mic";

type CircleData = {
  kind: IconKind;
  accent?: boolean;
  size?: number;
  seed?: number;
  title?: string;
  desc?: string;
  status?: "locked" | "active" | "done";
};

type SelectedNode = {
  id: string;
  title: string;
  desc: string;
  kind: IconKind;
  status?: "locked" | "active" | "done";
  accent?: boolean;
};

function CircleNode({ data }: NodeProps<CircleData>) {
  const size = data.size ?? 96;
  const accent = !!data.accent;
  const seed = data.seed ?? 0;

  const ring = accent ? "rgba(153,51,49,0.18)" : "rgba(153,51,49,0.10)";
  const glow = accent ? "rgba(153,51,49,0.22)" : "rgba(0,0,0,0.10)";

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.86, y: 16, filter: "blur(10px)" }}
      animate={{ opacity: 1, scale: 1, y: 0, filter: "blur(0px)" }}
      transition={{
        type: "spring",
        stiffness: 170,
        damping: 18,
        delay: 0.06 + seed * 0.03,
      }}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.98 }}
      style={{ width: size, height: size, borderRadius: 9999, position: "relative" }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          borderRadius: 9999,
          boxShadow: `0 0 0 ${accent ? 16 : 14}px ${ring}, 0 18px 55px ${glow}`,
          pointerEvents: "none",
        }}
      />

      <div
        style={{
          width: size,
          height: size,
          borderRadius: 9999,
          background: "white",
          display: "grid",
          placeItems: "center",
          border: "1px solid rgba(0,0,0,0.06)",
          boxShadow: "0 14px 40px rgba(0,0,0,0.10)",
          overflow: "hidden",
          position: "relative",
          transform: "translateZ(0)",
        }}
      >
        <motion.div
          animate={{
            opacity: accent ? [0.45, 0.8, 0.45] : [0.25, 0.5, 0.25],
            scale: accent ? [0.98, 1.03, 0.98] : [0.99, 1.04, 0.99],
          }}
          transition={{
            duration: accent ? 2.6 : 3.2,
            repeat: Infinity,
            ease: "easeInOut",
            delay: seed * 0.06,
          }}
          style={{
            position: "absolute",
            inset: -12,
            borderRadius: 9999,
            background:
              "radial-gradient(closest-side, rgba(153,51,49,0.18), rgba(153,51,49,0.06), transparent 65%)",
            filter: "blur(10px)",
            pointerEvents: "none",
          }}
        />

        <motion.div
          animate={{ y: [0, -3, 0] }}
          transition={{
            duration: 2.4 + (seed % 6) * 0.15,
            repeat: Infinity,
            ease: "easeInOut",
            delay: (seed % 7) * 0.12,
          }}
          style={{ display: "grid", placeItems: "center" }}
        >
          <Icon kind={data.kind} accent={accent} />
        </motion.div>

        <div
          style={{
            position: "absolute",
            inset: "-30%",
            background: "radial-gradient(circle at 30% 25%, rgba(255,255,255,0.65), transparent 55%)",
            transform: "rotate(15deg)",
            pointerEvents: "none",
            opacity: 0.22,
            mixBlendMode: "soft-light",
          }}
        />
      </div>
    </motion.div>
  );
}

function Icon({ kind, accent }: { kind: IconKind; accent?: boolean }) {
  const stroke = accent ? "#993331" : "#9aa0a6";
  const fill = accent ? "rgba(153,51,49,0.22)" : "rgba(0,0,0,0.06)";

  switch (kind) {
    case "home":
      return (
        <svg width="46" height="46" viewBox="0 0 24 24" fill="none">
          <path
            d="M4 10.5L12 4l8 6.5V20a1 1 0 0 1-1 1h-5v-6H10v6H5a1 1 0 0 1-1-1v-9.5Z"
            stroke={stroke}
            strokeWidth="2.2"
            strokeLinejoin="round"
          />
          <circle cx="12" cy="12" r="9.6" fill={accent ? "rgba(153,51,49,0.05)" : "rgba(0,0,0,0.02)"} />
        </svg>
      );
    case "write":
      return (
        <svg width="46" height="46" viewBox="0 0 24 24" fill="none">
          <path
            d="M4 20h4l10.5-10.5a2 2 0 0 0 0-2.8l-.2-.2a2 2 0 0 0-2.8 0L5 17v3Z"
            stroke={stroke}
            strokeWidth="2.2"
            strokeLinejoin="round"
          />
          <path d="M13.5 6.5l4 4" stroke={stroke} strokeWidth="2.2" strokeLinecap="round" />
        </svg>
      );
    case "read":
      return (
        <svg width="46" height="46" viewBox="0 0 24 24" fill="none">
          <path
            d="M4 5.5c4.5 0 6.5 1.5 8 3 1.5-1.5 3.5-3 8-3V19c-4.5 0-6.5 1.5-8 3-1.5-1.5-3.5-3-8-3V5.5Z"
            stroke={stroke}
            strokeWidth="2.2"
            strokeLinejoin="round"
          />
        </svg>
      );
    case "listen":
      return (
        <svg width="46" height="46" viewBox="0 0 24 24" fill="none">
          <path d="M4 12a8 8 0 0 1 16 0v5a3 3 0 0 1-3 3h-1" stroke={stroke} strokeWidth="2.2" strokeLinecap="round" />
          <path d="M6 12v4a2 2 0 0 0 2 2h1" stroke={stroke} strokeWidth="2.2" strokeLinecap="round" />
          <rect x="3" y="12" width="4" height="6" rx="2" fill={fill} />
          <rect x="17" y="12" width="4" height="6" rx="2" fill={fill} />
        </svg>
      );
    case "speak":
    case "mic":
      return (
        <svg width="46" height="46" viewBox="0 0 24 24" fill="none">
          <path d="M12 14a3 3 0 0 0 3-3V7a3 3 0 0 0-6 0v4a3 3 0 0 0 3 3Z" stroke={stroke} strokeWidth="2.2" strokeLinejoin="round" />
          <path d="M19 11a7 7 0 0 1-14 0" stroke={stroke} strokeWidth="2.2" strokeLinecap="round" />
          <path d="M12 18v3" stroke={stroke} strokeWidth="2.2" strokeLinecap="round" />
        </svg>
      );
    default:
      return null;
  }
}

function DrawEdge(props: EdgeProps) {
  const { id, sourceX, sourceY, targetX, targetY, data } = props;
  const [path] = getStraightPath({ sourceX, sourceY, targetX, targetY });

  const kind = (data?.kind as "red" | "grey" | undefined) ?? "grey";
  const isRed = kind === "red";
  const delay = (data?.delay as number | undefined) ?? 0;

  const baseStroke = isRed ? "rgba(153,51,49,0.26)" : "rgba(0,0,0,0.18)";
  const glowStroke = isRed ? "rgba(153,51,49,0.34)" : "rgba(0,0,0,0.12)";
  const topStroke = isRed ? "rgba(153,51,49,0.55)" : "rgba(0,0,0,0.35)";

  return (
    <>
      <BaseEdge id={`${id}-base`} path={path} style={{ stroke: baseStroke, strokeWidth: 3.4 }} />
      <BaseEdge
        id={`${id}-glow`}
        path={path}
        style={{
          stroke: glowStroke,
          strokeWidth: 6,
          filter: isRed
            ? "drop-shadow(0px 0px 14px rgba(153,51,49,0.22))"
            : "drop-shadow(0px 0px 14px rgba(0,0,0,0.12))",
        }}
      />
      <motion.path
        d={path}
        fill="none"
        stroke={topStroke}
        strokeWidth={2.8}
        strokeLinecap="round"
        strokeDasharray="10 14"
        style={{ pointerEvents: "none" }}
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 1 }}
        transition={{ duration: 0.8, ease: "easeInOut", delay }}
      />
    </>
  );
}

const nodeTypes = { circle: CircleNode };
const edgeTypes = { draw: DrawEdge };

export default function GraphInteractive() {
  const [selected, setSelected] = useState<SelectedNode | null>(null);

  const nodes = useMemo<Node<CircleData>[]>(() => {
    return [
      {
        id: "home",
        type: "circle",
        position: { x: 520, y: 320 },
        data: { kind: "home", accent: true, size: 120, seed: 1, title: "Inicio", desc: "Nodo central del progreso.", status: "active" },
        sourcePosition: Position.Right,
        targetPosition: Position.Left,
      },
      { id: "L1", type: "circle", position: { x: 170, y: 210 }, data: { kind: "read", size: 80, seed: 2, title: "Lectura", desc: "Lección de lectura.", status: "done" } },
      { id: "L2", type: "circle", position: { x: 70, y: 120 }, data: { kind: "write", size: 110, seed: 3, title: "Escritura 1", desc: "Práctica de trazos.", status: "done" } },
      { id: "L3", type: "circle", position: { x: 70, y: 440 }, data: { kind: "write", size: 110, seed: 4, title: "Escritura 2", desc: "Kanji y precisión.", status: "active" } },
      { id: "T1", type: "circle", position: { x: 240, y: 30 }, data: { kind: "listen", size: 95, seed: 5, title: "Escucha", desc: "Comprensión auditiva.", status: "locked" } },
      { id: "T2", type: "circle", position: { x: 420, y: 90 }, data: { kind: "listen", size: 80, seed: 6, title: "Escucha 2", desc: "Listening intermedio.", status: "active" } },
      { id: "T3", type: "circle", position: { x: 520, y: 0 }, data: { kind: "write", size: 130, seed: 7, title: "Trazos Pro", desc: "Reto avanzado.", status: "locked" } },
      { id: "R1", type: "circle", position: { x: 760, y: 220 }, data: { kind: "read", size: 85, seed: 8, title: "Lectura 2", desc: "Lectura contextual.", status: "active" } },
      { id: "R2", type: "circle", position: { x: 900, y: 150 }, data: { kind: "listen", size: 70, seed: 9, title: "Audio 1", desc: "Ejercicio rápido.", status: "locked" } },
      { id: "R3", type: "circle", position: { x: 920, y: 310 }, data: { kind: "read", size: 120, seed: 10, title: "Lectura Pro", desc: "Comprensión avanzada.", status: "locked" } },
      { id: "R4", type: "circle", position: { x: 780, y: 360 }, data: { kind: "write", size: 120, seed: 11, title: "Escritura Pro", desc: "Reto de escritura.", status: "active" } },
      { id: "R5", type: "circle", position: { x: 930, y: 420 }, data: { kind: "write", size: 85, seed: 12, title: "Kanji 1", desc: "Lección corta.", status: "locked" } },
      { id: "B1", type: "circle", position: { x: 340, y: 520 }, data: { kind: "write", size: 125, seed: 13, title: "Escritura 3", desc: "Trazos + velocidad.", status: "active" } },
      { id: "B2", type: "circle", position: { x: 520, y: 520 }, data: { kind: "read", size: 75, seed: 14, title: "Lectura 3", desc: "Lectura guiada.", status: "active" } },
      { id: "B3", type: "circle", position: { x: 620, y: 560 }, data: { kind: "listen", size: 70, seed: 15, title: "Escucha 3", desc: "Escucha con IA.", status: "locked" } },
      { id: "B4", type: "circle", position: { x: 720, y: 520 }, data: { kind: "read", size: 70, seed: 16, title: "Lectura 4", desc: "Lectura breve.", status: "locked" } },
      { id: "B5", type: "circle", position: { x: 900, y: 560 }, data: { kind: "mic", size: 90, seed: 17, title: "Speaking", desc: "Habla y feedback.", status: "locked" } },
    ];
  }, []);

  const edges = useMemo<Edge[]>(() => {
    const d = (seed: number) => 0.35 + seed * 0.06;
    return [
      e("home", "L1", "grey", "e1", d(2)),
      e("home", "R4", "grey", "e2", d(11)),
      e("home", "R1", "grey", "e3", d(8)),
      e("home", "B2", "grey", "e4", d(14)),
      e("home", "T2", "red", "e5", d(6)),
      e("home", "L1", "red", "e6", d(2) + 0.15),

      e("L1", "L2", "grey", "e7", d(3)),
      e("L1", "T1", "red", "e8", d(5)),
      e("L1", "B1", "red", "e9", d(13)),

      e("T2", "T3", "grey", "e10", d(7)),
      e("T2", "R1", "grey", "e11", d(8)),

      e("R1", "R2", "red", "e12", d(9)),
      e("R1", "R3", "red", "e13", d(10)),

      e("R4", "R5", "grey", "e14", d(12)),
      e("R4", "B4", "red", "e15", d(16)),
      e("B4", "B5", "red", "e16", d(17)),

      e("B2", "B3", "red", "e17", d(15)),
      e("B2", "B1", "grey", "e18", d(13)),
    ];
  }, []);

  useEffect(() => {
    const onKey = (ev: KeyboardEvent) => {
      if (ev.key === "Escape") setSelected(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <div className="fixed inset-0 w-screen h-[100dvh] bg-black/0">
      {/* CANVAS */}
      <div className="relative h-full w-full overflow-hidden">
        <div className="absolute inset-0 rf-bg" />

        <ReactFlow
          style={{ width: "100%", height: "100%" }}
          nodes={nodes}
          edges={edges}
          nodeTypes={nodeTypes}
          edgeTypes={edgeTypes}
          fitView
          fitViewOptions={{ padding: 0.22 }}
          minZoom={0.45}
          maxZoom={2.0}
          nodesDraggable={false}
          nodesConnectable={false}
          elementsSelectable={false}
          proOptions={{ hideAttribution: true }}
          onNodeClick={(_, node) => {
            const d = node.data as CircleData | undefined;
            setSelected({
              id: node.id,
              title: d?.title ?? `Nodo ${node.id}`,
              desc: d?.desc ?? "Sin descripción por ahora.",
              kind: d?.kind ?? "read",
              status: d?.status,
              accent: d?.accent,
            });
          }}
        >
          <Background gap={26} size={1} color="rgba(0,0,0,0.04)" />
          <Controls showInteractive={false} />
          <MiniMap pannable zoomable style={{ opacity: 0 }} />
        </ReactFlow>

        {/* Panel desktop como overlay */}
        <div className="hidden lg:block absolute right-6 top-6 z-50 w-[380px]">
          <SidePanel selected={selected} onClose={() => setSelected(null)} />
        </div>
      </div>

      {/* Drawer mobile */}
      <div className="lg:hidden">
        <BottomDrawer selected={selected} onClose={() => setSelected(null)} />
      </div>

      <style jsx global>{`
        .rf-bg {
          background:
            radial-gradient(1200px 800px at 55% 45%, rgba(153, 51, 49, 0.10), transparent 55%),
            radial-gradient(900px 700px at 25% 70%, rgba(0, 0, 0, 0.06), transparent 52%),
            linear-gradient(180deg, #fbfbfb, #f3f3f3);
        }
        .rf-bg::after {
          content: "";
          position: absolute;
          inset: -40px;
          background: radial-gradient(closest-side, transparent 60%, rgba(0, 0, 0, 0.06));
          pointer-events: none;
          opacity: 0.75;
        }

        .react-flow__edges { z-index: 2; }
        .react-flow__nodes { z-index: 3; }

        /* ✅ evita scroll raro por el body */
        html, body {
          height: 100%;
          overflow: hidden;
        }
      `}</style>
    </div>
  );
}

function SidePanel({ selected, onClose }: { selected: SelectedNode | null; onClose: () => void }) {
  return (
    <div className="rounded-3xl bg-white/95 p-6 shadow-[0_20px_60px_rgba(0,0,0,0.12)] ring-1 ring-black/5 backdrop-blur">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold text-neutral-500">Detalle</p>
          <h3 className="mt-1 text-2xl font-extrabold tracking-tight">
            {selected ? selected.title : "Selecciona un nodo"}
          </h3>
        </div>

        <button
          onClick={onClose}
          className="rounded-full px-3 py-2 text-sm font-semibold text-neutral-700 hover:bg-black/5"
          type="button"
        >
          Cerrar
        </button>
      </div>

      <div className="mt-4">
        {selected ? (
          <>
            <div className="rounded-2xl bg-neutral-50 p-4 ring-1 ring-black/5">
              <div className="flex items-center gap-3">
                <div className="grid h-12 w-12 place-items-center rounded-2xl bg-[#993331]/10 ring-1 ring-[#993331]/15">
                  <Icon kind={selected.kind} accent={true} />
                </div>
                <div>
                  <p className="text-sm font-semibold text-neutral-900">{selected.title}</p>
                  <p className="text-xs text-neutral-500">
                    Estado: <span className="font-semibold">{selected.status ?? "—"}</span>
                  </p>
                </div>
              </div>

              <p className="mt-3 text-sm leading-relaxed text-neutral-700">{selected.desc}</p>
            </div>

            <div className="mt-4 space-y-2 text-sm text-neutral-700">
              <div className="rounded-xl bg-white p-3 ring-1 ring-black/5">
                Samuuuuuuuuuuu
              </div>
              <div className="rounded-xl bg-white p-3 ring-1 ring-black/5">
                Samuuuu
              </div>
            </div>
          </>
        ) : (
          <p className="text-sm text-neutral-600">Samuuuuu</p>
        )}
      </div>
    </div>
  );
}

function BottomDrawer({ selected, onClose }: { selected: SelectedNode | null; onClose: () => void }) {
  return (
    <AnimatePresence>
      {selected && (
        <>
          <motion.div
            className="fixed inset-0 z-40 bg-black/30"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            className="fixed bottom-0 left-0 right-0 z-50 rounded-t-3xl bg-white p-5 shadow-[0_-20px_60px_rgba(0,0,0,0.18)]"
            initial={{ y: 420 }}
            animate={{ y: 0 }}
            exit={{ y: 420 }}
            transition={{ type: "spring", stiffness: 220, damping: 26 }}
          >
            <div className="mx-auto mb-3 h-1.5 w-12 rounded-full bg-black/10" />

            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-semibold text-neutral-500">Detalle</p>
                <h3 className="mt-1 text-xl font-extrabold tracking-tight">{selected.title}</h3>
              </div>

              <button
                onClick={onClose}
                className="rounded-full px-3 py-2 text-sm font-semibold text-neutral-700 hover:bg-black/5"
                type="button"
              >
                Cerrar
              </button>
            </div>

            <div className="mt-3 rounded-2xl bg-neutral-50 p-4 ring-1 ring-black/5">
              <div className="flex items-center gap-3">
                <div className="grid h-12 w-12 place-items-center rounded-2xl bg-[#993331]/10 ring-1 ring-[#993331]/15">
                  <Icon kind={selected.kind} accent={true} />
                </div>
                <div>
                  <p className="text-sm font-semibold text-neutral-900">{selected.title}</p>
                  <p className="text-xs text-neutral-500">
                    Estado: <span className="font-semibold">{selected.status ?? "—"}</span>
                  </p>
                </div>
              </div>

              <p className="mt-3 text-sm leading-relaxed text-neutral-700">{selected.desc}</p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

function e(source: string, target: string, kind: "red" | "grey", id: string, delay: number): Edge {
  return { id, source, target, type: "draw", data: { kind, delay } };
}
