import { naira, type Transaction } from "../core/index.js";
import { CheckOk, ArrowRt, ShieldCheck, CopyIcon, Home } from "./Icons.js";

export type VerifiedBy = "pin" | "face-scan";

/** Deterministic, demo-stable reference so a given txn always shows the same ref. */
function reference(txn: Transaction): string {
  const n = [...txn.id].reduce((a, c) => a + c.charCodeAt(0), 0) * 977;
  return "ECX-" + String(1000000 + (n % 8999999));
}

const stamp = (iso?: string) =>
  new Date(iso ?? Date.now()).toLocaleString("en-NG", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

/** For a raw new-number payee ("0812XXXX991 (new)") pull just the number out. */
function recipientNumber(counterpartyName: string): string {
  const m = counterpartyName.match(/^([\d*Xx]+)/);
  return m ? m[1] : "Registered Blaze payee";
}

function receiptText(txn: Transaction, ref: string, verifiedBy: VerifiedBy): string {
  return [
    "Eco Express - Transaction Receipt",
    "Status: Successful",
    `Recipient: ${txn.counterpartyName}`,
    `Recipient number: ${recipientNumber(txn.counterpartyName)}`,
    `Amount: ${naira(txn.amountKobo)}`,
    "Transaction fee: NGN 0.00 (Free with Blaze)",
    `Total debited: ${naira(txn.amountKobo)}`,
    `Date: ${stamp(txn.ts)}`,
    `Reference: ${ref}`,
    "Payment method: Blaze account **** 4097",
    `Verified by: ${verifiedBy === "face-scan" ? "Face scan (SentryAI)" : "Transaction PIN"}`,
  ].join("\n");
}

/**
 * The one canonical "money moved" screen - used for every successful send,
 * whether it was a routine PIN-confirmed transfer or a SentryAI-flagged
 * transfer released by a face scan. Replaces a generic full-screen "Money
 * sent" state with a proper itemised banking receipt: status, recipient,
 * amount, fee, total debited, date, reference, payment method, and how it was
 * verified - plus real view/download/share actions.
 *
 * This is a normal themed screen (not an always-dark overlay like
 * SentryInterrupt/FaceScan), so it uses the standard light/dark tokens.
 */
export function TransactionReceipt({
  txn,
  verifiedBy,
  onDashboard,
  onHistory,
}: {
  txn: Transaction;
  verifiedBy: VerifiedBy;
  onDashboard: () => void;
  onHistory: () => void;
}) {
  const ref = reference(txn);
  const text = receiptText(txn, ref, verifiedBy);

  async function share() {
    if (navigator.share) {
      try {
        await navigator.share({ title: "Eco Express receipt", text });
        return;
      } catch {
        /* user cancelled the native share sheet - fall through to copy */
      }
    }
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      /* clipboard unavailable - nothing more we can safely do here */
    }
  }

  function download() {
    const blob = new Blob([text], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${ref}.txt`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  const rows: { k: string; v: string }[] = [
    { k: "Recipient", v: txn.counterpartyName },
    { k: "Recipient number", v: recipientNumber(txn.counterpartyName) },
    { k: "Amount", v: naira(txn.amountKobo) },
    { k: "Transaction fee", v: "₦0.00 · Free with Blaze" },
    { k: "Total debited", v: naira(txn.amountKobo) },
    { k: "Date & time", v: stamp(txn.ts) },
    { k: "Reference", v: ref },
    { k: "Payment method", v: "Blaze account •••• 4097" },
    { k: "Verified by", v: verifiedBy === "face-scan" ? "Face scan" : "PIN" },
  ];

  return (
    <div className="fixed inset-0 z-[70] overflow-y-auto bg-bg">
      <div className="mx-auto flex min-h-full w-full max-w-[430px] flex-col px-5 pb-8 pt-safe">
        {/* success head */}
        <div className="animate-pop flex flex-col items-center pt-4 text-center">
          <span className="grid h-16 w-16 place-items-center rounded-full bg-positive/15">
            <span className="grid h-12 w-12 place-items-center rounded-full bg-positive text-white">
              <CheckOk size={26} weight="fill" />
            </span>
          </span>
          <p className="mt-3 text-[11px] font-bold uppercase tracking-[0.16em] text-positive">
            Transaction successful
          </p>
          <h1 className="mt-2 text-2xl font-extrabold leading-tight text-ink">
            {naira(txn.amountKobo)} sent
          </h1>
          <p className="mt-1 text-sm text-ink-soft">to {txn.counterpartyName}</p>
        </div>

        {/* receipt card */}
        <div className="animate-rise mt-6 card overflow-hidden">
          <div className="flex items-center justify-between border-b border-hairline px-4 py-3">
            <span className="label-micro">Receipt</span>
            <span className="rounded-full bg-positive px-2.5 py-1 text-[11px] font-bold text-white">
              Successful
            </span>
          </div>
          <dl className="divide-y divide-hairline/70">
            {rows.map((r) => (
              <div key={r.k} className="flex items-center justify-between gap-3 px-4 py-3">
                <dt className="text-xs text-ink-faint">{r.k}</dt>
                <dd className="tabular max-w-[62%] truncate text-right text-sm font-semibold text-ink">{r.v}</dd>
              </div>
            ))}
          </dl>
        </div>

        <div className="animate-rise mt-4 flex items-start gap-2.5 rounded-ctrl border border-hairline bg-surface2 px-4 py-3">
          <ShieldCheck size={16} className="mt-0.5 shrink-0 text-eco-blue" />
          <p className="text-xs leading-relaxed text-ink-soft">
            This receipt is saved to your account. Keep the reference number for any dispute or support request.
          </p>
        </div>

        {/* receipt actions */}
        <div className="animate-rise mt-4 grid grid-cols-2 gap-2.5">
          <button onClick={share} className="btn-ghost py-3 text-sm">
            Share receipt
          </button>
          <button onClick={download} className="btn-ghost gap-1.5 py-3 text-sm">
            <CopyIcon size={15} /> Download
          </button>
        </div>

        {/* primary nav */}
        <div className="mt-auto space-y-2.5 pt-7">
          <button onClick={onDashboard} className="btn-primary w-full gap-2 py-3.5 text-sm">
            <Home size={16} weight="fill" /> Back to dashboard
          </button>
          <button onClick={onHistory} className="btn-ghost w-full gap-1.5 py-3.5 text-sm">
            View in transaction history <ArrowRt size={14} weight="bold" />
          </button>
        </div>
      </div>
    </div>
  );
}
