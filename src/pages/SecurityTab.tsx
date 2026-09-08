import { naira, type Fingerprint } from "../core/index.js";
import { PageHeader } from "../components/PageHeader.js";
import { ShieldCheck, Alert, Send } from "../components/Icons.js";

export interface SecurityEvent {
  id: string;
  ts: string;
  title: string;
  detail: string;
  status: "blocked" | "allowed" | "held";
}

const STATUS_META = {
  blocked: { tone: "text-danger", bg: "bg-danger/15", label: "Blocked" },
  held: { tone: "text-warn", bg: "bg-warn/15", label: "Held" },
  allowed: { tone: "text-positive", bg: "bg-positive/15", label: "Allowed" },
} as const;

/** SentryAI control centre: what your fingerprint knows, and every event. */
export function SecurityTab({
  fingerprint,
  log,
  onTest,
  onBack,
}: {
  fingerprint: Fingerprint;
  log: SecurityEvent[];
  onTest: () => void;
  onBack?: () => void;
}) {
  const stats = [
    { k: "Usual max send", v: naira(fingerprint.typicalMaxSendKobo) },
    { k: "Known recipients", v: String(fingerprint.knownRecipients.size) },
    { k: "Trusted devices", v: String(fingerprint.knownDevices.size) },
    { k: "Sends / week", v: fingerprint.sendsPerWeek.toFixed(1) },
  ];

  return (
    <div className="animate-rise pb-12">
      <PageHeader title="SentryAI" subtitle="Protection tuned to how you bank" onBack={onBack} />

      {/* status banner */}
      <section className="mt-5 px-5">
        <div className="flex items-center gap-3 rounded-card border border-positive/30 bg-positive/10 p-4">
          <span className="flex h-11 w-11 items-center justify-center rounded-full bg-positive/20 text-positive">
            <ShieldCheck size={22} />
          </span>
          <div>
            <p className="text-sm font-bold text-ink">You are protected</p>
            <p className="text-xs text-ink-soft">
              We only stop transfers that break your pattern.
            </p>
          </div>
        </div>
      </section>

      {/* fingerprint */}
      <section className="mt-5 px-5">
        <span className="label-micro px-1">Your behavioural fingerprint</span>
        <div className="mt-2 grid grid-cols-2 gap-2.5">
          {stats.map((s) => (
            <div key={s.k} className="card p-4">
              <p className="text-[11px] text-ink-faint">{s.k}</p>
              <p className="tabular mt-1 text-lg font-bold text-ink">{s.v}</p>
            </div>
          ))}
        </div>
      </section>

      {/* activity feed */}
      <section className="mt-5 px-5">
        <span className="label-micro px-1">Security activity</span>
        <div className="card mt-2 divide-y divide-hairline/60 overflow-hidden">
          {log.length === 0 && (
            <div className="flex flex-col items-center gap-2 px-4 py-8 text-center">
              <ShieldCheck size={26} className="text-ink-faint" />
              <p className="text-sm text-ink-soft">No alerts yet.</p>
              <p className="text-xs text-ink-faint">
                Anything unusual will show up here.
              </p>
            </div>
          )}
          {log.map((e) => {
            const m = STATUS_META[e.status];
            return (
              <div key={e.id} className="flex items-start gap-3 px-4 py-3">
                <span
                  className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${m.bg} ${m.tone}`}
                >
                  {e.status === "allowed" ? <Send size={15} /> : <Alert size={16} />}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-semibold text-ink">{e.title}</p>
                    <span className={`text-[11px] font-bold ${m.tone}`}>
                      {m.label}
                    </span>
                  </div>
                  <p className="text-xs text-ink-soft">{e.detail}</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <section className="mt-5 px-5">
        <button
          onClick={onTest}
          className="btn-ghost w-full gap-2 border-danger/40 py-3 text-sm text-danger"
        >
          <Alert size={16} /> Demo: simulate a suspicious transfer
        </button>
      </section>
    </div>
  );
}
