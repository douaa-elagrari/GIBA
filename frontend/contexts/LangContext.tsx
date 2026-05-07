"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { Locale, getT } from "../lib/i18n";

interface LangContextType {
  locale: Locale;
  setLocale: (l: Locale) => void;
  t: ReturnType<typeof getT>;
  dir: "ltr" | "rtl";
}

const LangContext = createContext<LangContextType>({
  locale: "en",
  setLocale: () => {},
  t: getT("en"),
  dir: "ltr",
});

export function LangProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(() => {
    if (typeof window === "undefined") return "en";
    const saved = localStorage.getItem("giba-locale") as Locale | null;
    return saved && ["en", "fr", "ar"].includes(saved) ? saved : "en";
  });

  const setLocale = (l: Locale) => {
    setLocaleState(l);
    localStorage.setItem("giba-locale", l);
  };

  const t = getT(locale);
  const dir = t.dir as "ltr" | "rtl";

  useEffect(() => {
    document.documentElement.setAttribute("dir", dir);
    document.documentElement.setAttribute("lang", locale);
  }, [dir, locale]);

  return (
    <LangContext.Provider value={{ locale, setLocale, t, dir }}>
      {children}
    </LangContext.Provider>
  );
}

export function useLang() {
  return useContext(LangContext);
}
