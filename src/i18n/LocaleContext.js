import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import * as Localization from "expo-localization";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { translations, SUPPORTED_LOCALES, DEFAULT_LOCALE } from "./translations";

const STORAGE_KEY = "locale-override";
const LocaleContext = createContext(null);

function detectDeviceLocale() {
  const deviceLangs = Localization.getLocales();
  for (const l of deviceLangs) {
    if (SUPPORTED_LOCALES.includes(l.languageCode)) return l.languageCode;
  }
  return DEFAULT_LOCALE;
}

// Reads a nested key path like "login.hello" out of the active locale's
// translation object, falling back to English if a key is ever missing
// (e.g. mid-rollout of a new string) rather than crashing.
function resolve(locale, path) {
  const dig = (obj) => path.split(".").reduce((o, k) => (o ? o[k] : undefined), obj);
  return dig(translations[locale]) ?? dig(translations[DEFAULT_LOCALE]);
}

export function LocaleProvider({ children }) {
  // Starts from the device's language immediately (no loading flash);
  // swaps to a saved manual override, if any, once AsyncStorage resolves.
  const [locale, setLocaleState] = useState(detectDeviceLocale());

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((saved) => {
      if (saved && SUPPORTED_LOCALES.includes(saved)) setLocaleState(saved);
    });
  }, []);

  const setLocale = useCallback((next) => {
    if (!SUPPORTED_LOCALES.includes(next)) return;
    setLocaleState(next);
    AsyncStorage.setItem(STORAGE_KEY, next);
  }, []);

  // t("games.noResults") -> string, or t("games.showMore", 3, true) for
  // entries defined as functions (pluralization/interpolation).
  const t = useCallback(
    (path, ...args) => {
      const value = resolve(locale, path);
      if (typeof value === "function") return value(...args);
      return value ?? path;
    },
    [locale]
  );

  return <LocaleContext.Provider value={{ locale, setLocale, t }}>{children}</LocaleContext.Provider>;
}

export function useLocale() {
  const ctx = useContext(LocaleContext);
  if (!ctx) throw new Error("useLocale must be used within LocaleProvider");
  return ctx;
}
