"use client";
import { WINDOWS } from "@/app/(overwolf)/lib/config";
import { useCurrentWindow } from "@/app/(overwolf)/lib/windows";
import { useSettingsStore } from "@/app/lib/storage";
import { LatLngBoundsExpression } from "leaflet";
import { useEffect } from "react";
import { createCanvasLayer } from "./canvas-layer";
import { useMap } from "./map";

export const BOUNDS: LatLngBoundsExpression = [
  [0, 0],
  [-190, 190],
];
export const MIN_NATIVE_ZOOM = 0;
export const MAX_NATIVE_ZOOM = 6;
export const TILE_SIZE = 512;

export default function Tiles() {
  const currentWindow = useCurrentWindow();
  const map = useMap();
  const settingsStore = useSettingsStore();
  const isOverlay = currentWindow?.name === WINDOWS.OVERLAY;

  useEffect(() => {
    if (isOverlay && settingsStore.overlayTransparentMode) {
      return;
    }
    const canvasLayer = createCanvasLayer("/map_tiles/{z}/{y}/{x}.webp", {
      minNativeZoom: MIN_NATIVE_ZOOM,
      maxNativeZoom: MAX_NATIVE_ZOOM,
      minZoom: map.getMinZoom(),
      maxZoom: map.getMaxZoom(),
      bounds: BOUNDS,
      tileSize: TILE_SIZE,
      updateInterval: 100,
      keepBuffer: 8,
    }).addTo(map);

    return () => {
      canvasLayer.remove();
    };
  }, [isOverlay, settingsStore.overlayTransparentMode, map]);

  return <></>;
}
