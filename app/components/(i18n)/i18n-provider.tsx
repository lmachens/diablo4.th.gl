"use client";
import { DICT } from "@/app/lib/i18n";
import { createContext, useContext } from "react";

const Context = createContext<{
  dict: DICT;
  defaultLocale: string;
  locale: string;
  locales: string[];
} | null>(null);

export const I18NProvider = ({
  children,
  value,
}: {
  children: React.ReactNode;
  value: {
    dict: DICT;
    defaultLocale: string;
    locale: string;
    locales: string[];
  };
}) => {
  return <Context.Provider value={value}>{children}</Context.Provider>;
};

export const useI18N = () => {
  const value = useContext(Context);

  if (value === null) {
    throw new Error("useI18N must be used within a I18NProvider");
  }

  return value;
};

export const useDict = () => {
  return useI18N().dict;
};
