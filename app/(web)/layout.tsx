import { Inter } from "next/font/google";
import "../globals.css";

const inter = Inter({ subsets: ["latin"] });

import dynamic from "next/dynamic";
import { notFound } from "next/navigation";
import { I18NProvider } from "../components/(i18n)/i18n-provider";
import Nodes from "../components/(map)/nodes";
import Territories from "../components/(map)/territories";
import Tiles from "../components/(map)/tiles";
import PlausibleTracker from "../components/plausible-tracker";
import SearchParams from "../components/search-params";
import { DEFAULT_LOCALE, LOCALES, isLang, loadDictionary } from "../lib/i18n";

export { generateMetadata } from "@/app/lib/meta";

const Map = dynamic(() => import("../components/(map)/map"), {
  ssr: false,
});

const Search = dynamic(() => import("../components/search"), {
  ssr: false,
});

function Layout({
  // children,
  params: { lang = "en" },
}: {
  children: React.ReactNode;
  params: { lang?: string };
}) {
  if (!isLang(lang)) {
    notFound();
  }

  const dict = loadDictionary(lang);

  return (
    <html lang={lang}>
      <body
        className={`${inter.className} h-screen bg-black text-white antialiased select-none  overflow-hidden`}
      >
        <I18NProvider
          value={{
            defaultLocale: DEFAULT_LOCALE,
            locale: lang,
            locales: LOCALES,
            dict,
          }}
        >
          <Map>
            <Tiles />
            <Territories />
            <Nodes />
          </Map>
          <Search />
          {/* <Drawer>{children}</Drawer> */}
        </I18NProvider>
        <SearchParams />
        <PlausibleTracker
          domain={process.env.NEXT_PUBLIC_PLAUSIBLE_WEB_DOMAIN}
          apiHost={process.env.NEXT_PUBLIC_PLAUSIBLE_API_HOST}
        />
      </body>
    </html>
  );
}

export default Layout;
