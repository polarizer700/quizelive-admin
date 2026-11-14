import { legal } from "@shared/config/legal";

export function LegalLinks({ className = "" }: { className?: string }) {
  return (
    <p className={`flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-stone-500 ${className}`}>
      <a className="hover:text-stone-800" href={legal.privacyUrl} target="_blank" rel="noreferrer">
        Политика
      </a>
      <a className="hover:text-stone-800" href={legal.termsUrl} target="_blank" rel="noreferrer">
        Соглашение
      </a>
      <a className="hover:text-stone-800" href={legal.cookiesUrl} target="_blank" rel="noreferrer">
        Cookie
      </a>
      <span className="font-semibold text-stone-700">{legal.ageMark}</span>
    </p>
  );
}
