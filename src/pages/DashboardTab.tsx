import { useMemo, useState } from "react";
import { amara, AS_OF, naira, daysBetween, type BehaviourScore } from "../core/index.js";
import type { Icon } from "@phosphor-icons/react";
import { ChevronDown, Trend, ArrowRt, PlusIcon } from "../components/Icons.js";

const PERIODS = [
  { key: "week", label: "This week", days: 7 },
  { key: "month", label: "This month", days: 31 },
  { key: "quarter", label: "Last 3 months", days: 92 },
] as const;

export function DashboardTab({
  score,
  onGoScore,
  onComingSoon,
}: {
  score: BehaviourScore;
  onGoScore: () => void;
  onComingSoon: (title: string, Icon: Icon) => void;
}) {
  const [period, setPeriod] = useState<(typeof PERIODS)[number]["key"]>("month");

  const spendKobo = useMemo(() => {
    const days = PERIODS.find((p) => p.key === period)!.days;
    return amara.transactions
      .filter((t) => t.direction === "out" && daysBetween(t.ts, AS_OF) <= days)
      .reduce((sum, t) => sum + t.amountKobo, 0);
  }, [period]);

  return (
    <div className="stagger pb-2">
      {/* selector */}
      <button
        onClick={() => onComingSoon("Account insights", Trend)}
        className="card flex w-full items-center justify-between px-4 py-3.5"
      >
        <span className="text-sm font-bold text-ink">Spending</span>
        <ChevronDown size={18} className="text-ink-soft" />
      </button>

      {/* period pills */}
      <div className="mt-3 flex gap-2">
        {PERIODS.map((p) => {
          const is = p.key === period;
          return (
            <button
              key={p.key}
              onClick={() => setPeriod(p.key)}
              className={`rounded-full px-4 py-2 text-xs font-bold transition ${
                is ? "bg-eco-blue text-white" : "border border-hairline bg-surface text-ink-soft"
              }`}
            >
              {p.label}
            </button>
          );
        })}
      </div>

      {/* total spending */}
      <div className="mt-4 rounded-card bg-surface2 p-5">
        <span className="label-micro">Total spending</span>
        <p className="tabular mt-1 text-3xl font-extrabold text-eco-blue">{naira(spendKobo)}</p>
        <p className="mt-1 text-xs text-ink-faint">
          Across {PERIODS.find((p) => p.key === period)!.label.toLowerCase()}
        </p>
      </div>

      {/* score insight (our layer, framed as an insight) */}
      <button
        onClick={onGoScore}
        className="mt-4 flex w-full items-center gap-4 rounded-card border border-eco-blue/20 bg-eco-blue/5 p-4 text-left"
      >
        <span className="grid h-11 w-11 place-items-center rounded-full bg-eco-blue/12 text-eco-blue">
          <Trend size={20} weight="bold" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-extrabold text-ink">Your BehaviourScore is {score.band.toLowerCase()}</p>
          <p className="mt-0.5 truncate text-xs text-ink-soft">{score.headline}</p>
        </div>
        <ArrowRt size={16} weight="bold" className="shrink-0 text-eco-blue" />
      </button>

      {/* standing orders */}
      <div className="mt-4 card p-4">
        <h3 className="text-sm font-bold text-ink">Standing Orders</h3>
        <p className="mt-3 text-sm text-ink-soft">There are no standing orders to show.</p>
        <button
          onClick={() => onComingSoon("Standing Orders", PlusIcon)}
          className="btn-ghost mt-3 w-full py-3 text-sm font-bold text-eco-blue"
        >
          <PlusIcon size={16} weight="bold" /> Create Standing Order
        </button>
      </div>
    </div>
  );
}
