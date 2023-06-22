"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useOverwolfRouter } from "../(overwolf)/components/overwolf-router";
import { WINDOWS } from "../(overwolf)/lib/config";
import { useCurrentWindow } from "../(overwolf)/lib/windows";
import { useUpdateSearchParams } from "../lib/search-params";
import {
  ALL_FILTERS,
  useGlobalSettingsStore,
  useSettingsStore,
} from "../lib/storage";
import { useDict } from "./(i18n)/i18n-provider";
import Filters from "./filters";
import Helltide from "./helltide";
import useFilters from "./use-filters";

export default function Search() {
  const searchParams = useSearchParams();
  const router = useOverwolfRouter();
  const [search, setSearch] = useState(() => searchParams.get("search") ?? "");
  const dict = useDict();
  const updateSearchParams = useUpdateSearchParams();
  const [filters] = useFilters();
  const settingsStore = useSettingsStore();
  const globalSettingsStore = useGlobalSettingsStore();
  const currentWindow = useCurrentWindow();
  const isOverlay = currentWindow?.name === WINDOWS.OVERLAY;

  useEffect(() => {
    const handle = setTimeout(() => {
      if ("update" in router) {
        router.update({ search });
      } else {
        updateSearchParams("search", search);
      }
    }, 200);
    return () => clearTimeout(handle);
  }, [search]);
  return (
    <>
      {(!settingsStore.lockedWindow || !isOverlay) && (
        <div
          className={`absolute top-0 z-[400] flex w-full md:w-auto transition-all duration-500 ${
            globalSettingsStore.showSidebar ? "md:left-[412px]" : "md:left-3"
          } ${"value" in router ? "md:top-[42px]" : "md:top-3"}`}
        >
          <button
            className="menu flex absolute inset-y-0 left-0 items-center pl-2 text-gray-400 hover:text-gray-200"
            onClick={globalSettingsStore.toggleShowSidebar}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="block w-5"
            >
              <path d="M4 6l16 0" />
              <path d="M4 12l16 0" />
              <path d="M4 18l16 0" />
            </svg>
            <div className="h-3/6 w-px bg-gray-600 mx-1.5" />
          </button>
          <input
            className="bg-neutral-900 text-gray-200 text-sm pl-11 pr-16 py-2.5 w-full md:border md:border-gray-600 md:rounded-lg outline-none search"
            type="text"
            placeholder={dict.search.placeholder}
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
          {search ? (
            <button
              className="flex absolute inset-y-0 right-6 items-center pr-2 text-gray-400 hover:text-gray-200"
              onClick={() => setSearch("")}
            >
              <svg
                className="block w-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
                <path d="M18 6l-12 12"></path>
                <path d="M6 6l12 12"></path>
              </svg>
              <div className="h-3/6 w-px bg-gray-600 mx-1.5" />
            </button>
          ) : (
            <div className="flex absolute inset-y-0 right-6 items-center pr-2 text-gray-400">
              <svg
                className="block w-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
              <div className="h-3/6 w-px bg-gray-600 mx-1.5" />
            </div>
          )}
          <button
            className={`flex absolute inset-y-0 right-0 items-center pr-2 text-gray-400 hover:text-gray-200 ${
              globalSettingsStore.showFilters ? "text-white" : ""
            }`}
            onClick={globalSettingsStore.toggleShowFilters}
          >
            <svg
              className="block w-5"
              viewBox="0 0 24 24"
              strokeWidth="2"
              stroke="currentColor"
              fill={
                filters.length !== ALL_FILTERS.length ? "currentColor" : "none"
              }
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path stroke="none" d="M0 0h24v24H0z" fill="none" />
              <path d="M4 4h16v2.172a2 2 0 0 1 -.586 1.414l-4.414 4.414v7l-6 2v-8.5l-4.48 -4.928a2 2 0 0 1 -.52 -1.345v-2.227z" />
            </svg>
          </button>
          <div className="absolute top-full w-full md:w-fit md:top-0 md:left-full md:ml-2">
            {globalSettingsStore.showTimers && <Helltide />}
          </div>
          <div
            className={`absolute top-full text-sm w-full md:mt-1 md:space-y-2`}
          >
            {globalSettingsStore.showFilters && <Filters />}
          </div>
        </div>
      )}
    </>
  );
}
