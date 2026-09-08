/**
 * Public surface of the Eco Express engine.
 *
 * This barrel IS the SDK contract. The PWA imports from here today; the Android
 * SDK will wrap this exact surface tomorrow. Keep it stable and framework-free.
 */

export * from "./types.js";
export { buildFingerprint } from "./fingerprint.js";
export { evaluate } from "./sentry.js";
export {
  computeBehaviourScore,
  WEIGHTS,
  SCORE_MIN,
  SCORE_MAX,
} from "./behaviourScore.js";
export {
  naira,
  nairaExact,
  percentile,
  median,
  mean,
  coefficientOfVariation,
  daysBetween,
  clamp,
  NAIRA,
} from "./money.js";
export {
  amara,
  tobi,
  fraudTxn,
  normalTxn,
  ACCOUNTS,
  AS_OF,
} from "./dataset.js";
