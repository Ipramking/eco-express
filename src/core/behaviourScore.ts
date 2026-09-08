/**
 * BehaviourScore: a credit identity built from transaction behaviour, not loan
 * history. Six inputs, fixed and visible weights, a 300-850 range that mirrors
 * conventional credit scoring so any banker reading it knows what it means.
 *
 * Every factor carries a plain-language "why" so the score is explainable on
 * screen and defensible in front of engineering judges.
 */

import type {
  BehaviourScore,
  BlazeAccount,
  LoanTier,
  ScoreBand,
  ScoreFactor,
  FactorRating,
} from "./types.js";
import {
  clamp,
  coefficientOfVariation,
  daysBetween,
  mean,
  NAIRA,
} from "./money.js";

const WEIGHTS = {
  income_regularity: 0.22,
  balance_maintenance: 0.18,
  spending_predictability: 0.15,
  savings_behaviour: 0.15,
  income_diversity: 0.15,
  account_tenure: 0.15,
} as const;

const SCORE_MIN = 300;
const SCORE_MAX = 850;

export function computeBehaviourScore(
  account: BlazeAccount,
  asOf: string
): BehaviourScore {
  const txns = account.transactions;
  const inflows = txns.filter((t) => t.category === "income");
  const outflows = txns.filter((t) => t.direction === "out");

  // --- 1. Income regularity: consistent monthly inflow timing + size --------
  const incomeByMonth = groupByMonth(inflows.map((t) => t.ts));
  const monthsWithIncome = Object.keys(incomeByMonth).length;
  const incomeAmounts = inflows.map((t) => t.amountKobo);
  const incomeCv = coefficientOfVariation(incomeAmounts);
  const regularity = clamp(
    0.5 * fractionMonthsCovered(account, asOf, monthsWithIncome) +
      0.5 * (1 - clamp(incomeCv, 0, 1)),
    0,
    1
  );

  // --- 2. Balance maintenance: keeps a buffer vs spends to zero --------------
  const avgInflow = mean(incomeAmounts) || 1;
  const balanceRatio = clamp(account.balanceKobo / avgInflow, 0, 1);
  const balance = balanceRatio;

  // --- 3. Spending predictability: stable outflow sizes ----------------------
  const spendCv = coefficientOfVariation(outflows.map((t) => t.amountKobo));
  const predictability = clamp(1 - spendCv / 1.5, 0, 1);

  // --- 4. Savings behaviour: regular moves to savings ------------------------
  const savingsTxns = txns.filter((t) => t.category === "savings");
  const savings = clamp(savingsTxns.length / Math.max(monthsWithIncome, 1), 0, 1);

  // --- 5. Income source diversity --------------------------------------------
  const sources = new Set(inflows.map((t) => t.counterpartyId));
  const diversity = clamp((sources.size - 1) / 2, 0, 1); // 1 source=0, 3+=1

  // --- 6. Account tenure ------------------------------------------------------
  const tenureDays = daysBetween(account.openedAt, asOf);
  const tenure = clamp(tenureDays / 180, 0, 1); // 6 months = full marks

  const factors: ScoreFactor[] = [
    factor("income_regularity", "Income regularity", regularity, incomeExplain(regularity, monthsWithIncome)),
    factor("balance_maintenance", "Balance maintenance", balance, balanceExplain(balance)),
    factor("spending_predictability", "Spending predictability", predictability, spendExplain(predictability)),
    factor("savings_behaviour", "Savings behaviour", savings, savingsExplain(savingsTxns.length)),
    factor("income_diversity", "Income sources", diversity, diversityExplain(sources.size)),
    factor("account_tenure", "Account tenure", tenure, tenureExplain(tenureDays)),
  ];

  const norm = factors.reduce((acc, f) => acc + f.weight * f.normalized, 0);
  const score = Math.round(SCORE_MIN + norm * (SCORE_MAX - SCORE_MIN));
  const band = toBand(score);

  return {
    score,
    band,
    factors,
    headline: buildHeadline(factors, band),
    loan: toLoanTier(score),
    updatedAt: asOf,
  };
}

