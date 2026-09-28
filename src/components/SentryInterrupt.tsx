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
 * The overlay scrolls (overflow-y-auto) so it never traps content off-screen,
 * while a min-h-full inner column keeps the actions pinned to the bottom when
 * everything fits.
 *
 * There is deliberately no "Yes, I started this transfer" tap-to-confirm
 * button. A scammer on a call can talk a victim through tapping a button;
 * they cannot fake the victim's face. Releasing a flagged transfer requires a
 * face scan (see FaceScan.tsx) - onVerify only opens that step, it never
 * releases funds by itself.
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
    <div className="fixed inset-0 z-[70] overflow-y-auto bg-eco-blue-deep/95 backdrop-blur-md">
      <div className="mx-auto flex min-h-full w-full max-w-[430px] flex-col px-6 pb-8 pt-10">
        {/* mark */}
        <div className="animate-pop flex flex-col items-center text-center">
          <span className="grid h-14 w-14 place-items-center rounded-full bg-danger/20">
            <span className="grid h-10 w-10 place-items-center rounded-full bg-danger text-white">
              <Alert size={22} weight="fill" />
            </span>
          </span>
          <p className="mt-3 text-[11px] font-bold uppercase tracking-[0.18em] text-danger">
            SentryAI &middot; transfer held
          </p>
        </div>

        {/* headline */}
        <h2 className="animate-rise mt-5 text-center text-xl font-bold leading-snug text-white">
          {result.headline}
        </h2>

        {/* amount block */}
        <div className="animate-rise mt-5 rounded-card border border-white/15 bg-white/5 p-4 text-center">
          <p className="text-[11px] uppercase tracking-widest text-white/60">Transfer amount</p>
          <p className="tabular mt-1 text-3xl font-extrabold text-white">{naira(txn.amountKobo)}</p>
          <p className="mt-1 text-sm text-white/70">to {txn.counterpartyName}</p>
        </div>

        {/* why flagged */}
        <div className="animate-rise mt-4 space-y-2">
          <p className="text-[11px] font-bold uppercase tracking-widest text-white/50">Why we stopped this</p>
          {result.reasons.map((r) => (
            <div key={r.key} className="flex items-start gap-3 rounded-ctrl border border-white/10 bg-white/5 px-4 py-2.5">
              <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-danger" />
              <div>
                <p className="text-sm font-semibold text-white">{r.label}</p>
                <p className="text-xs text-white/70">{r.detail}</p>
              </div>
            </div>
          ))}
        </div>

        {/* actions */}
        <div className="mt-auto pt-7">
          <button
            onClick={onVerify}
            className="btn-primary w-full gap-2 py-3.5 text-sm"
          >
            <FaceScanIcon size={18} weight="fill" />
            Verify with face scan
          </button>
          <p className="mt-2 text-center text-[11px] leading-relaxed text-white/50">
            We confirm it's really you before releasing money. A tap alone isn't enough.
          </p>

          <div className="mt-3 space-y-2.5">
          <button
            onClick={onUnsure}
            className="w-full rounded-ctrl border border-white/20 py-3.5 text-sm font-semibold text-white/75 transition active:scale-[0.98]"
          >
            I'm not sure, hold it
          </button>
          <button
            onClick={onCancel}
            className="w-full rounded-ctrl bg-danger py-3.5 text-base font-bold text-white shadow-[0_10px_24px_-12px_rgb(var(--danger)/0.9)] transition active:scale-[0.98]"
          >
            No, cancel and lock transfers
          </button>
          </div>
        </div>
      </div>
    </div>
  );
}
