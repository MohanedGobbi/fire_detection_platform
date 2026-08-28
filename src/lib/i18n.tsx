import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import { DICTS, LanguageContext, loadLang, STORAGE_KEY, type Lang } from "@/lib/languageData";
import type { LanguageContextValue } from "@/lib/languageData";

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(loadLang);
  const dir: "ltr" | "rtl" = lang === "ar" ? "rtl" : "ltr";

  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = dir;
  }, [lang, dir]);

  const setLang = (l: Lang) => {
    setLangState(l);
    try {
      localStorage.setItem(STORAGE_KEY, l);
    } catch {
      /* private mode — non-fatal */
    }
  };

  const value: LanguageContextValue = {
    lang,
    dir,
    t: DICTS[lang],
    setLang,
    toggle: () => setLang(lang === "en" ? "ar" : "en"),
  };

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}
