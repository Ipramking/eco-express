import type { BehaviourScore, FactorRating } from "../core/index.js";
import { ScoreRing } from "../components/ScoreRing.js";
import { PageHeader } from "../components/PageHeader.js";

const RATING_TONE: Record<FactorRating, string> = {
  Excellent: "text-positive",
  "Very good": "text-positive",
  Good: "text-eco-cyan",
  Fair: "text-warn",
  Limited: "text-ink-faint",
};

/** The explainability screen. Every factor shows its weight, rating and a
 *  plain-language reason, so the score is legible and defensible. */
export function ScoreTab({ score, onBack }: { score: BehaviourScore; onBack?: () => void }) {
  return (
    <div className="animate-rise pb-12">
      <PageHeader title="BehaviourScore" subtitle="Built from how you bank, not from loans" onBack={onBack} />

      {/* hero ring */}
      <section className="mt-5 px-5">
        <div className="card flex flex-col items-center p-6 text-center">
          <ScoreRing score={score.score} band={score.band} size={148} />
          <p className="mt-4 max-w-[280px] text-sm leading-relaxed text-ink-soft">
            {score.headline}
          </p>
        </div>
      </section>

      {/* loan tier */}
      <section className="mt-4 px-5">
        <div
          className={`rounded-card border p-4 ${
            score.loan.eligible
              ? "border-positive/30 bg-positive/10"
              : "border-hairline bg-surface/50"
          }`}
        >
          <span className="label-micro">
            {score.loan.eligible ? "Unlocked" : "Next unlock"}
          </span>
          <p className="mt-1 text-sm font-semibold text-ink">
            {score.loan.label}
          </p>
        </div>
      </section>

      {/* factors */}
      <section className="mt-5 px-5">
        <span className="label-micro px-1">What is driving your score</span>
        <div className="mt-2 space-y-2.5">
          {score.factors.map((f) => (
            <div key={f.key} className="card p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-ink">{f.label}</span>
                <span className={`text-xs font-bold ${RATING_TONE[f.rating]}`}>
                  {f.rating}
                </span>
              </div>
              {/* weighted contribution meter */}
              <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-hairline">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-eco-cyan to-eco-accent"
                  style={{ width: `${Math.round(f.normalized * 100)}%` }}
                />
              </div>
              <div className="mt-2 flex items-center justify-between">
                <p className="max-w-[240px] text-xs text-ink-soft">
                  {f.explanation}
                </p>
                <span className="text-[10px] font-medium text-ink-faint">
                  weight {Math.round(f.weight * 100)}%
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      <p className="mt-5 px-6 text-center text-[11px] leading-relaxed text-ink-faint">
        Updated monthly as new transactions arrive. Everything here already lives
        in your Blaze account. No extra documents required.
      </p>
    </div>
  );
}
