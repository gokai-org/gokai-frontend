"use client";

import { memo, useMemo } from "react";
import { Handle, Position } from "reactflow";
import { motion } from "framer-motion";
import { Home, Pencil, Headphones, Book, Mic } from "lucide-react";
import { GraphNodeData } from "@/features/graph/lib/graphTypes";

interface CustomNodeProps {
  data: GraphNodeData;
  isConnectable: boolean;
}

const iconMap = {
  home: Home,
  writing: Pencil,
  listening: Headphones,
  reading: Book,
  speaking: Mic,
};

function CustomNode({ data, isConnectable }: CustomNodeProps) {
  const Icon = iconMap[data.type];
  const isHome = data.type === "home";
  const delay = useMemo(() => {
    const seed = (data.type + (data.label ?? ""))
      .split("")
      .reduce((acc, ch, i) => acc + ch.charCodeAt(0) * (i + 1), 0);
    const x = Math.sin(seed * 127.1) * 43758.5453;
    return (x - Math.floor(x)) * 0.2;
  }, [data.type, data.label]);

  const getNodeStyles = () => {
    if (data.status === "completed") {
      return {
        bg: "bg-gradient-to-br from-[#993331] to-[#7a2826]",
        icon: "text-white",
        ring: "ring-4 ring-[#993331]/20",
        shadow: "shadow-xl shadow-[#993331]/30",
        glow: "before:absolute before:inset-0 before:rounded-full before:bg-[#993331]/20 before:blur-xl",
      };
    }
    if (data.status === "available") {
      return {
        bg: "bg-gradient-to-br from-[#993331]/70 to-[#7a2826]/60",
        icon: "text-white",
        ring: "ring-2 ring-[#993331]/15",
        shadow: "shadow-lg shadow-[#993331]/20",
        glow: "before:absolute before:inset-0 before:rounded-full before:bg-[#993331]/10 before:blur-lg",
      };
    }
    return {
      bg: "bg-gradient-to-br from-gray-100 to-gray-200",
      icon: "text-gray-400",
      ring: "ring-2 ring-gray-200",
      shadow: "shadow-md shadow-gray-300/30",
      glow: "",
    };
  };

  const styles = getNodeStyles();
  const size = isHome ? "w-28 h-28" : "w-20 h-20";
  const iconSize = isHome ? 44 : 28;

  return (
    <>
      {/* Handles con IDs únicos en cada posición */}
      <Handle
        id="target-top"
        type="target"
        position={Position.Top}
        isConnectable={isConnectable}
        style={{ opacity: 0 }}
      />
      <Handle
        id="target-bottom"
        type="target"
        position={Position.Bottom}
        isConnectable={isConnectable}
        style={{ opacity: 0 }}
      />
      <Handle
        id="target-left"
        type="target"
        position={Position.Left}
        isConnectable={isConnectable}
        style={{ opacity: 0 }}
      />
      <Handle
        id="target-right"
        type="target"
        position={Position.Right}
        isConnectable={isConnectable}
        style={{ opacity: 0 }}
      />
      <Handle
        id="source-top"
        type="source"
        position={Position.Top}
        isConnectable={isConnectable}
        style={{ opacity: 0 }}
      />
      <Handle
        id="source-bottom"
        type="source"
        position={Position.Bottom}
        isConnectable={isConnectable}
        style={{ opacity: 0 }}
      />
      <Handle
        id="source-left"
        type="source"
        position={Position.Left}
        isConnectable={isConnectable}
        style={{ opacity: 0 }}
      />
      <Handle
        id="source-right"
        type="source"
        position={Position.Right}
        isConnectable={isConnectable}
        style={{ opacity: 0 }}
      />

      <motion.div
        initial={{ scale: 0, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        whileHover={{
          scale: isHome ? 1.08 : 1.15,
          rotate: [0, -5, 5, 0],
          transition: { duration: 0.3 },
        }}
        whileTap={{ scale: 0.92 }}
        transition={{
          type: "spring",
          stiffness: 300,
          damping: 20,
          delay,
        }}
        className="relative"
      >
        {/* Glow effect */}
        <div className={styles.glow} />

        {/* Nodo principal */}
        <div
          className={`
            ${size} rounded-full ${styles.bg} ${styles.ring} ${styles.shadow}
            flex items-center justify-center
            cursor-pointer relative z-10
            transition-all duration-300
            hover:${styles.shadow}
          `}
        >
          {data.type === "writing" && data.symbol ? (
            <span className="text-4xl font-bold text-white leading-none">
              {data.symbol}
            </span>
          ) : (
            <Icon size={iconSize} className={styles.icon} strokeWidth={2.5} />
          )}

          {/* Indicador de progreso para nodo completado */}
          {data.status === "completed" && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute -top-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-2 border-white flex items-center justify-center shadow-md"
            >
              <svg
                className="w-3 h-3 text-white"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                  clipRule="evenodd"
                />
              </svg>
            </motion.div>
          )}

          {/* Indicador de bloqueado */}
          {data.status === "locked" && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute -top-1 -right-1 w-6 h-6 bg-gray-400 rounded-full border-2 border-white flex items-center justify-center shadow-md"
            >
              <svg
                className="w-3 h-3 text-white"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                  clipRule="evenodd"
                />
              </svg>
            </motion.div>
          )}
        </div>
      </motion.div>
    </>
  );
}

export default memo(CustomNode);
