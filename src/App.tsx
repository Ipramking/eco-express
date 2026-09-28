import { useEffect, useMemo, useState } from "react";
import type { Icon } from "@phosphor-icons/react";
import {
  amara,
  fraudTxn,
  normalTxn,
  AS_OF,
  buildFingerprint,
  computeBehaviourScore,
  evaluate,
  naira,
  type Transaction,
  type DeviationResult,
} from "./core/index.js";
import { BottomNav, type TabKey } from "./components/BottomNav.js";
import { TabScaffold } from "./components/TabScaffold.js";
import { ComingSoon } from "./components/ComingSoon.js";
import { SentryInterrupt } from "./components/SentryInterrupt.js";
import { FaceScan } from "./components/FaceScan.js";
import { SentryResult, type ResultKind } from "./components/SentryResult.js";
import { TransactionReceipt, type VerifiedBy } from "./components/TransactionReceipt.js";
import { TransferFlow } from "./components/TransferFlow.js";
import { HomeSkeleton } from "./components/Skeleton.js";
import { HomeTab } from "./pages/HomeTab.js";
import { DashboardTab } from "./pages/DashboardTab.js";
import { TransactTab } from "./pages/TransactTab.js";
import { ServicesTab } from "./pages/ServicesTab.js";
import { ChatTab } from "./pages/ChatTab.js";
import { ScoreTab } from "./pages/ScoreTab.js";
import { SecurityTab, type SecurityEvent } from "./pages/SecurityTab.js";
import { ProfileTab } from "./pages/ProfileTab.js";
import { SplashScreen } from "./pages/SplashScreen.js";
import { LoginScreen } from "./pages/LoginScreen.js";
import { LandingScreen } from "./pages/LandingScreen.js";
import { Notif as BottomNavBell } from "./components/Icons.js";

type Detail = null | "score" | "security" | "profile";
type Phase = "landing" | "splash" | "login" | "app";

const SEED_LOG: SecurityEvent[] = [
  {
    id: "seed-1",
    ts: "2026-08-30T14:20:00.000Z",
    title: "Sent ₦3,000",
    detail: "To MTN Airtime. Matched your usual pattern.",
    status: "allowed",
  },
  {
    id: "seed-2",
    ts: "2026-08-22T21:05:00.000Z",
    title: "Held ₦52,000",
    detail: "New recipient at an unusual time. You confirmed by SMS.",
    status: "held",
  },
];

