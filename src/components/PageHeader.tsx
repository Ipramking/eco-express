import type { ReactNode } from "react";
import { ChevronRight } from "./Icons.js";

/** Shared header for pushed detail screens: back control + title + optional action. */
export function PageHeader({
  title,
  subtitle,
  action,
  onBack,
}: {
  title: string;
  subtitle?: string;
  action?: ReactNode;
  onBack?: () => void;
}) {
  return (
    <header className="flex items-start gap-3 px-5 pt-safe">
      {onBack && (
        <button
          onClick={onBack}
          className="mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-full border border-hairline bg-surface text-ink-soft"
          aria-label="Back"
        >
          <ChevronRight size={18} className="rotate-180" />
        </button>
      )}
      <div className="flex-1">
        <h1 className="text-2xl font-extrabold tracking-tight text-ink">{title}</h1>
        {subtitle && <p className="mt-0.5 text-sm text-ink-soft">{subtitle}</p>}
      </div>
      {action}
    </header>
  );
}
