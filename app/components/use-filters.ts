import { ICONS } from "../lib/icons";
import { useGlobalSettingsStore } from "../lib/storage";

export default function useFilters() {
  const globalSettingsStore = useGlobalSettingsStore();

  const setFilters = (newFilters: string[]) => {
    newFilters = newFilters.filter((f) => f in ICONS);
    globalSettingsStore.setFilters(newFilters);
  };

  const toggleFilter = (key: string) => {
    const newFilters = globalSettingsStore.filters.includes(key)
      ? globalSettingsStore.filters.filter((f) => f !== key)
      : [...globalSettingsStore.filters, key];
    setFilters(newFilters);
  };
  return [globalSettingsStore.filters, toggleFilter, setFilters] as const;
}
