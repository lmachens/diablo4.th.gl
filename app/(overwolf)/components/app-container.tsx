import { useGameInfoStore } from "@/app/lib/storage/game-info";
import { useSettingsStore } from "@/app/lib/storage/settings";
import { ReactNode, useEffect } from "react";
import { setInputPassThrough } from "../lib/windows";

export default function AppContainer({ children }: { children: ReactNode }) {
  const settingsStore = useSettingsStore();
  const isOverlay = useGameInfoStore((state) => state.isOverlay);

  useEffect(() => {
    if (isOverlay) {
      setInputPassThrough(settingsStore.lockedWindow);
    }
  }, [settingsStore.lockedWindow]);

  return (
    <div
      className={`h-screen flex flex-col text-white app antialiased select-none overflow-hidden ${
        isOverlay ? (settingsStore.lockedWindow ? "locked" : "") : "bg-black"
      }`}
      style={
        isOverlay
          ? {
              willChange: "opacity",
              opacity: settingsStore.windowOpacity.toFixed(2),
            }
          : {}
      }
    >
      {children}
    </div>
  );
}
