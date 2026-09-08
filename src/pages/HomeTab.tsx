import { useState } from "react";
import { amara, naira, type BehaviourScore } from "../core/index.js";
import type { Icon } from "@phosphor-icons/react";
import { ScoreRing } from "../components/ScoreRing.js";
import { useCountUp } from "../hooks/useCountUp.js";
import {
  PayMerchant,
  TransferNow,
  XpressCash,
  PayBill,
  Airtime,
  BuyData,
  Eye,
  EyeOff,
  ArrowRt,
} from "../components/Icons.js";

const QUICK: { label: string; Icon: Icon; action: "transfer" | "soon" }[] = [
  { label: "Pay Merchant", Icon: PayMerchant, action: "soon" },
  { label: "Transfer Now", Icon: TransferNow, action: "transfer" },
  { label: "Xpress Cash", Icon: XpressCash, action: "soon" },
  { label: "Pay Bill", Icon: PayBill, action: "soon" },
  { label: "Buy Airtime", Icon: Airtime, action: "soon" },
  { label: "Buy Data", Icon: BuyData, action: "soon" },
];

export function HomeTab({
  score,
  onTransfer,
  onGoScore,
  onComingSoon,
}: {
  score: BehaviourScore;
  onTransfer: () => void;
  onGoScore: () => void;
  onComingSoon: (title: string, Icon: Icon) => void;
}) {
  const [hidden, setHidden] = useState(false);
  const balance = useCountUp(amara.balanceKobo, 1000);

  return (
    <div className="stagger pb-2">
      {/* Quick Access */}
      <section>
        <h2 className="label-micro mb-3">Quick Access</h2>
        <div className="grid grid-cols-3 gap-2.5">
          {QUICK.map(({ label, Icon, action }) => (
            <button
              key={label}
              onClick={() => (action === "transfer" ? onTransfer() : onComingSoon(label, Icon))}
              className="flex flex-col items-center gap-2 rounded-ctrl border border-hairline bg-surface py-4 shadow-card transition-transform active:scale-[0.96]"
            >
              <span className="grid h-11 w-11 place-items-center rounded-full bg-eco-blue/10 text-eco-blue">
                <Icon size={20} weight="bold" />
              </span>
              <span className="text-[11px] font-semibold text-ink">{label}</span>
            </button>
          ))}
        </div>
      </section>

      {/* Accounts */}
      <section className="mt-6">
        <div className="mb-2 flex items-center justify-between">
          <h2 className="label-micro">Accounts</h2>
          <button className="flex items-center gap-1 text-[11px] font-bold text-eco-blue">
            View All <ArrowRt size={12} weight="bold" />
          </button>
        </div>

        <div className="brand-card relative overflow-hidden rounded-card p-5 shadow-card">
          <div className="pointer-events-none absolute -right-16 -top-16 h-44 w-44 rounded-full bg-eco-green/20 blur-2xl" />
          <div className="relative flex items-start justify-between">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-[0.14em] text-white/70">
                Total available balance
              </span>
              <p className="tabular mt-1.5 text-[38px] font-extrabold leading-none tracking-tight text-white">
                {hidden ? "NGN ••••••" : naira(balance)}
              </p>
            </div>
            <button
              onClick={() => setHidden((v) => !v)}
              className="grid h-9 w-9 place-items-center rounded-full bg-white/15 text-white"
              aria-label={hidden ? "Show balance" : "Hide balance"}
            >
              {hidden ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          <div className="relative mt-6 flex items-end justify-between">
            <div>
              <div className="h-6 w-9 rounded-md bg-gradient-to-br from-eco-gold-hi to-eco-gold" />
              <p className="mt-2 text-xs tracking-wider text-white/70">
                Blaze account &middot; &bull;&bull;&bull;&bull; 4097
              </p>
            </div>
            <button
              onClick={onGoScore}
              className="flex items-center gap-2 rounded-full bg-white/12 px-3 py-1.5 backdrop-blur"
            >
              <span className="text-[10px] font-bold uppercase tracking-wider text-white/60">Score</span>
              <span className="tabular text-sm font-bold text-white">{score.score}</span>
              <span className="text-[11px] text-white/70">{score.band}</span>
            </button>
          </div>
        </div>
      </section>

      {/* BehaviourScore (our credit identity) */}
      <section className="mt-4">
        <button
          onClick={onGoScore}
          className="card flex w-full items-center gap-4 p-4 text-left transition-transform active:scale-[0.99]"
        >
          <ScoreRing score={score.score} band={score.band} size={64} />
          <div className="min-w-0 flex-1">
            <span className="label-micro">BehaviourScore</span>
            <p className="mt-0.5 text-sm font-extrabold text-ink">{score.band}</p>
            <p className="mt-0.5 truncate text-xs text-ink-soft">
              {score.loan.eligible ? score.loan.label : score.headline}
            </p>
          </div>
          <span className="grid h-8 w-8 place-items-center rounded-full bg-eco-blue/10 text-eco-blue">
            <ArrowRt size={16} weight="bold" />
          </span>
        </button>
      </section>

      {/* promo (gold) */}
      <section className="mt-4">
        <button
          onClick={onGoScore}
          className="relative flex w-full items-center gap-4 overflow-hidden rounded-card p-4 text-left"
          style={{ background: "linear-gradient(120deg, rgb(var(--eco-gold-hi)), rgb(var(--eco-gold)))" }}
        >
          <div className="min-w-0 flex-1">
            <p className="text-sm font-extrabold text-eco-blue-deep">
              You are eligible for a Blaze micro-loan
            </p>
            <p className="mt-0.5 text-xs font-medium text-eco-blue-deep/80">
              Your BehaviourScore unlocked up to {naira(score.loan.highKobo)}. See how.
            </p>
          </div>
          <ArrowRt size={20} weight="bold" className="shrink-0 text-eco-blue-deep" />
        </button>
      </section>
    </div>
  );
}
