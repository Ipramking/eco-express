/**
 * Synthetic Blaze dataset. The demo runs entirely on this. It is deterministic
 * (seeded) so a live pitch behaves identically every time.
 *
 * Three personas, one per thing we need to prove:
 *   - `amara`   : a real 90-day thin-file student who earns a "Good" score.
 *   - `tobi`    : an early account (short tenure, erratic) => "Building".
 *   - `fraudTxn`: the single out-of-pattern transfer that triggers SentryAI.
 */

import type { BlazeAccount, Transaction, TxnCategory, Channel } from "./types.js";
import { NAIRA } from "./money.js";

// ---- deterministic PRNG (mulberry32) so the demo never shifts under us -----
function seeded(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const ng = (n: number) => Math.round(n) * NAIRA; // naira -> kobo

interface GenOpts {
  id: string;
  name: string;
  openedAt: string;
  months: number;
  incomeNaira: [number, number]; // monthly inflow band
  incomeDay: number; // day-of-month income tends to land
  incomeJitter: number; // +/- days of drift (0 = very regular)
  savesMonthly: boolean;
  spendVolatility: number; // 0 stable .. 1 erratic
  extraIncomeSources: number; // 0..2 additional inflow sources
  device: string;
  city: string;
}

const RECIPIENTS = [
  "MTN Airtime",
  "Ikeja Electric",
  "Chidi (roommate)",
  "Blaze Savings",
  "Mama",
  "Jumia",
  "Bolt",
  "Campus Cafe",
];

function generate(o: GenOpts): BlazeAccount {
  const rnd = seeded(
    [...o.id].reduce((a, c) => a + c.charCodeAt(0), 0) + o.months
  );
  const txns: Transaction[] = [];
  let n = 0;
  const start = new Date(o.openedAt);
  let balance = ng(4000);

  const push = (
    date: Date,
    amountNaira: number,
    dir: "in" | "out",
    category: TxnCategory,
    counterpartyName: string,
    channel: Channel = "mobile"
  ) => {
    const amountKobo = ng(amountNaira);
    balance += dir === "in" ? amountKobo : -amountKobo;
    txns.push({
      id: `${o.id}-t${n++}`,
      ts: date.toISOString(),
      amountKobo,
      direction: dir,
      category,
      counterpartyId: counterpartyName.toLowerCase().replace(/\s+/g, "_"),
      counterpartyName,
      channel,
      deviceId: o.device,
      location: o.city,
    });
  };

  for (let m = 0; m < o.months; m++) {
    const monthBase = new Date(start);
    monthBase.setMonth(start.getMonth() + m);

    // primary income, lands near incomeDay with some jitter
    const drift = Math.round((rnd() * 2 - 1) * o.incomeJitter);
    const incDate = new Date(monthBase);
    incDate.setDate(Math.min(28, Math.max(1, o.incomeDay + drift)));
    incDate.setHours(9 + Math.floor(rnd() * 3));
    const [lo, hi] = o.incomeNaira;
    const inc = lo + rnd() * (hi - lo);
    push(incDate, inc, "in", "income", "Part-time payout", "web");

    // additional income sources (diversity)
    for (let s = 0; s < o.extraIncomeSources; s++) {
      const d = new Date(monthBase);
      d.setDate(5 + Math.floor(rnd() * 20));
      push(d, 8000 + rnd() * 15000, "in", "income", s === 0 ? "Mama" : "Business inflow", "mobile");
    }

    // savings move
    if (o.savesMonthly) {
      const d = new Date(incDate);
      d.setDate(incDate.getDate() + 1);
      push(d, 5000 + rnd() * 5000, "out", "savings", "Blaze Savings");
    }

    // everyday spend, count/size shaped by volatility
    const spendCount = 6 + Math.floor(rnd() * (o.spendVolatility * 10 + 2));
    for (let i = 0; i < spendCount; i++) {
      const d = new Date(monthBase);
      d.setDate(1 + Math.floor(rnd() * 27));
      d.setHours(8 + Math.floor(rnd() * 12));
      const base = 800 + rnd() * (3000 + o.spendVolatility * 12000);
      const who = RECIPIENTS[Math.floor(rnd() * RECIPIENTS.length)];
      const cat: TxnCategory =
        who === "MTN Airtime"
          ? "airtime"
          : who === "Ikeja Electric"
          ? "bills"
          : who === "Blaze Savings"
          ? "savings"
          : "transfer_out";
      push(d, base, "out", cat, who);
    }
  }

  txns.sort((a, b) => +new Date(a.ts) - +new Date(b.ts));
  return {
    id: o.id,
    ownerName: o.name,
    openedAt: o.openedAt,
    balanceKobo: Math.max(balance, ng(1500)),
    transactions: txns,
  };
}

export const AS_OF = "2026-09-05";

/** The hero persona: 5 months, regular income, saves, stable spend, 2 sources. */
export const amara: BlazeAccount = generate({
  id: "amara",
  name: "Amara Okeke",
  openedAt: "2026-04-02",
  months: 5,
  incomeNaira: [22000, 35000],
  incomeDay: 27,
  incomeJitter: 1,
  savesMonthly: true,
  spendVolatility: 0.25,
  extraIncomeSources: 1,
  device: "device-amara-pixel",
  city: "Lagos",
});

/** Short tenure, erratic, no savings, single source => "Building". */
export const tobi: BlazeAccount = generate({
  id: "tobi",
  name: "Tobi Adeyemi",
  openedAt: "2026-07-20",
  months: 2,
  incomeNaira: [6000, 40000],
  incomeDay: 15,
  incomeJitter: 8,
  savesMonthly: false,
  spendVolatility: 0.85,
  extraIncomeSources: 0,
  device: "device-tobi-tecno",
  city: "Ibadan",
});

/**
 * The SentryAI trigger. ₦285,000 to a brand-new recipient, at 02:14, from a
 * device Amara has never used. Every signal is off at once.
 */
export const fraudTxn: Transaction = {
  id: "amara-fraud-1",
  ts: "2026-09-05T02:14:00.000Z",
  amountKobo: 285000 * NAIRA,
  direction: "out",
  category: "transfer_out",
  counterpartyId: "unknown_0812xxxx991",
  counterpartyName: "0812XXXX991 (new)",
  channel: "mobile",
  deviceId: "device-unknown-a91",
  location: "Port Harcourt",
};

/** A legitimate everyday transfer, for the "we don't nag normal txns" demo. */
export const normalTxn: Transaction = {
  id: "amara-normal-1",
  ts: "2026-09-05T13:05:00.000Z",
  amountKobo: 2500 * NAIRA,
  direction: "out",
  category: "transfer_out",
  counterpartyId: "chidi_(roommate)",
  counterpartyName: "Chidi (roommate)",
  channel: "mobile",
  deviceId: "device-amara-pixel",
  location: "Lagos",
};

export const ACCOUNTS: Record<string, BlazeAccount> = { amara, tobi };
