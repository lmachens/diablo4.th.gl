"use client";
import { useRouter } from "next/navigation";
import { createContext, useContext, useState } from "react";

type Value = {
  name: string | null;
  search: string | null;
  coordinates: string | null;
};

const Context = createContext<{
  value: Value;
  update: (newValue: Partial<Value>) => void;
} | null>(null);

export const OverwolfRouterProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [value, setValue] = useState<Value>({
    name: null,
    search: null,
    coordinates: null,
  });

  const update = (newValue: Partial<Value>) => {
    for (const [key, value] of Object.entries(newValue)) {
      if (value === "") {
        newValue[key as keyof typeof newValue] = null;
      }
    }
    setValue((value) => ({ ...value, ...newValue }));
  };

  return (
    <Context.Provider
      value={{
        value,
        update,
      }}
    >
      {children}
    </Context.Provider>
  );
};

export const useOverwolfRouter = () => {
  const value = useContext(Context);
  const router = useRouter();

  if (value === null) {
    return router;
  }

  return value;
};