function factor(
  key: ScoreFactor["key"],
  label: string,
  normalized: number,
  explanation: string
): ScoreFactor {
  return {
    key,
    label,
    weight: WEIGHTS[key],
    normalized,
    rating: toRating(normalized),
    explanation,
  };
}

// ---- helpers ---------------------------------------------------------------

function groupByMonth(timestamps: string[]): Record<string, number> {
  const out: Record<string, number> = {};
  for (const ts of timestamps) {
    const d = new Date(ts);
    const key = `${d.getFullYear()}-${d.getMonth()}`;
    out[key] = (out[key] || 0) + 1;
  }
  return out;
}

function fractionMonthsCovered(
  account: BlazeAccount,
  asOf: string,
  monthsWithIncome: number
): number {
  const totalMonths = Math.max(
    1,
    Math.round(daysBetween(account.openedAt, asOf) / 30)
  );
  return clamp(monthsWithIncome / totalMonths, 0, 1);
}

function toBand(score: number): ScoreBand {
  if (score >= 740) return "Excellent";
  if (score >= 670) return "Very good";
  if (score >= 580) return "Good";
  if (score >= 500) return "Fair";
  return "Building";
}

function toRating(n: number): FactorRating {
  if (n >= 0.85) return "Excellent";
  if (n >= 0.65) return "Very good";
  if (n >= 0.45) return "Good";
  if (n >= 0.25) return "Fair";
  return "Limited";
}

function toLoanTier(score: number): LoanTier {
  if (score >= 670) {
    return {
      eligible: true,
      tier: 2,
      lowKobo: 30000 * NAIRA,
      highKobo: 100000 * NAIRA,
      label: "Eligible for a Blaze micro-loan up to ₦100,000",
    };
  }
  if (score >= 580) {
    return {
      eligible: true,
      tier: 1,
      lowKobo: 10000 * NAIRA,
      highKobo: 30000 * NAIRA,
      label: "Eligible for a Blaze micro-loan of ₦10,000 - ₦30,000",
    };
  }
  return {
    eligible: false,
    tier: 0,
    lowKobo: 0,
    highKobo: 0,
    label: "Keep building - a small consistent step raises this fast",
  };
}

function buildHeadline(factors: ScoreFactor[], band: ScoreBand): string {
  const strongest = [...factors].sort((a, b) => b.normalized - a.normalized)[0];
  const weakest = [...factors].sort((a, b) => a.normalized - b.normalized)[0];
  if (band === "Building" || band === "Fair") {
    return `Your score is held back by ${weakest.label.toLowerCase()}. ${weakest.explanation}`;
  }
  return `Your score is growing on the strength of your ${strongest.label.toLowerCase()}. ${strongest.explanation}`;
}

// ---- plain-language explanations ------------------------------------------

function incomeExplain(n: number, months: number): string {
  return n >= 0.6
    ? `Money has arrived consistently across ${months} month${months === 1 ? "" : "s"}.`
    : "Inflows are irregular. Consistent monthly income will raise this.";
}
function balanceExplain(n: number): string {
  return n >= 0.5
    ? "You keep a healthy balance instead of spending every inflow."
    : "Your balance is often drawn down to near zero after inflows.";
}
function spendExplain(n: number): string {
  return n >= 0.5
    ? "Your spending is stable and predictable month to month."
    : "Your spending swings a lot between months.";
}
function savingsExplain(count: number): string {
  return count > 0
    ? `You've moved money to savings ${count} time${count === 1 ? "" : "s"}.`
    : "No savings activity yet. Even small regular saves help.";
}
function diversityExplain(sources: number): string {
  return sources >= 2
    ? `Income arrives from ${sources} different sources.`
    : "All your income comes from a single source.";
}
function tenureExplain(days: number): string {
  const m = Math.round(days / 30);
  return `Your account has been active for about ${m} month${m === 1 ? "" : "s"}.`;
}

export { WEIGHTS, SCORE_MIN, SCORE_MAX };
