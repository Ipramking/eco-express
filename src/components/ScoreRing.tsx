import { SCORE_MIN, SCORE_MAX, type ScoreBand } from "../core/index.js";
import { useCountUp } from "../hooks/useCountUp.js";

/**
 * BehaviourScore ring with a blue-to-gold brand arc that fills on mount, the
 * number counting up in sync. Two sizes: inline teaser and hero.
 */
export function ScoreRing({
  score,
  band,
  size = 84,
}: {
  score: number;
  band: ScoreBand;
  size?: number;
}) {
  const animated = useCountUp(score, 1100);
  const pct = Math.max(0, Math.min(1, (animated - SCORE_MIN) / (SCORE_MAX - SCORE_MIN)));
  const stroke = size >= 120 ? 11 : 7;
  const r = (size - stroke) / 2 - 2;
  const cx = size / 2;
  const circ = 2 * Math.PI * r;
  const dash = pct * circ;
  const id = `ring-${size}`;

  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg viewBox={`0 0 ${size} ${size}`} className="h-full w-full -rotate-90">
        <defs>
          <linearGradient id={id} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="rgb(var(--eco-blue))" />
            <stop offset="55%" stopColor="rgb(var(--eco-blue-bright))" />
            <stop offset="100%" stopColor="rgb(var(--eco-green))" />
          </linearGradient>
        </defs>
        <circle cx={cx} cy={cx} r={r} fill="none" stroke="rgb(var(--hairline))" strokeWidth={stroke} />
        <circle
          cx={cx}
          cy={cx}
          r={r}
          fill="none"
          stroke={`url(#${id})`}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={`${dash} ${circ}`}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span
          className="tabular font-extrabold text-ink"
          style={{ fontSize: size >= 120 ? 38 : 20 }}
        >
          {Math.round(animated)}
        </span>
        <span className="text-[9px] font-semibold text-ink-faint">
          {size >= 120 ? band : `/ ${SCORE_MAX}`}
        </span>
      </div>
    </div>
  );
}
