/**
 * Eco Express core types.
 *
 * This module is framework-agnostic on purpose. Nothing in `core/` imports
 * React or touches the DOM. The PWA is the first consumer of this logic; the
 * planned Android SDK is the second. Both read the SAME engine, so the score
 * and the fraud verdict are identical everywhere.
 *
 * Money is stored in integer kobo (1 naira = 100 kobo) to avoid float drift.
 */

export type Direction = "in" | "out";

export type Channel = "mobile" | "web" | "ussd" | "pos" | "atm";

export type TxnCategory =
  | "income" // salary, part-time, family transfer, business inflow
  | "transfer_out"
  | "transfer_in"
  | "airtime"
  | "bills"
  | "savings" // move to a savings pocket / fixed
  | "purchase";

export interface Transaction {
  id: string;
  ts: string; // ISO timestamp
  amountKobo: number; // always positive; `direction` carries the sign
  direction: Direction;
  category: TxnCategory;
  counterpartyId: string; // stable id of the other account/merchant
  counterpartyName: string;
  channel: Channel;
  deviceId: string; // device the txn was initiated from
  location: string; // approximate city
}

export interface BlazeAccount {
  id: string;
  ownerName: string;
  openedAt: string; // ISO date
  balanceKobo: number; // current balance
  transactions: Transaction[]; // newest last
}

/**
 * A per-user behavioural fingerprint. Built from the first 60 days of history
 * and then used by SentryAI to decide whether a new transaction is "normal for
 * this specific person" rather than "normal for everyone".
 */
export interface Fingerprint {
  builtFrom: number; // number of txns used to build it
  windowDays: number;
  typicalMaxSendKobo: number; // p95 of outbound amounts
  typicalMedianSendKobo: number; // p50 of outbound amounts
  hardCeilingKobo: number; // absolute max ever sent
  sendsPerWeek: number; // typical outbound frequency
  knownRecipients: Set<string>; // counterparty ids seen before
  typicalHours: Set<number>; // hours of day (0-23) they usually transact
  knownDevices: Set<string>;
  knownLocations: Set<string>;
}

export type Severity = "none" | "low" | "medium" | "high";

/**
 * The result of running one transaction against the fingerprint. This is what
 * drives the full-screen SentryAI interrupt.
 */
export interface DeviationResult {
  flagged: boolean;
  severity: Severity;
  reasons: DeviationReason[];
  /** One plain-language sentence for the interrupt screen. */
  headline: string;
}

export interface DeviationReason {
  key:
    | "amount"
    | "new_recipient"
    | "frequency"
    | "unusual_hour"
    | "new_device"
    | "new_location";
  label: string;
  detail: string; // e.g. "19x your usual maximum send amount"
  weight: number; // contribution to severity, 0..1
}

export type ScoreBand =
  | "Building"
  | "Fair"
  | "Good"
  | "Very good"
  | "Excellent";

export type FactorRating =
  | "Limited"
  | "Fair"
  | "Good"
  | "Very good"
  | "Excellent";

export interface ScoreFactor {
  key:
    | "income_regularity"
    | "balance_maintenance"
    | "spending_predictability"
    | "savings_behaviour"
    | "income_diversity"
    | "account_tenure";
  label: string;
  weight: number; // fixed weight, transparent to judges
  normalized: number; // 0..1 sub-score
  rating: FactorRating;
  explanation: string; // plain-language "why"
}

export interface LoanTier {
  eligible: boolean;
  tier: 0 | 1 | 2;
  lowKobo: number;
  highKobo: number;
  label: string;
}

export interface BehaviourScore {
  score: number; // 300..850, mirrors conventional ranges
  band: ScoreBand;
  factors: ScoreFactor[];
  headline: string; // the single "why your score is here" line
  loan: LoanTier;
  updatedAt: string;
}
