"use client";
import { useOverwolfRouter } from "@/app/(overwolf)/components/overwolf-router";
import { HOTKEYS } from "@/app/(overwolf)/lib/config";
import leaflet, { LatLngBoundsExpression } from "leaflet";
import "leaflet/dist/leaflet.css";
import { useParams } from "next/navigation";
import { useEffect, useRef } from "react";
import { create } from "zustand";

export const useMapStore = create<{
  map: leaflet.Map | null;
  setMap: (map: leaflet.Map | null) => void;
}>((set) => ({
  map: null,
  setMap: (map) => set({ map }),
}));

export const MAX_BOUNDS: LatLngBoundsExpression = [
  [194, -194],
  [-388, 388],
];

export function useMap() {
  const map = useMapStore((store) => store.map);
  if (!map) throw new Error("MapContext not found");
  return map;
}

export default function Map({ children }: { children?: React.ReactNode }) {
  const mapRef = useRef<HTMLDivElement>(null);
  const { map, setMap } = useMapStore();
  const router = useOverwolfRouter();
  const params = useParams();

  useEffect(() => {
    const worldCRS = leaflet.extend({}, leaflet.CRS.Simple, {
      transformation: new leaflet.Transformation(1.65, 0, -1.65, 0),
    });

    const map = leaflet.map(mapRef.current!, {
      zoomControl: false,
      attributionControl: false,
      minZoom: 0,
      maxZoom: 8,
      zoomSnap: 0.5,
      zoomDelta: 0.5,
      wheelPxPerZoomLevel: 120,
      crs: worldCRS,
      maxBounds: MAX_BOUNDS,
      renderer: leaflet.canvas(),
    });

    const isOverwolf = "value" in router;
    const paramsCoordinates = isOverwolf
      ? router.value.coordinates
      : params.coordinates;
    const coordinates = (
      paramsCoordinates && decodeURIComponent(paramsCoordinates)
    )
      ?.replace("@", "")
      .split(",")
      .map(Number);
    if (coordinates) {
      map.setView(coordinates as [number, number], 8);
    } else {
      map.setView([-100, 100], 3);
    }

    setMap(map);

    map.on("click", (event) => {
      if (
        // @ts-ignore
        event.originalEvent.target.className !== "leaflet-zoom-animated" ||
        location.pathname.startsWith("/embed")
      ) {
        return;
      }
      if ("update" in router) {
        router.update({ name: "", coordinates: "" });
      } else {
        router.replace(`/${params.lang ?? ""}${location.search}`);
      }
    });

    map.on("contextmenu", () => {
      // Do nothing
    });

    if (typeof overwolf !== "undefined") {
      overwolf.settings.hotkeys.onPressed.addListener((event) => {
        if (event.name === HOTKEYS.ZOOM_IN_APP) {
          map.zoomIn();
        } else if (event.name === HOTKEYS.ZOOM_OUT_APP) {
          map.zoomOut();
        }
      });
    }

    return () => {
      setMap(null);
      // map.remove();
    };
  }, []);

  return (
    <>
      <div
        ref={mapRef}
        className={`map h-full !bg-inherit relative outline-none`}
      />
      {map && children}
    </>
  );
}
