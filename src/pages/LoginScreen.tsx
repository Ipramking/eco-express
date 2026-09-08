import { useState } from "react";
import { amara } from "../core/index.js";
import { Eye, EyeOff, User, LockIcon, ShieldCheck } from "../components/Icons.js";

/**
 * Login. Blue brand header over a white form sheet, matching the reference
 * app's sign-in. Any credentials sign in (prototype), so a judge can walk
 * straight through the flow.
 */
export function LoginScreen({ onLogin }: { onLogin: () => void }) {
  const [username, setUsername] = useState("amara.okeke");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    onLogin();
  };

  return (
    <div className="flex min-h-full flex-col">
      {/* brand header */}
      <div
        className="px-6 pb-16 pt-safe"
        style={{
          background:
            "linear-gradient(160deg, rgb(var(--eco-blue)) 0%, rgb(var(--eco-blue-deep)) 130%)",
        }}
      >
        <div className="pt-6 leading-none">
          <span className="font-extrabold tracking-tight text-white" style={{ fontSize: 30 }}>
            Ecobank
          </span>
          <span className="mt-2 block h-[4px] w-12 rounded-full bg-eco-green" />
          <span className="mt-2 block text-[10px] font-semibold uppercase tracking-[0.2em] text-white/70">
            The Pan African Bank
          </span>
        </div>
      </div>

      {/* form sheet */}
      <form onSubmit={submit} className="-mt-10 flex-1 rounded-t-[26px] bg-bg px-6 pt-7">
        <h1 className="text-2xl font-extrabold text-ink">Welcome back</h1>
        <p className="mt-1 text-sm text-ink-soft">Log in to your Blaze account.</p>

        {/* username */}
        <label className="mt-6 block text-xs font-bold text-ink-soft">Username</label>
        <div className="mt-1.5 flex items-center gap-2 rounded-ctrl border border-hairline bg-surface px-3.5 focus-within:border-eco-blue">
          <User size={18} className="text-ink-faint" />
          <input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            autoComplete="username"
            className="h-12 flex-1 bg-transparent text-sm text-ink outline-none placeholder:text-ink-faint"
            placeholder="Enter your username"
          />
        </div>

        {/* password */}
        <label className="mt-4 block text-xs font-bold text-ink-soft">Password</label>
        <div className="mt-1.5 flex items-center gap-2 rounded-ctrl border border-hairline bg-surface px-3.5 focus-within:border-eco-blue">
          <LockIcon size={18} className="text-ink-faint" />
          <input
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            type={show ? "text" : "password"}
            autoComplete="current-password"
            className="h-12 flex-1 bg-transparent text-sm text-ink outline-none placeholder:text-ink-faint"
            placeholder="Enter your password"
          />
          <button
            type="button"
            onClick={() => setShow((v) => !v)}
            className="text-ink-faint"
            aria-label={show ? "Hide password" : "Show password"}
          >
            {show ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>

        <div className="mt-3 flex justify-end">
          <button type="button" className="text-xs font-bold text-eco-blue">
            Forgot Password?
          </button>
        </div>

        <button type="submit" className="btn-primary mt-6 w-full py-4 text-base">
          Log In
        </button>

        <div className="mt-4 flex items-center gap-2 text-[11px] text-ink-faint">
          <ShieldCheck size={14} className="text-eco-green" />
          Protected by SentryAI. Your session is monitored for unusual activity.
        </div>

        <button
          type="button"
          onClick={onLogin}
          className="btn-ghost mt-5 w-full py-3.5 text-sm font-bold text-eco-blue"
        >
          Create an account
        </button>

        <p className="mt-5 text-center text-[11px] text-ink-faint">
          Signing in as {amara.ownerName} for this preview.
        </p>
      </form>
    </div>
  );
}
