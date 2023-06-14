"use client";
import { I18NProvider } from "@/app/components/(i18n)/i18n-provider";
import Map from "@/app/components/(map)/map";
import Nodes from "@/app/components/(map)/nodes";
import Territories from "@/app/components/(map)/territories";
import Tiles from "@/app/components/(map)/tiles";
import Search from "@/app/components/search";
import SearchParams from "@/app/components/search-params";
import { DEFAULT_LOCALE, LOCALES, loadDictionary } from "@/app/lib/i18n";
import { useSettingsStore } from "@/app/lib/storage";
import { useEffect, useState } from "react";
import Ads from "../components/ads";
import Header from "../components/header";
import ResizeBorders from "../components/resize-borders";
import { waitForOverwolf } from "../lib/overwolf";

export default function App() {
  const [ready, setReady] = useState(false);
  const locale = useSettingsStore((state) => state.locale);
  const dict = loadDictionary(locale);

  useEffect(() => {
    waitForOverwolf().then(() => setReady(true));
  }, []);

  if (!ready) {
    return <></>;
  }

  return (
    <I18NProvider
      value={{
        dict,
        defaultLocale: DEFAULT_LOCALE,
        locale,
        locales: LOCALES,
      }}
    >
      <Header />
      <ResizeBorders />
      <Map>
        <Tiles />
        <Territories />
        <Nodes />
      </Map>
      <SearchParams />
      <Ads />
      <Search />
    </I18NProvider>
  );
}
