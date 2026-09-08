import { useState } from "react";
import { amara, type BehaviourScore } from "../core/index.js";
import { PageHeader } from "../components/PageHeader.js";
import { ShieldCheck, Gauge, Cards, ChevronRight, User } from "../components/Icons.js";
import { applyTheme, getTheme, type Theme } from "../theme.js";

const ROWS = [
  { label: "Auto-protect with SentryAI", Icon: ShieldCheck, value: "On" },
  { label: "BehaviourScore updates", Icon: Gauge, value: "Monthly" },
  { label: "Cards and limits", Icon: Cards, value: "" },
];

const THEMES: Theme[] = ["system", "light", "dark"];

export function ProfileTab({ score, onBack }: { score: BehaviourScore; onBack?: () => void }) {
  const [theme, setTheme] = useState<Theme>(getTheme());
  const opened = new Date(amara.openedAt).toLocaleDateString("en-NG", {
    month: "long",
    year: "numeric",
  });

  function pick(t: Theme) {
    applyTheme(t);
    setTheme(t);
  }
  return (
    <div className="animate-rise">
      <PageHeader title="Profile" onBack={onBack} />

      <section className="mt-5 px-5">
        <div className="card flex flex-col items-center p-6 text-center">
          <span className="flex h-16 w-16 items-center justify-center rounded-full bg-eco-blue/25 text-xl font-extrabold text-eco-cyan">
            {amara.ownerName
              .split(" ")
              .map((n) => n[0])
              .join("")}
          </span>
          <p className="mt-3 text-lg font-bold text-ink">{amara.ownerName}</p>
          <p className="text-xs text-ink-faint">Blaze member since {opened}</p>
          <div className="mt-4 flex w-full items-center justify-around border-t border-hairline pt-4">
            <div>
              <p className="tabular text-lg font-bold text-ink">{score.score}</p>
              <p className="text-[11px] text-ink-faint">Score</p>
            </div>
            <div>
              <p className="text-lg font-bold text-ink">{score.band}</p>
              <p className="text-[11px] text-ink-faint">Band</p>
            </div>
            <div>
              <p className="tabular text-lg font-bold text-ink">
                {amara.transactions.length}
              </p>
              <p className="text-[11px] text-ink-faint">Records</p>
            </div>
          </div>
        </div>
      </section>

      <section className="mt-5 px-5">
        <span className="label-micro px-1">Appearance</span>
        <div className="mt-2 grid grid-cols-3 gap-2">
          {THEMES.map((t) => (
            <button
              key={t}
              onClick={() => pick(t)}
              className={`min-h-[44px] rounded-ctrl border py-2.5 text-sm font-semibold capitalize transition ${
                theme === t
                  ? "border-eco-blue bg-eco-blue/15 text-ink"
                  : "border-hairline text-ink-soft"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </section>

      <section className="mt-5 px-5">
        <span className="label-micro px-1">Preferences</span>
        <div className="card mt-2 divide-y divide-hairline/60 overflow-hidden">
          {ROWS.map(({ label, Icon, value }) => (
            <button
              key={label}
              className="flex min-h-[56px] w-full items-center gap-3 px-4 py-3 text-left transition active:bg-surface2/40"
            >
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-surface2 text-eco-cyan">
                <Icon size={18} />
              </span>
              <span className="flex-1 text-sm font-medium text-ink">{label}</span>
              {value && (
                <span className="text-xs font-semibold text-ink-soft">{value}</span>
              )}
              <ChevronRight className="text-ink-faint" />
            </button>
          ))}
        </div>
      </section>

      <section className="mt-5 px-5">
        <button className="btn-ghost w-full gap-2 py-3 text-sm">
          <User size={16} /> Account settings
        </button>
      </section>
    </div>
  );
}
