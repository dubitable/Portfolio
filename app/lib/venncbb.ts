import { useState, useEffect } from "react";
import { DataMode, Filter } from "../routes/projects/venncbb";
import type { Team } from "@prisma/client";

function getWindowDimensions() {
  const { innerWidth: width, innerHeight: height } = window;
  return { width, height };
}

export default function useWindowDimensions() {
  const [windowDimensions, setWindowDimensions] = useState(
    getWindowDimensions()
  );

  useEffect(() => {
    function handleResize() {
      setWindowDimensions(getWindowDimensions());
    }

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return windowDimensions;
}

export type ScrollTo = "auto" | "disable";

export function useSettings(defaults: {
  datamode: DataMode;
  scrollto: ScrollTo;
}) {
  const dataModeState = useState<DataMode>(defaults.datamode);
  const [dataMode, setDataMode] = dataModeState;

  const scrollToState = useState<ScrollTo>(defaults.scrollto);
  const [scrollTo, setScrollTo] = scrollToState;

  return {
    dataMode,
    setDataMode,
    dataModeState,
    scrollTo,
    setScrollTo,
    scrollToState,
  };
}

export type Settings = ReturnType<typeof useSettings>;

export type State<T> = [T, (val: T) => void];

export const keys = <T extends Record<any, any>>(obj: T) => {
  return Object.keys(obj) as (keyof T)[];
};

export const entries = <T extends Record<any, any>>(obj: T) => {
  return Object.entries(obj) as [keyof T, T[keyof T]][];
};

export const capitalize = (val: string) => {
  return val.slice(0, 1).toUpperCase() + val.slice(1);
};

export const filterNull = <T>(array: (T | null)[]) => {
  return array.filter((val) => val != null) as T[];
};

export const applyFilters = (teams: Team[], filters: Filter[]) => {
  return teams.filter((team) => {
    return filters.reduce((prev, curr) => prev && curr.apply(team), true);
  });
};

export const selectableColumn = (column: string) => {
  return ![
    "logos",
    "Full_Team_Name",
    "Short_Conference_Name",
    "Tournament_Winner_",
  ].includes(column);
};
