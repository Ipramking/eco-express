import type { ReactNode } from "react";
import { amara } from "../core/index.js";
import { Notif, ShieldCheck } from "./Icons.js";

/**
 * The Ecobank shell chrome: a brand-blue header (wordmark, protection status,
 * notifications, profile) with a white content sheet curving up over it and a
 * centred greeting. Every main tab renders inside this so the whole app reads
 * as one Ecobank product.
 */
export function TabScaffold({
  children,
  onProfile,
  onNotifications,
  protectedOn = true,
  greeting = true,
}: {
  children: ReactNode;
  onProfile?: () => void;
  onNotifications?: () => void;
  protectedOn?: boolean;
  greeting?: boolean;
}) {
  const [first, last] = amara.ownerName.split(" ");
  return (
    <div className="min-h-full">
      {/* brand-blue header */}
      <div className="bg-eco-blue px-5 pb-20 pt-safe">
        <div className="flex items-center justify-between">
          <div className="leading-none">
            <span className="font-extrabold tracking-tight text-white" style={{ fontSize: 22 }}>
              Ecobank
            </span>
            <span className="mt-1 block h-[3px] w-9 rounded-full bg-eco-green" />
            <span className="mt-1 block text-[9px] font-medium tracking-[0.18em] text-white/70">
              THE PAN AFRICAN BANK
            </span>
          </div>
          <div className="flex items-center gap-2.5">
            {protectedOn && (
              <span className="flex items-center gap-1 rounded-full bg-white/12 px-2.5 py-1 text-[11px] font-bold text-white">
                <ShieldCheck size={13} weight="fill" className="text-eco-green" /> Protected
              </span>
            )}
            <button
              onClick={onNotifications}
              className="relative grid h-9 w-9 place-items-center rounded-full bg-white/12 text-white"
              aria-label="Notifications"
            >
              <Notif size={17} />
              <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-eco-green" />
            </button>
            <button
              onClick={onProfile}
              className="grid h-9 w-9 place-items-center rounded-full bg-white text-xs font-extrabold text-eco-blue ring-2 ring-eco-green/70"
              aria-label="Profile"
            >
              {first[0]}
              {last?.[0]}
            </button>
          </div>
        </div>
      </div>

      {/* white content sheet curving over the header */}
      <div className="-mt-14 rounded-t-[26px] bg-bg px-5 pt-5">
        {greeting && (
          <p className="mb-4 text-center text-base font-extrabold text-ink">
            Hello, {first}
          </p>
        )}
        {children}
      </div>
    </div>
  );
}
