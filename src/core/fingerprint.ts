/**
 * SentryAI, part 1: build a per-user behavioural fingerprint.
 *
 * The fingerprint is the whole point of the product. Rule-based fraud systems
 * ask "is ₦285,000 a big transfer?" (the same question for everyone). SentryAI
 * asks "is ₦285,000 big FOR THIS PERSON?" - and the answer lives here.
 */

import type { BlazeAccount, Fingerprint, Transaction } from "./types.js";
import { percentile } from "./money.js";

const FINGERPRINT_WINDOW_DAYS = 60;

export function buildFingerprint(
  account: BlazeAccount,
  windowDays = FINGERPRINT_WINDOW_DAYS
): Fingerprint {
  const txns = account.transactions;
  const outbound = txns.filter((t) => t.direction === "out");
  const sendAmounts = outbound.map((t) => t.amountKobo);

  // frequency: outbound sends per week over observed span
  const span = observedSpanDays(txns);
  const weeks = Math.max(span / 7, 1);
  const sendsPerWeek = outbound.length / weeks;

  return {
    builtFrom: txns.length,
    windowDays,
    typicalMedianSendKobo: percentile(sendAmounts, 0.5),
    typicalMaxSendKobo: percentile(sendAmounts, 0.95),
    hardCeilingKobo: sendAmounts.length ? Math.max(...sendAmounts) : 0,
    sendsPerWeek,
    knownRecipients: new Set(outbound.map((t) => t.counterpartyId)),
    typicalHours: new Set(txns.map((t) => new Date(t.ts).getHours())),
    knownDevices: new Set(txns.map((t) => t.deviceId)),
    knownLocations: new Set(txns.map((t) => t.location)),
  };
}

function observedSpanDays(txns: Transaction[]): number {
  if (txns.length < 2) return 1;
  const times = txns.map((t) => +new Date(t.ts));
  return (Math.max(...times) - Math.min(...times)) / (1000 * 60 * 60 * 24);
}
