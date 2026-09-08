import { useMemo, useState } from "react";
import { amara, naira, NAIRA, type Transaction } from "../core/index.js";
import { Send, Shield, ChevronRight } from "./Icons.js";

/**
 * ClearUX transfer: three steps only (amount, recipient, confirm), down from
 * the six-plus step legacy flow. Frequent recipients are surfaced with no
 * search. The confirm screen shows the live SentryAI status so the user knows
 * their behaviour is being watched before they submit.
 *
 * The built transaction is handed back to the shell, which runs it through the
 * same SentryAI engine as everything else, so an unusual send here triggers the
 * real interrupt.
 */
type Step = 1 | 2 | 3;

interface Payee {
  id: string;
  name: string;
}

export function TransferFlow({
  onSubmit,
  onClose,
}: {
  onSubmit: (t: Transaction) => void;
  onClose: () => void;
}) {
  const [step, setStep] = useState<Step>(1);
  const [amountNaira, setAmountNaira] = useState("");
  const [payee, setPayee] = useState<Payee | null>(null);
  const [newAcct, setNewAcct] = useState("");
  const [pin, setPin] = useState("");

  const frequent = useMemo<Payee[]>(() => {
    const seen = new Map<string, string>();
    for (const t of amara.transactions) {
      if (t.direction === "out" && t.category === "transfer_out") {
        seen.set(t.counterpartyId, t.counterpartyName);
      }
    }
    return [...seen].map(([id, name]) => ({ id, name })).slice(0, 5);
  }, []);

  const amountKobo = Math.round((parseFloat(amountNaira) || 0) * NAIRA);
  const canNext1 = amountKobo > 0;
  const canNext2 = !!payee || newAcct.length >= 10;

  function chooseNew() {
    setPayee({ id: `new_${newAcct}`, name: `${newAcct} (new)` });
  }

  function submit() {
    if (!payee) return;
    const known = amara.transactions.find(
      (t) => t.counterpartyId === payee.id
    );
    onSubmit({
      id: `send-${Date.now()}`,
      ts: new Date().toISOString(),
      amountKobo,
      direction: "out",
      category: "transfer_out",
      counterpartyId: payee.id,
      counterpartyName: payee.name,
      channel: "mobile",
      // known payee => Amara's own device/location, so normal sends never flag;
      // a new payee inherits an unfamiliar counterparty that SentryAI can catch.
      deviceId: known?.deviceId ?? "device-amara-pixel",
      location: "Lagos",
    });
  }

  return (
    <div className="fixed inset-0 z-[65] mx-auto flex max-w-[430px] flex-col bg-bg animate-rise">
      {/* header */}
      <div className="flex items-center justify-between px-5 pt-safe">
        <h2 className="text-xl font-extrabold text-ink">Send money</h2>
        <button
          onClick={onClose}
          className="flex min-h-[40px] min-w-[40px] items-center justify-center rounded-full text-ink-faint"
          aria-label="Close"
        >
          ✕
        </button>
      </div>

      {/* step dots */}
      <div className="mt-4 flex gap-1.5 px-5">
        {[1, 2, 3].map((s) => (
          <span
            key={s}
            className={`h-1 flex-1 rounded-full ${
              s <= step ? "bg-eco-cyan" : "bg-hairline"
            }`}
          />
        ))}
      </div>

      <div className="flex-1 overflow-y-auto px-5 pt-6">
        {step === 1 && (
          <div>
            <span className="label-micro">Amount</span>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-bold text-ink-faint">₦</span>
              <input
                autoFocus
                inputMode="decimal"
                value={amountNaira}
                onChange={(e) =>
                  setAmountNaira(e.target.value.replace(/[^0-9.]/g, ""))
                }
                placeholder="0"
                className="tabular w-full bg-transparent text-4xl font-extrabold text-ink outline-none placeholder:text-ink-faint"
              />
            </div>
            <p className="mt-2 text-xs text-ink-faint">
              Balance {naira(amara.balanceKobo)}
            </p>
          </div>
        )}

        {step === 2 && (
          <div>
            <span className="label-micro">Frequent recipients</span>
            <div className="mt-2 card divide-y divide-hairline/60 overflow-hidden">
              {frequent.map((p) => (
                <button
                  key={p.id}
                  onClick={() => setPayee(p)}
                  className={`flex w-full items-center gap-3 px-4 py-3 text-left ${
                    payee?.id === p.id ? "bg-eco-blue/15" : ""
                  }`}
                >
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-surface2 text-xs font-bold text-eco-cyan">
                    {p.name[0]}
                  </span>
                  <span className="flex-1 text-sm font-medium text-ink">
                    {p.name}
                  </span>
                  {payee?.id === p.id && (
                    <ChevronRight className="text-eco-cyan" />
                  )}
                </button>
              ))}
            </div>

            <span className="label-micro mt-5 block">Or a new account</span>
            <input
              inputMode="numeric"
              value={newAcct}
              onChange={(e) => {
                setNewAcct(e.target.value.replace(/[^0-9]/g, "").slice(0, 11));
                setPayee(null);
              }}
              onBlur={() => newAcct.length >= 10 && chooseNew()}
              placeholder="Account number"
              className="mt-2 w-full rounded-ctrl border border-hairline bg-surface/50 px-4 py-3 text-sm text-ink outline-none placeholder:text-ink-faint focus:border-eco-cyan"
            />
          </div>
        )}

        {step === 3 && payee && (
          <div>
            <div className="card p-5 text-center">
              <span className="label-micro">You are sending</span>
              <p className="tabular mt-1 text-3xl font-extrabold text-ink">
                {naira(amountKobo)}
              </p>
              <p className="mt-1 text-sm text-ink-soft">to {payee.name}</p>
            </div>

            <div className="mt-3 flex items-center gap-2 rounded-ctrl border border-positive/25 bg-positive/10 px-4 py-3">
              <Shield size={16} className="text-positive" />
              <span className="text-xs text-ink-soft">
                SentryAI is checking this against your usual pattern.
              </span>
            </div>

            <span className="label-micro mt-5 block">Enter your PIN</span>
            <div className="mt-2 flex items-center gap-3">
              <div className="flex gap-2">
                {[0, 1, 2, 3].map((i) => (
                  <span
                    key={i}
                    className={`h-3 w-3 rounded-full ${
                      i < pin.length ? "bg-eco-cyan" : "bg-hairline"
                    }`}
                  />
                ))}
              </div>
              <input
                autoFocus
                inputMode="numeric"
                value={pin}
                onChange={(e) =>
                  setPin(e.target.value.replace(/[^0-9]/g, "").slice(0, 4))
                }
                className="w-24 bg-transparent text-transparent caret-eco-cyan outline-none"
                aria-label="PIN"
              />
            </div>
          </div>
        )}
      </div>

      {/* footer action */}
      <div className="safe-bottom px-5 pt-3">
        {step === 1 && (
          <button
            disabled={!canNext1}
            onClick={() => setStep(2)}
            className="btn-primary w-full py-4 text-base disabled:opacity-40"
          >
            Continue
          </button>
        )}
        {step === 2 && (
          <button
            disabled={!canNext2}
            onClick={() => {
              if (!payee && newAcct.length >= 10) chooseNew();
              setStep(3);
            }}
            className="btn-primary w-full py-4 text-base disabled:opacity-40"
          >
            Continue
          </button>
        )}
        {step === 3 && (
          <button
            disabled={pin.length < 4}
            onClick={submit}
            className="btn-primary w-full py-4 text-base disabled:opacity-40"
          >
            <Send size={18} /> Send {naira(amountKobo)}
          </button>
        )}
      </div>
    </div>
  );
}