export default function App() {
  const fingerprint = useMemo(() => buildFingerprint(amara), []);
  const score = useMemo(() => computeBehaviourScore(amara, AS_OF), []);

  const [tab, setTab] = useState<TabKey>(() => {
    const t = new URLSearchParams(window.location.search).get("tab");
    return (["home", "dashboard", "chat", "transact", "services"] as TabKey[]).includes(t as TabKey)
      ? (t as TabKey)
      : "home";
  });
  const [detail, setDetail] = useState<Detail>(null);
  const [transferOpen, setTransferOpen] = useState(false);
  const [soon, setSoon] = useState<{ title: string; Icon: Icon } | null>(null);
  const [pending, setPending] = useState<{ txn: Transaction; result: DeviationResult } | null>(() => {
    const p = typeof window !== "undefined" ? new URLSearchParams(window.location.search) : null;
    if (p?.has("sentry") || p?.has("facescan")) {
      return { txn: fraudTxn, result: evaluate(fraudTxn, buildFingerprint(amara)) };
    }
    return null;
  });
  const [scanning, setScanning] = useState(
    () => typeof window !== "undefined" && new URLSearchParams(window.location.search).has("facescan")
  );
  const [toast, setToast] = useState<string | null>(null);
  const [log, setLog] = useState<SecurityEvent[]>(SEED_LOG);
  const [outcome, setOutcome] = useState<{ kind: ResultKind; txn: Transaction; result: DeviationResult } | null>(
    () => {
      const r = new URLSearchParams(window.location.search).get("result");
      if (r === "unsure" || r === "cancel") {
        return { kind: r, txn: fraudTxn, result: evaluate(fraudTxn, buildFingerprint(amara)) };
      }
      return null;
    }
  );
  const [receipt, setReceipt] = useState<{ txn: Transaction; verifiedBy: VerifiedBy } | null>(() => {
    const p = new URLSearchParams(window.location.search);
    const r = p.get("result");
    if (r === "proceed" || p.has("receipt")) {
      return { txn: r === "proceed" ? fraudTxn : normalTxn, verifiedBy: r === "proceed" ? "face-scan" : "pin" };
    }
    return null;
  });
  const [loaded, setLoaded] = useState(false);
  const [phase, setPhase] = useState<Phase>(() => {
    const s = new URLSearchParams(window.location.search).get("screen");
    if (s === "login" || s === "app" || s === "splash" || s === "landing") return s;
    return "landing";
  });

  useEffect(() => {
    const t = window.setTimeout(() => setLoaded(true), 750);
    return () => window.clearTimeout(t);
  }, []);

  const isAuthed = () => localStorage.getItem("eco_authed") === "true";

  function flash(msg: string) {
    setToast(msg);
    window.setTimeout(() => setToast(null), 2600);
  }
  function logEvent(e: Omit<SecurityEvent, "id" | "ts">) {
    setLog((prev) => [{ ...e, id: `evt-${Date.now()}`, ts: new Date().toISOString() }, ...prev]);
  }

  /** A routine, unflagged send: PIN already confirmed it in TransferFlow. */
  function completeSend(txn: Transaction, verifiedBy: VerifiedBy) {
    logEvent({
      title: `Sent ${naira(txn.amountKobo)}`,
      detail:
        verifiedBy === "face-scan"
          ? `To ${txn.counterpartyName}. Verified with a face scan.`
          : `To ${txn.counterpartyName}. Matched your usual pattern.`,
      status: "allowed",
    });
    flash(`Money sent successfully. ${naira(txn.amountKobo)} sent to ${txn.counterpartyName}.`);
    setReceipt({ txn, verifiedBy });
  }

  function attempt(txn: Transaction) {
    const result = evaluate(txn, fingerprint);
    if (result.flagged) setPending({ txn, result });
    else completeSend(txn, "pin");
  }

  /** Only the two non-release outcomes of a SentryAI interrupt land here. */
  function resolve(kind: ResultKind) {
    if (!pending) return;
    const { txn, result } = pending;
    const amount = naira(txn.amountKobo);
    if (kind === "cancel") {
      logEvent({ title: `Blocked ${amount}`, detail: result.reasons[0]?.detail ?? "Unusual transfer stopped.", status: "blocked" });
    } else {
      logEvent({ title: `Held ${amount}`, detail: "Waiting for your confirmation by SMS.", status: "held" });
    }
    setOutcome({ kind, txn, result });
    setPending(null);
  }

  function closeOutcome(msg?: string) {
    setOutcome(null);
    setTab("home");
    if (msg) flash(msg);
  }

  function closeReceipt(goTo: "home" | "security") {
    setReceipt(null);
    if (goTo === "security") setDetail("security");
    else {
      setDetail(null);
      setTab("home");
    }
  }

  const openTransfer = () => setTransferOpen(true);
  const comingSoon = (title: string, Icon: Icon) => setSoon({ title, Icon });

  if (phase === "landing") {
    return (
      <div className="mx-auto min-h-full w-full max-w-[430px]">
        <LandingScreen onUseWebApp={() => setPhase("splash")} />
      </div>
    );
  }
  if (phase === "splash") {
    return (
      <div className="mx-auto min-h-full w-full max-w-[430px]">
        <SplashScreen onDone={() => setPhase(isAuthed() ? "app" : "login")} />
      </div>
    );
  }
  if (phase === "login") {
    return (
      <div className="ambient mx-auto min-h-full w-full max-w-[430px]">
        <LoginScreen
          onLogin={() => {
            localStorage.setItem("eco_authed", "true");
            setPhase("app");
          }}
        />
      </div>
    );
  }

  return (
    <div className="ambient relative mx-auto min-h-full w-full max-w-[430px]">
      {detail === "score" && <ScoreTab score={score} onBack={() => setDetail(null)} />}
      {detail === "security" && (
        <SecurityTab fingerprint={fingerprint} log={log} onTest={() => attempt(fraudTxn)} onBack={() => setDetail(null)} />
      )}
      {detail === "profile" && <ProfileTab score={score} onBack={() => setDetail(null)} />}

      {!detail && (
        <>
          {tab === "chat" ? (
            <ChatTab
              onGoScore={() => setDetail("score")}
              onGoSecurity={() => setDetail("security")}
              onTransfer={openTransfer}
            />
          ) : (
            <div key={tab} className="pb-28">
              {tab === "home" &&
                (loaded ? (
                  <TabScaffold onProfile={() => setDetail("profile")} onNotifications={() => comingSoon("Notifications", BottomNavBell)}>
                    <HomeTab
                      score={score}
                      onTransfer={openTransfer}
                      onGoScore={() => setDetail("score")}
                      onComingSoon={comingSoon}
                    />
                  </TabScaffold>
                ) : (
                  <HomeSkeleton />
                ))}

              {tab === "dashboard" && (
                <TabScaffold onProfile={() => setDetail("profile")} onNotifications={() => comingSoon("Notifications", BottomNavBell)}>
                  <DashboardTab score={score} onGoScore={() => setDetail("score")} onComingSoon={comingSoon} />
                </TabScaffold>
              )}

              {tab === "transact" && (
                <TabScaffold onProfile={() => setDetail("profile")} onNotifications={() => comingSoon("Notifications", BottomNavBell)}>
                  <TransactTab onTransfer={openTransfer} onComingSoon={comingSoon} />
                </TabScaffold>
              )}

              {tab === "services" && (
                <TabScaffold onProfile={() => setDetail("profile")} onNotifications={() => comingSoon("Notifications", BottomNavBell)}>
                  <ServicesTab
                    onGoScore={() => setDetail("score")}
                    onGoSecurity={() => setDetail("security")}
                    onComingSoon={comingSoon}
                  />
                </TabScaffold>
              )}
            </div>
          )}

          <BottomNav active={tab} onChange={setTab} />
        </>
      )}

      {transferOpen && (
        <TransferFlow
          onClose={() => setTransferOpen(false)}
          onSubmit={(t) => {
            setTransferOpen(false);
            attempt(t);
          }}
        />
      )}

      {pending && (
        <SentryInterrupt
          txn={pending.txn}
          result={pending.result}
          onVerify={() => setScanning(true)}
          onCancel={() => resolve("cancel")}
          onUnsure={() => resolve("unsure")}
        />
      )}

      {pending && scanning && (
        <FaceScan
          txn={pending.txn}
          onVerified={() => {
            const txn = pending.txn;
            setScanning(false);
            setPending(null);
            completeSend(txn, "face-scan");
          }}
          onCancel={() => setScanning(false)}
        />
      )}

      {outcome && (
        <SentryResult
          kind={outcome.kind}
          txn={outcome.txn}
          result={outcome.result}
          onPrimary={() => {
            if (outcome.kind === "cancel") {
              setOutcome(null);
              setDetail("security");
            } else {
              closeOutcome("Confirmation code sent to ****4097.");
            }
          }}
          onSecondary={() => {
            if (outcome.kind === "unsure") {
              closeOutcome("Transfer cancelled. Your money stays put.");
            } else {
              closeOutcome();
            }
          }}
        />
      )}

      {receipt && (
        <TransactionReceipt
          txn={receipt.txn}
          verifiedBy={receipt.verifiedBy}
          onDashboard={() => closeReceipt("home")}
          onHistory={() => closeReceipt("security")}
        />
      )}

      {soon && <ComingSoon title={soon.title} Icon={soon.Icon} onClose={() => setSoon(null)} />}

      {toast && (
        <div className="fixed inset-x-0 bottom-36 z-[90] mx-auto w-[92%] max-w-[400px] animate-pop rounded-ctrl bg-eco-blue px-4 py-3 text-center text-sm font-semibold text-white shadow-card">
          {toast}
        </div>
      )}
    </div>
  );
}
