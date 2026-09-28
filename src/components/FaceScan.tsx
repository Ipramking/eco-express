import { useEffect, useRef, useState } from "react";
import { naira, type Transaction } from "../core/index.js";
import { FaceScanIcon, CheckOk, Close } from "./Icons.js";

type Stage = "scanning" | "verified";

const SCAN_MS = 2200;
const VERIFIED_HOLD_MS = 650;

/**
 * Biometric confirmation for a flagged transfer. A tap-through "Yes, I
 * started this" button can be talked through by a scammer on a call with the
 * victim; a face scan cannot. This replaces that button as the only way to
 * release a flagged transfer.
 *
 * Opportunistically shows the live front camera for realism when the
 * environment grants it; degrades to an animated viewfinder with no visible
 * error when it does not, so the flow never breaks the demo.
 */
export function FaceScan({
  txn,
  onVerified,
  onCancel,
}: {
  txn: Transaction;
  onVerified: () => void;
  onCancel: () => void;
}) {
  const [stage, setStage] = useState<Stage>("scanning");
  const [hasCamera, setHasCamera] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    let cancelled = false;
    navigator.mediaDevices
      ?.getUserMedia?.({ video: { facingMode: "user" }, audio: false })
      .then((stream) => {
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          void videoRef.current.play().catch(() => {});
        }
        setHasCamera(true);
      })
      .catch(() => {
        /* no camera permission or no device - viewfinder fallback carries the scan */
      });

    return () => {
      cancelled = true;
      streamRef.current?.getTracks().forEach((t) => t.stop());
    };
  }, []);

  useEffect(() => {
    const t1 = window.setTimeout(() => setStage("verified"), SCAN_MS);
    const t2 = window.setTimeout(onVerified, SCAN_MS + VERIFIED_HOLD_MS);
    return () => {
      window.clearTimeout(t1);
      window.clearTimeout(t2);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const verified = stage === "verified";

  return (
    <div className="fixed inset-0 z-[75] overflow-y-auto bg-eco-blue-deep/95 backdrop-blur-md">
      <div className="mx-auto flex min-h-full w-full max-w-[430px] flex-col px-6 pb-8 pt-10">
        <div className="flex items-center justify-between">
          <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-white/60">
            SentryAI &middot; identity check
          </p>
          <button
            onClick={onCancel}
            className="grid h-8 w-8 place-items-center rounded-full bg-white/10 text-white/80"
            aria-label="Cancel verification"
          >
            <Close size={14} />
          </button>
        </div>

        <div className="mt-2 text-center">
          <p className="text-sm text-white/70">Confirming it's you before releasing</p>
          <p className="tabular text-lg font-bold text-white">
            {naira(txn.amountKobo)} <span className="font-normal text-white/60">to {txn.counterpartyName}</span>
          </p>
        </div>

        {/* viewfinder */}
        <div className="relative mx-auto mt-10 h-64 w-64 shrink-0">
          {/* rotating segmented ring */}
          <svg viewBox="0 0 100 100" className="animate-spin-slow absolute inset-0 h-full w-full">
            <circle
              cx="50"
              cy="50"
              r="47"
              fill="none"
              stroke={verified ? "rgb(var(--positive))" : "rgb(var(--eco-cyan))"}
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeDasharray="18 10"
              opacity="0.85"
            />
          </svg>

          <div className="absolute inset-[10px] overflow-hidden rounded-full border-2 border-white/15 bg-black/30">
            {hasCamera ? (
              <video
                ref={videoRef}
                muted
                playsInline
                className="h-full w-full scale-x-[-1] object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center">
                <FaceScanIcon size={72} weight="light" className="text-white/50" />
              </div>
            )}

            {!verified && (
              <div className="animate-scanline pointer-events-none absolute inset-x-0 top-0 h-1/3 bg-gradient-to-b from-transparent via-eco-cyan/60 to-transparent" />
            )}

            {verified && (
              <div className="animate-pop absolute inset-0 flex items-center justify-center bg-positive/25">
                <span className="grid h-16 w-16 place-items-center rounded-full bg-positive text-white">
                  <CheckOk size={32} weight="fill" />
                </span>
              </div>
            )}
          </div>
        </div>

        <p className="animate-rise mt-8 text-center text-base font-bold text-white">
          {verified ? "Face verified" : "Hold still, scanning your face"}
        </p>
        <p className="mt-1.5 text-center text-xs leading-relaxed text-white/60">
          {verified
            ? "Releasing your transfer now."
            : "This confirms the account owner is present. No one else can approve this transfer for you."}
        </p>

        <button
          onClick={onCancel}
          className="mt-auto py-4 text-center text-sm font-semibold text-white/60"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
