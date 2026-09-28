import { naira, type DeviationResult, type Transaction } from "../core/index.js";
import { Alert, FaceScanIcon } from "./Icons.js";

/**
 * The SentryAI full-screen interrupt. This is the pitch centerpiece.
 *
 * It is deliberately a full-screen takeover, not a banner. A fraud alert that
 * appears as a small banner while a victim is mid-call with a scammer gets
 * dismissed. A full-screen interruption breaks the social-engineering moment -
 * that is the entire design thesis of the fraud layer.
 *
 * This surface is intentionally ALWAYS dark regardless of the app's light/dark
 * setting (it needs to read as a security lockout, not a themed page). It uses
 * the theme-INVARIANT "ondark-*" tokens throughout, not --danger/--positive/
 * --eco-cyan, which flip with the app theme and would go low-contrast here
 * whenever the app is in light mode (the default). The backdrop is fully
 * opaque, not translucent+blurred, so legibility never depends on backdrop-
 * filter support or what happens to be behind it.
 *
 * There is deliberately no "Yes, I started this transfer" tap-to-confirm
 * button. A scammer on a call can talk a victim through tapping a button;
 * they cannot fake the victim's face. Releasing a flagged transfer requires a
 * face scan (see FaceScan.tsx) - onVerify only opens that step, it never
 * releases funds by itself.
 *
 * The overlay scrolls (overflow-y-auto) so it never traps content off-screen,
 * while a min-h-full inner column keeps the actions pinned to the bottom when
 * everything fits.
 */
export function SentryInterrupt({
  txn,
  result,
  onVerify,
  onCancel,
  onUnsure,
}: {
  txn: Transaction;
  result: DeviationResult;
  onVerify: () => void;
  onCancel: () => void;
  onUnsure: () => void;
}) {
  return (
    <div className="fixed inset-0 z-[70] overflow-y-auto bg-eco-blue-deep">
      <div className="mx-auto flex min-h-full w-full max-w-[430px] flex-col px-6 pb-8 pt-10">
        {/* mark */}
        <div className="animate-pop flex flex-col items-center text-center">
          <span className="grid h-14 w-14 place-items-center rounded-full bg-ondark-danger/20">
            <span className="grid h-10 w-10 place-items-center rounded-full bg-ondark-danger text-eco-blue-deep">
              <Alert size={22} weight="fill" />
            </span>
          </span>
          <p className="mt-3 text-[12px] font-extrabold uppercase tracking-[0.18em] text-ondark-danger">
            SentryAI &middot; transfer held
          </p>
        </div>

        {/* headline */}
        <h2 className="animate-rise mt-5 text-center text-xl font-bold leading-snug text-ondark-ink">
          {result.headline}
        </h2>

        {/* amount block */}
        <div className="animate-rise mt-5 rounded-card border border-white/20 bg-white/[0.08] p-4 text-center">
          <p className="text-[11px] font-semibold uppercase tracking-widest text-ondark-ink-soft">
            Transfer amount
          </p>
          <p className="tabular mt-1 text-3xl font-extrabold text-ondark-ink">{naira(txn.amountKobo)}</p>
          <p className="mt-1 text-sm text-ondark-ink-soft">to {txn.counterpartyName}</p>
        </div>

        {/* why flagged */}
        <div className="animate-rise mt-5 space-y-2.5">
          <p className="text-[11px] font-bold uppercase tracking-widest text-ondark-ink-faint">
            Why we stopped this
          </p>
          {result.reasons.map((r) => (
            <div
              key={r.key}
              className="flex items-start gap-3 rounded-ctrl border border-white/15 bg-white/[0.06] px-4 py-3"
            >
              <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-ondark-danger" />
              <div>
                <p className="text-sm font-bold text-ondark-ink">{r.label}</p>
                <p className="text-xs text-ondark-ink-soft">{r.detail}</p>
              </div>
            </div>
          ))}
        </div>

        {/* actions */}
        <div className="mt-auto pt-7">
          <button onClick={onVerify} className="btn-primary w-full gap-2 py-3.5 text-sm">
            <FaceScanIcon size={18} weight="fill" />
            Verify with face scan
          </button>
          <p className="mt-2 text-center text-[11px] leading-relaxed text-ondark-ink-faint">
            We confirm it's really you before releasing money. A tap alone isn't enough.
          </p>

          <div className="mt-3 space-y-2.5">
            <button
              onClick={onUnsure}
              className="w-full rounded-ctrl border border-white/25 bg-white/[0.06] py-3.5 text-sm font-semibold text-ondark-ink transition active:scale-[0.98]"
            >
              I'm not sure, hold it
            </button>
            <button
              onClick={onCancel}
              className="w-full rounded-ctrl bg-ondark-danger py-3.5 text-base font-bold text-eco-blue-deep shadow-[0_10px_24px_-12px_rgb(var(--ondark-danger)/0.7)] transition active:scale-[0.98]"
            >
              No, cancel and lock transfers
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
