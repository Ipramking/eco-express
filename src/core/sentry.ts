/**
 * SentryAI, part 2: score one transaction against the fingerprint and decide
 * whether to interrupt.
 *
 * Design rules that make this beat rule-based systems:
 *   - Every threshold is personal (derived from the fingerprint), never global.
 *   - A normal transaction produces zero friction (severity "none").
 *   - When we do interrupt, we say EXACTLY what is unusual, in one sentence.
 */

import type {
  DeviationReason,
  DeviationResult,
  Fingerprint,
  Severity,
  Transaction,
} from "./types.js";
import { naira } from "./money.js";

/** Weighted severity thresholds. Tunable, and transparent for the pitch. */
const FLAG_THRESHOLD = 0.35; // below this we stay silent

export function evaluate(
  txn: Transaction,
  fp: Fingerprint
): DeviationResult {
  const reasons: DeviationReason[] = [];

  // We only police outbound money movement.
  if (txn.direction !== "out") {
    return { flagged: false, severity: "none", reasons: [], headline: "" };
  }

  // 1. Amount vs personal ceiling
  if (fp.typicalMaxSendKobo > 0 && txn.amountKobo > fp.typicalMaxSendKobo) {
    const multiple = txn.amountKobo / Math.max(fp.typicalMaxSendKobo, 1);
    if (multiple >= 2) {
      reasons.push({
        key: "amount",
        label: "Unusually large amount",
        detail: `${round1(multiple)}x your usual maximum send of ${naira(
          fp.typicalMaxSendKobo
        )}`,
        weight: Math.min(0.5, 0.18 * Math.log2(multiple + 1)),
      });
    }
  }

  // 2. Never-seen recipient
  if (!fp.knownRecipients.has(txn.counterpartyId)) {
    reasons.push({
      key: "new_recipient",
      label: "New recipient",
      detail: `You've never sent money to ${txn.counterpartyName} before`,
      weight: 0.2,
    });
  }

  // 3. Unusual hour
  const hour = new Date(txn.ts).getHours();
  if (!fp.typicalHours.has(hour) && (hour <= 5 || hour >= 23)) {
    reasons.push({
      key: "unusual_hour",
      label: "Unusual time",
      detail: `You almost never transact at ${pad(hour)}:00`,
      weight: 0.15,
    });
  }

  // 4. New device
  if (!fp.knownDevices.has(txn.deviceId)) {
    reasons.push({
      key: "new_device",
      label: "New device",
      detail: "This transfer is coming from a device you haven't used before",
      weight: 0.25,
    });
  }

  // 5. New location
  if (!fp.knownLocations.has(txn.location)) {
    reasons.push({
      key: "new_location",
      label: "New location",
      detail: `First transaction we've seen from ${txn.location}`,
      weight: 0.12,
    });
  }

  const score = Math.min(
    1,
    reasons.reduce((acc, r) => acc + r.weight, 0)
  );
  const flagged = score >= FLAG_THRESHOLD;
  const severity = toSeverity(score);

  return {
    flagged,
    severity,
    reasons: reasons.sort((a, b) => b.weight - a.weight),
    headline: flagged ? buildHeadline(txn, reasons) : "",
  };
}

function buildHeadline(txn: Transaction, reasons: DeviationReason[]): string {
  // Lead with the single strongest signal - that is the sentence that breaks
  // the social-engineering moment.
  const top = reasons[0];
  const amount = naira(txn.amountKobo);
  if (top?.key === "amount") {
    return `This transfer of ${amount} is ${top.detail}. Did you start this transfer?`;
  }
  if (top?.key === "new_device") {
    return `A ${amount} transfer just started from a new device. Was this you?`;
  }
  return `This ${amount} transfer looks unusual: ${top?.detail}. Did you start it?`;
}

function toSeverity(score: number): Severity {
  if (score >= 0.6) return "high";
  if (score >= FLAG_THRESHOLD) return "medium";
  if (score > 0) return "low";
  return "none";
}

const round1 = (n: number) => Math.round(n * 10) / 10;
const pad = (n: number) => String(n).padStart(2, "0");
