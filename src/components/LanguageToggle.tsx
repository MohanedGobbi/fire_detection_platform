import { useLanguage } from "@/hooks/useLanguage";
import { Languages } from "lucide-react";

export function LanguageToggle({ className = "" }: { className?: string }) {
  const { lang, toggle } = useLanguage();
  return (
    <button
      type="button"
      onClick={toggle}
      className={`flex items-center gap-1.5 px-2.5 py-1.5 text-[11px] font-bold tracking-[0.1em] transition-colors ${className}`}
      aria-label={lang === "en" ? "Switch to Arabic" : "التبديل إلى الإنجليزية"}
    >
      <Languages className="h-3.5 w-3.5" strokeWidth={1.75} />
      {lang === "en" ? "العربية" : "ENGLISH"}
    </button>
  );
}
