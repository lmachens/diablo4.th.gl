import { Inter } from "next/font/google";
import "../globals.css";

const inter = Inter({ subsets: ["latin"] });

import dynamic from "next/dynamic";
import { notFound } from "next/navigation";
import { I18NProvider } from "../components/(i18n)/i18n-provider";
import Nodes from "../components/(map)/nodes";
import Tiles from "../components/(map)/tiles";
import PlausibleTracker from "../components/plausible-tracker";
import { DEFAULT_LOCALE, LOCALES, isLang, loadDictionary } from "../lib/i18n";

export { generateMetadata } from "@/app/lib/meta";

const Map = dynamic(() => import("../components/(map)/map"), {
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
        className={`${inter.className} h-screen bg-black text-white  overflow-hidden`}
      >
        <I18NProvider
          value={{
            dict,
            defaultLocale: DEFAULT_LOCALE,
            locale: lang,
            locales: LOCALES,
          }}
        >
          <Map>
            <Tiles />
            <Nodes />
          </Map>
          <a
            href="https://diablo4.th.gl"
            target="_blank"
            className="absolute top-3 left-3 z-[400] bg-neutral-900 font-semibold text-gray-200 text-sm py-2 px-4 border border-gray-600 rounded-2xl outline-none hover:bg-neutral-800 flex gap-1.5 items-center"
          >
            <svg
              className="w-5 h-5"
              viewBox="0 0 24 24"
              strokeWidth="2"
              stroke="currentColor"
              fill="none"
            >
              <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
              <path d="M3 7l6 -3l6 3l6 -3l0 13l-6 3l-6 -3l-6 3l0 -13"></path>
              <path d="M9 4l0 13"></path>
              <path d="M15 7l0 13"></path>
            </svg>
            Diablo 4 Map
          </a>
        </I18NProvider>

        <PlausibleTracker
          domain={process.env.NEXT_PUBLIC_PLAUSIBLE_EMBED_DOMAIN}
          apiHost={process.env.NEXT_PUBLIC_PLAUSIBLE_API_HOST}
        />
      </body>
    </html>
  );
}

export default Layout;
