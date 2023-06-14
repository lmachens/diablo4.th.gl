import "/node_modules/flag-icons/css/flag-icons.min.css";

import Link from "next/link";
import { useState } from "react";
import { useOverwolfRouter } from "../(overwolf)/components/overwolf-router";
import { useSettingsStore } from "../lib/storage";
import { useI18N } from "./(i18n)/i18n-provider";
import Popover from "./popover";

const getFlagCode = (locale: string) => {
  if (locale === "en") {
    return "us";
  }
  return locale;
};

export default function LocaleSelect({ className }: { className?: string }) {
  const router = useOverwolfRouter();
  const i18n = useI18N();
  const [isOpen, setIsOpen] = useState(false);
  const settingsStore = useSettingsStore();

  return (
    <Popover
      open={isOpen}
      onOpenChange={setIsOpen}
      trigger={
        <button
          className={`text-xl fi fi-${getFlagCode(i18n.locale)} ${className}`}
        />
      }
    >
      <nav className="flex flex-col">
        {i18n.locales
          .filter((locale) => locale !== i18n.locale)
          .map((locale) => (
            <Link
              key={locale}
              href={`/${locale}`}
              onClick={(event) => {
                setIsOpen(false);
                if ("update" in router) {
                  settingsStore.setLocale(locale);
                  event.preventDefault();
                }
              }}
              className="text-xl"
            >
              <span className={`fi fi-${getFlagCode(locale)}`} />
            </Link>
          ))}
      </nav>
    </Popover>
  );
}
