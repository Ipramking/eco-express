import { naira, type DeviationResult, type Transaction } from "../core/index.js";
import { ClockIcon, LockIcon, ShieldCheck } from "./Icons.js";

export type ResultKind = "unsure" | "cancel";

/**
 * The SentryAI non-release outcomes: hold (pending SMS confirmation) or block
 * (transfer stopped, transfers locked). A successful, released transfer -
 * whether a routine PIN send or a flagged transfer cleared by a face scan -
 * is not handled here; it goes to the unified TransactionReceipt instead, so
 * every completed payment looks the same regardless of which path got it
 * there.
 */
function reference(txn: Transaction): string {
  const n = [...txn.id].reduce((a, c) => a + c.charCodeAt(0), 0) * 977;
  return "SEN-" + String(1000000 + (n % 8999999));
}

const nowStamp = () =>
  new Date().toLocaleString("en-NG", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

interface Variant {
  tone: string; // rgb var name
  Icon: typeof ClockIcon;
  eyebrow: string;
  title: string;
  lead: string;
  statusLabel: string;
  facts: { k: string; v: string }[];
  section: { heading: string; items: { title: string; body: string }[] };
  primary: string;
  secondary?: string;
}

export function SentryResult({
  kind,
  txn,
  result,
  onPrimary,
  onSecondary,
}: {
  kind: ResultKind;
  txn: Transaction;
  result: DeviationResult;
  onPrimary: () => void;
  onSecondary?: () => void;
}) {
  const amount = naira(txn.amountKobo);
  const ref = reference(txn);
  const stamp = nowStamp();

  const V: Record<ResultKind, Variant> = {
    unsure: {
      tone: "--warn",
      Icon: ClockIcon,
      eyebrow: "Transfer held",
      title: "We paused it for 10 minutes",
      lead: `SentryAI is holding this ${amount} transfer and has sent a confirmation code by SMS to your registered number ending 4097.`,
      statusLabel: "On hold",
      facts: [
        { k: "Amount", v: amount },
        { k: "Recipient", v: txn.counterpartyName },
        { k: "Reference", v: ref },
        { k: "Held at", v: stamp },
      ],
      section: {
        heading: "What happens next",
        items: [
          { title: "Confirm by SMS", body: "Reply to the code we sent within 10 minutes to release the transfer." },
          { title: "No action, no transfer", body: "If you do nothing, the transfer is automatically cancelled and your money stays put." },
          { title: "Nothing has left yet", body: "The funds are still in your account while the hold is active." },
        ],
      },
      primary: "I'll confirm by SMS",
      secondary: "Cancel the transfer",
    },
    cancel: {
      tone: "--danger",
      Icon: LockIcon,
      eyebrow: "Transfer blocked",
      title: "We stopped it and locked transfers",
      lead: `SentryAI blocked this ${amount} transfer to ${txn.counterpartyName} and locked outgoing transfers to keep your money safe.`,
      statusLabel: "Blocked",
      facts: [
        { k: "Amount", v: amount },
        { k: "Recipient", v: txn.counterpartyName },
        { k: "Reference", v: ref },
        { k: "Blocked at", v: stamp },
      ],
      section: {
        heading: "Recommended next steps",
        items: [
          { title: "Your money is safe", body: "Nothing left your account. The transfer was stopped before it could complete." },
          { title: "Transfers are locked", body: "Outgoing transfers are paused until you verify your identity in the app." },
          { title: "If this was not you", body: "Change your password and contact Ecobank support so we can secure your account." },
        ],
      },
      primary: "Verify identity to unlock",
      secondary: "Back to home",
    },
  };

  const v = V[kind];
  const tone = `rgb(var(${v.tone}))`;

  return (
    <div className="fixed inset-0 z-[70] overflow-y-auto bg-bg">
      <div className="mx-auto flex min-h-full w-full max-w-[430px] flex-col px-5 pb-8 pt-safe">
        {/* status head */}
        <div className="animate-pop flex flex-col items-center pt-4 text-center">
          <span className="grid h-16 w-16 place-items-center rounded-full" style={{ background: `rgb(var(${v.tone}) / 0.14)` }}>
            <span className="grid h-12 w-12 place-items-center rounded-full text-white" style={{ background: tone }}>
              <v.Icon size={26} weight="fill" />
            </span>
          </span>
          <p className="mt-3 text-[11px] font-bold uppercase tracking-[0.16em]" style={{ color: tone }}>
            SentryAI &middot; {v.eyebrow}
          </p>
          <h1 className="mt-2 text-2xl font-extrabold leading-tight text-ink">{v.title}</h1>
          <p className="mt-2 max-w-[320px] text-sm leading-relaxed text-ink-soft">{v.lead}</p>
        </div>

        {/* transaction card */}
        <div className="animate-rise mt-6 card overflow-hidden">
          <div className="flex items-center justify-between border-b border-hairline px-4 py-3">
            <span className="label-micro">Transaction</span>
            <span
              className="rounded-full px-2.5 py-1 text-[11px] font-bold text-white"
              style={{ background: tone }}
            >
              {v.statusLabel}
            </span>
          </div>
          <dl className="divide-y divide-hairline/70">
            {v.facts.map((f) => (
              <div key={f.k} className="flex items-center justify-between px-4 py-3">
                <dt className="text-xs text-ink-faint">{f.k}</dt>
                <dd className="tabular max-w-[62%] truncate text-right text-sm font-semibold text-ink">{f.v}</dd>
              </div>
            ))}
          </dl>
        </div>

        {/* variant detail */}
        <div className="animate-rise mt-4">
          <p className="label-micro mb-2 px-1">{v.section.heading}</p>
          <div className="card divide-y divide-hairline/70 overflow-hidden">
            {v.section.items.map((it) => (
              <div key={it.title} className="flex items-start gap-3 px-4 py-3">
                <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full" style={{ background: tone }} />
                <div>
                  <p className="text-sm font-bold text-ink">{it.title}</p>
                  <p className="text-xs leading-relaxed text-ink-soft">{it.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* flagged recap */}
        <div className="animate-rise mt-4 flex items-start gap-2.5 rounded-ctrl border border-hairline bg-surface2 px-4 py-3">
          <ShieldCheck size={16} className="mt-0.5 shrink-0 text-eco-blue" />
          <p className="text-xs leading-relaxed text-ink-soft">
            Flagged because {result.reasons[0]?.detail.toLowerCase() ?? "it broke your usual pattern"}
            {result.reasons.length > 1 ? `, plus ${result.reasons.length - 1} more signal${result.reasons.length - 1 > 1 ? "s" : ""}.` : "."}
          </p>
        </div>

        {/* actions */}
        <div className="mt-auto space-y-2.5 pt-7">
          <button onClick={onPrimary} className="btn-primary w-full py-3.5 text-sm">
            {v.primary}
          </button>
          {v.secondary && (
            <button onClick={onSecondary ?? onPrimary} className="btn-ghost w-full py-3.5 text-sm">
              {v.secondary}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
