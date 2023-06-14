"use client";
import dynamic from "next/dynamic";
import AppSettings from "../(overwolf)/components/app-settings";
import { useOverwolfRouter } from "../(overwolf)/components/overwolf-router";
import { API_BASE_URI, PATREON_CLIENT_ID } from "../lib/env";
import { useAccountStore, useGlobalSettingsStore } from "../lib/storage";
import { useDict } from "./(i18n)/i18n-provider";
import Drawer from "./drawer";
import ExternalLink from "./external-link";
import LocaleSelect from "./locale-select";
import Settings from "./settings";
const NitroPay = dynamic(() => import("./nitro-pay"), {
  ssr: false,
});
const DiscoveredNodes = dynamic(() => import("./discovered-nodes"), {
  ssr: false,
});
const Territories = dynamic(() => import("./territories"), {
  ssr: false,
});

const DISCOVER_LINKS = [
  {
    href: "https://www.studioloot.com/diablo4",
    text: "Diablo 4 News & Guides",
  },
  {
    href: "https://www.th.gl",
    text: "Gaming Apps & Tools",
  },
];
export default function Menu() {
  const router = useOverwolfRouter();
  const isOverwolf = "value" in router;
  const globalSettingsStore = useGlobalSettingsStore();
  const accountStore = useAccountStore();
  const dict = useDict();

  return (
    <Drawer show={globalSettingsStore.showSidebar}>
      <div className="flex flex-col text-gray-300 h-full">
        <header className="p-2 my-2 flex justify-between">
          <div className="flex gap-2 items-center">
            <h1 className="text-xl font-bold">{dict.meta.subtitle}</h1>
            <LocaleSelect />
          </div>
          <button onClick={globalSettingsStore.toggleShowSidebar}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-5 h-5 text-gray-400"
              viewBox="0 0 24 24"
              strokeWidth="2"
              stroke="currentColor"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
              <path d="M18 6l-12 12"></path>
              <path d="M6 6l12 12"></path>
            </svg>
          </button>
        </header>
        {!isOverwolf && <NitroPay />}
        <div
          className={`p-2 overflow-auto grow flex flex-col gap-2 ${
            isOverwolf
              ? !accountStore.isPatron
                ? "mb-[330px]"
                : "mb-[30px]"
              : ""
          }`}
        >
          {!accountStore.isPatron && (
            <>
              <p className="italic text-md text-center">
                {dict.menu.patronInfo}
              </p>
              <a
                href="https://www.patreon.com/join/devleon/checkout?rid=9878731"
                target="_blank"
                className="mt-1 p-2 uppercase text-center bg-white text-[#ff424d] hover:bg-gray-100"
              >
                {dict.menu.becomePatron}
              </a>
              <button
                onClick={() => {
                  if (isOverwolf) {
                    overwolf.utils.openUrlInDefaultBrowser(
                      `${API_BASE_URI}/patreon`
                    );
                  } else {
                    location.href = `https://www.patreon.com/oauth2/authorize?response_type=code&client_id=${PATREON_CLIENT_ID}&redirect_uri=${API_BASE_URI}`;
                  }
                }}
                className="my-1 p-2 uppercase text-white bg-[#ff424d] hover:bg-[#ca0f25]"
              >
                {dict.menu.linkPatreon}
              </button>
            </>
          )}
          <h2 className="category-title">{dict.menu.discoveredNodes}</h2>
          <DiscoveredNodes />
          <h2 className="category-title">{dict.menu.settings}</h2>
          {isOverwolf && <AppSettings />}
          <Settings />
          <h2 className="category-title">{dict.menu.territories}</h2>
          <Territories />
          <h2 className="category-title">{dict.menu.apps}</h2>
          <ExternalLink
            href="https://www.overwolf.com/app/Leon_Machens-Diablo_4_Map"
            text="Desktop App on Overwolf"
          />
          <h2 className="category-title">{dict.menu.community}</h2>
          <ExternalLink
            href="https://discord.com/invite/NTZu8Px"
            text="Discord"
          />
          {accountStore.isPatron && (
            <button
              onClick={() => {
                accountStore.setIsPatron(false);
              }}
              className="my-1 p-2 uppercase text-white bg-[#ff424d] hover:bg-[#ca0f25]"
            >
              {dict.menu.disconnectPatreon}
            </button>
          )}
          <h2 className="category-title">{dict.menu.discover}</h2>
          {DISCOVER_LINKS.map(({ href, text }) => (
            <ExternalLink key={href} href={href} text={text} />
          ))}
          <h2 className="category-title">{dict.menu.contribute}</h2>
          <ExternalLink
            href="https://github.com/lmachens/diablo4.th.gl"
            text="GitHub"
          />
        </div>
      </div>
    </Drawer>
  );
}
