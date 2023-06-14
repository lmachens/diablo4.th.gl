import { Mutate, StoreApi, create } from "zustand";
import { persist } from "zustand/middleware";
import { ICONS } from "./icons";

export const ALL_FILTERS = Object.keys(ICONS);

type StoreWithPersist<State = any> = Mutate<
  StoreApi<State>,
  [["zustand/persist", State]]
>;

export const withStorageDOMEvents = (store: StoreWithPersist) => {
  if (typeof window === "undefined") {
    return;
  }
  const storageEventCallback = (e: StorageEvent) => {
    try {
      if (e.key && e.key === store.persist.getOptions().name && e.newValue) {
        store.persist.rehydrate();
      }
    } catch (error) {
      console.error(error);
    }
  };

  window.addEventListener("storage", storageEventCallback);

  return () => {
    window.removeEventListener("storage", storageEventCallback);
  };
};

export const useDiscoveredNodesStore = create(
  persist<{
    discoveredNodes: string[];
    markDiscoveredNode: (node: string) => void;
    unmarkDiscoveredNode: (node: string) => void;
  }>(
    (set, get) => ({
      discoveredNodes: [],
      markDiscoveredNode: (node) =>
        set({ discoveredNodes: [...get().discoveredNodes, node] }),
      unmarkDiscoveredNode: (node) =>
        set({
          discoveredNodes: get().discoveredNodes.filter(
            (discoveredNode) => discoveredNode !== node
          ),
        }),
    }),
    {
      name: "discovered-nodes-storage",
    }
  )
);

withStorageDOMEvents(useDiscoveredNodesStore);

export const useAccountStore = create(
  persist<{
    isPatron: boolean;
    setIsPatron: (isPatron: boolean) => void;
  }>(
    (set) => ({
      isPatron: false,
      setIsPatron: (isPatron) => set({ isPatron }),
    }),
    {
      name: "account-storage",
    }
  )
);

withStorageDOMEvents(useAccountStore);

// App and Website
export const useGlobalSettingsStore = create(
  persist<{
    // App and Website
    showTerritoryNames: boolean;
    toggleShowTerritoryNames: () => void;
    iconSize: number;
    setIconSize: (iconSize: number) => void;
    filters: string[];
    setFilters: (filters: string[]) => void;
    showFilters: boolean;
    toggleShowFilters: () => void;
    showTimers: boolean;
    toggleShowTimers: () => void;
    showSidebar: boolean;
    toggleShowSidebar: () => void;
  }>(
    (set) => {
      let filters = ALL_FILTERS;
      if (typeof window !== "undefined" && typeof overwolf === "undefined") {
        const filtersString = new URLSearchParams(window.location.search).get(
          "filters"
        );
        if (filtersString) {
          filters = filtersString.split(",");
        }
      }

      return {
        showTerritoryNames: true,
        toggleShowTerritoryNames: () =>
          set((state) => ({
            showTerritoryNames: !state.showTerritoryNames,
          })),
        iconSize: 1,
        setIconSize: (iconSize) => set({ iconSize }),
        filters,
        setFilters: (filters) => set({ filters }),
        showFilters: false,
        toggleShowFilters: () =>
          set((state) => ({ showFilters: !state.showFilters })),
        showTimers: true,
        toggleShowTimers: () =>
          set((state) => ({ showTimers: !state.showTimers })),
        showSidebar:
          typeof document !== "undefined"
            ? document.body.clientWidth >= 768
            : false,
        toggleShowSidebar: () =>
          set((state) => ({
            showSidebar: !state.showSidebar,
          })),
      };
    },
    {
      name: "global-settings-storage",
      merge: (persistentState: any, currentState) => {
        if (
          typeof overwolf === "undefined" &&
          currentState.filters.length !== ALL_FILTERS.length
        ) {
          persistentState.filters = currentState.filters;
        }
        return { ...currentState, ...persistentState };
      },
    }
  )
);

// App only
export const useSettingsStore = create(
  persist<{
    overlayMode: boolean | null;
    setOverlayMode: (overlayMode: boolean) => void;
    overlayTransparentMode: boolean;
    setOverlayTransparentMode: (overlayTransparentMode: boolean) => void;
    windowOpacity: number;
    setWindowOpacity: (windowOpacity: number) => void;
    lockedWindow: boolean;
    setLockedWindow: (lockedWindow: boolean) => void;
    locale: string;
    setLocale: (locale: string) => void;
  }>(
    (set) => {
      return {
        overlayMode: null,
        setOverlayMode: (overlayMode) =>
          set({
            overlayMode,
          }),
        overlayTransparentMode: false,
        setOverlayTransparentMode: (overlayTransparentMode) =>
          set({ overlayTransparentMode }),
        windowOpacity: 1,
        setWindowOpacity: (windowOpacity) => set({ windowOpacity }),
        lockedWindow: false,
        setLockedWindow: (lockedWindow) => set({ lockedWindow }),
        locale: "en",
        setLocale: (locale) => set({ locale }),
      };
    },
    {
      name: "settings-storage",
    }
  )
);

withStorageDOMEvents(useSettingsStore);
