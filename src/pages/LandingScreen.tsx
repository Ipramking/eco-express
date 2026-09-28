import { QRCodeSVG } from "qrcode.react";
import { Gauge, ShieldCheck, Home, ArrowRt } from "../components/Icons.js";

const FEATURES = [
  {
    Icon: Gauge,
    title: "BehaviourScore",
    body: "A credit identity built from how you already bank, no loan history required.",
  },
  {
    Icon: ShieldCheck,
    title: "SentryAI",
    body: "Learns your pattern and stops transfers that don't look like you, verified by face scan.",
  },
  {
    Icon: Home,
    title: "ClearUX",
    body: "The Ecobank experience, rebuilt for speed, with your credit and protection built in.",
  },
];

const DOWNLOAD_PATH = "/download";

/**
 * The gateway before the product: two equally clear ways in, web or Android.
 * The QR encodes an absolute, stable download URL (not a temporary local
 * file) so it keeps working across redeploys without ever needing to be
 * regenerated.
 */
export function LandingScreen({ onUseWebApp }: { onUseWebApp: () => void }) {
  const origin = typeof window !== "undefined" ? window.location.origin : "";
  const downloadUrl = `${origin}${DOWNLOAD_PATH}`;

  return (
    <div className="min-h-full bg-bg">
      {/* hero */}
      <section
        className="px-6 pb-14 pt-safe text-center"
        style={{
          background: "linear-gradient(160deg, rgb(var(--eco-blue)) 0%, rgb(var(--eco-blue-deep)) 130%)",
        }}
      >
        <div className="pt-6">
          <span className="font-extrabold tracking-tight text-white" style={{ fontSize: 26 }}>
            Ecobank
          </span>
          <span className="mx-auto mt-2 block h-[3px] w-12 rounded-full bg-eco-green" />
        </div>

        <h1 className="mx-auto mt-6 max-w-[320px] text-3xl font-extrabold leading-tight text-white">
          Your Smarter Financial Experience
        </h1>
        <p className="mx-auto mt-3 max-w-[320px] text-sm leading-relaxed text-white/75">
          Eco Express turns your Blaze account into a credit identity and a fraud-aware
          guardian, built on Ecobank.
        </p>

        <div className="mx-auto mt-7 flex max-w-[320px] flex-col gap-2.5">
          <button onClick={onUseWebApp} className="btn-primary w-full py-3.5 text-sm">
            Use Web App
          </button>
          <a
            href="#android"
            className="w-full rounded-ctrl border border-white/25 bg-white/[0.08] py-3.5 text-center text-sm font-semibold text-white transition active:scale-[0.98]"
          >
            Get Android App
          </a>
        </div>
      </section>

      {/* android download section */}
      <section id="android" className="px-6 py-10">
        <h2 className="text-xl font-extrabold text-ink">Take it with you.</h2>
        <p className="mt-1.5 text-sm leading-relaxed text-ink-soft">
          Download the Android app for a faster, mobile-first experience of Eco Express.
        </p>

        <div className="card mt-5 flex flex-col items-center gap-4 p-5 text-center sm:flex-row sm:text-left">
          <div className="rounded-ctrl border border-hairline bg-white p-2.5">
            <QRCodeSVG value={downloadUrl} size={128} bgColor="#ffffff" fgColor="#0B3954" level="M" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-bold text-ink">Scan to download</p>
            <p className="mt-1 text-xs leading-relaxed text-ink-soft">
              Point your phone's camera at the code, or use the button below.
            </p>
            <a
              href={DOWNLOAD_PATH}
              download="eco-express.apk"
              className="btn-primary mt-3 w-full gap-1.5 py-3 text-sm sm:w-auto sm:px-6"
            >
              Download APK <ArrowRt size={14} weight="bold" />
            </a>
          </div>
        </div>

        <div className="mt-5 card divide-y divide-hairline/70 overflow-hidden">
          {[
            "Download the APK using the button or QR code above.",
            "Open the downloaded file and allow installs from this source if asked.",
            "Tap Install, then open Eco Express from your app drawer.",
          ].map((step, i) => (
            <div key={step} className="flex items-start gap-3 px-4 py-3">
              <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-eco-blue/10 text-[11px] font-extrabold text-eco-blue">
                {i + 1}
              </span>
              <p className="text-sm leading-relaxed text-ink-soft">{step}</p>
            </div>
          ))}
        </div>
        <p className="mt-3 text-center text-[11px] text-ink-faint">
          Works on Android 8.0 and above. This is a preview build for InnovateX 2026.
        </p>
      </section>

      {/* feature strip */}
      <section className="px-6 pb-14">
        <h2 className="label-micro mb-3 text-center">What's inside</h2>
        <div className="space-y-2.5">
          {FEATURES.map(({ Icon, title, body }) => (
            <div key={title} className="card flex items-start gap-3.5 p-4">
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-eco-blue/10 text-eco-blue">
                <Icon size={19} weight="bold" />
              </span>
              <div className="min-w-0">
                <p className="text-sm font-bold text-ink">{title}</p>
                <p className="mt-0.5 text-xs leading-relaxed text-ink-soft">{body}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
