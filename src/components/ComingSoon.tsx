import type { Icon } from "@phosphor-icons/react";
import { Close } from "./Icons.js";

/**
 * Bottom sheet for features that exist in the shell but are out of scope for
 * this build. Keeps the app feeling complete without faking functionality.
 */
export function ComingSoon({
  title,
  Icon: Glyph,
  onClose,
}: {
  title: string;
  Icon: Icon;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center bg-black/45 animate-pop" onClick={onClose}>
      <div
        className="w-full max-w-[430px] rounded-t-[26px] bg-surface p-6 pb-10"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mx-auto mb-5 h-1 w-10 rounded-full bg-hairline" />
        <div className="flex items-start justify-between">
          <span className="grid h-12 w-12 place-items-center rounded-2xl bg-eco-blue/10 text-eco-blue">
            <Glyph size={24} weight="bold" />
          </span>
          <button onClick={onClose} className="grid h-9 w-9 place-items-center rounded-full bg-surface2 text-ink-soft" aria-label="Close">
            <Close size={16} />
          </button>
        </div>
        <h3 className="mt-4 text-xl font-extrabold text-ink">{title}</h3>
        <p className="mt-1.5 text-sm leading-relaxed text-ink-soft">
          This is part of the Ecobank experience. In this prototype we focused on
          the credit and protection layer, so {title} is shown as a preview.
        </p>
        <button onClick={onClose} className="btn-primary mt-6 w-full py-3.5 text-sm">
          Got it
        </button>
      </div>
    </div>
  );
}
