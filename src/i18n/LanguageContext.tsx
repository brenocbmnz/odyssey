import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { english } from "./en";
export type Locale = "pt-BR" | "en";
const key = "odyssey:language:v1";
export function readLanguage(): Locale {
  try {
    return localStorage.getItem(key) === "en" ? "en" : "pt-BR";
  } catch {
    return "pt-BR";
  }
}
export function translate(
  locale: Locale,
  text: string,
  values: Record<string, string | number> = {},
) {
  const translated = locale === "en" ? (english[text] ?? text) : text;
  return translated.replace(/\{(\w+)\}/g, (match, name: string) =>
    String(values[name] ?? match),
  );
}
interface Language {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (text: string, values?: Record<string, string | number>) => string;
}
const LanguageContext = createContext<Language | null>(null);
export function LanguageProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(readLanguage);
  const setLocale = (value: Locale) => {
    setLocaleState(value);
    try {
      localStorage.setItem(key, value);
    } catch {
      /* A seleção continua funcionando durante a sessão. */
    }
  };
  useEffect(() => {
    document.documentElement.lang = locale;
    document.title =
      locale === "en"
        ? "Odyssey — Your next adventure"
        : "Odyssey — Sua próxima aventura";
  }, [locale]);
  return (
    <LanguageContext.Provider
      value={{
        locale,
        setLocale,
        t: (text, values) => translate(locale, text, values),
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
}
export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) throw new Error("LanguageProvider ausente");
  return context;
}
