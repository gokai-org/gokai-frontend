import type { Viewport } from "reactflow";
import {
  LESSON_DRAWER_DESKTOP_WIDTH,
  LESSON_DRAWER_MAX_VIEWPORT_RATIO,
} from "@/features/lessons/lib/drawerLayout";

const DESKTOP_DRAWER_BREAKPOINT = 1024;

interface DrawerAwareViewportOptions {
  focusX: number;
  focusY: number;
  zoom: number;
  viewportWidth: number;
  viewportHeight: number;
  drawerOpen: boolean;
}

function getDesktopDrawerWidth(viewportWidth: number) {
  return Math.min(
    LESSON_DRAWER_DESKTOP_WIDTH,
    viewportWidth * LESSON_DRAWER_MAX_VIEWPORT_RATIO,
  );
}

export function getDrawerAwareFocusViewport({
  focusX,
  focusY,
  zoom,
  viewportWidth,
  viewportHeight,
  drawerOpen,
}: DrawerAwareViewportOptions): Viewport {
  const shouldOffsetForDrawer =
    drawerOpen && viewportWidth >= DESKTOP_DRAWER_BREAKPOINT;
  const drawerWidth = shouldOffsetForDrawer
    ? getDesktopDrawerWidth(viewportWidth)
    : 0;
  const targetScreenX = shouldOffsetForDrawer
    ? (viewportWidth - drawerWidth) / 2
    : viewportWidth / 2;

  return {
    x: targetScreenX - focusX * zoom,
    y: viewportHeight / 2 - focusY * zoom,
    zoom,
  };
}