import { useState } from "react";
import { Send, Close, Spark } from "../components/Icons.js";

interface Msg {
  from: "rafiki" | "user";
  text: string;
}

const GREETING: Msg = {
  from: "rafiki",
  text: "Hi, I'm Rafiki, your Ecobank assistant. Ask me about your score, your protection, or send money.",
};

const CHIPS = [
  { label: "How is my BehaviourScore?", to: "score" as const },
  { label: "Is my account protected?", to: "security" as const },
  { label: "Send money", to: "transfer" as const },
];

/**
 * Rafiki chat. This owns its full viewport height directly (h-[100dvh], not
 * the shared pb-28 scroll-clearance the other tabs use) so the input can sit
 * pinned to the bottom above the floating nav instead of floating wherever
 * the (short) message list happens to end. Only the message list scrolls;
 * header, chips and input stay fixed in place - the standard shape of a real
 * mobile chat screen.
 */
export function ChatTab({
  onGoScore,
  onGoSecurity,
  onTransfer,
}: {
  onGoScore: () => void;
  onGoSecurity: () => void;
  onTransfer: () => void;
}) {
  const [msgs, setMsgs] = useState<Msg[]>([GREETING]);
  const [draft, setDraft] = useState("");

  function send(text: string) {
    if (!text.trim()) return;
    setMsgs((m) => [
      ...m,
      { from: "user", text },
      {
        from: "rafiki",
        text: "Full conversational banking is coming soon. For now, tap a suggestion below and I'll take you straight there.",
      },
    ]);
    setDraft("");
  }

  return (
    <div className="flex h-[100dvh] flex-col">
      {/* Rafiki header - fixed */}
      <div className="shrink-0 bg-eco-blue px-5 pb-5 pt-safe">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-full bg-eco-green text-eco-blue-deep">
              <Spark size={20} weight="fill" />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base font-extrabold text-white">Rafiki</h1>
                <span className="h-2 w-2 rounded-full bg-eco-green" />
              </div>
              <p className="text-[11px] text-white/70">Your Ecobank virtual assistant</p>
            </div>
          </div>
          <span className="rounded-full bg-white/12 px-2.5 py-1 text-[11px] font-semibold text-white">
            English
          </span>
        </div>
      </div>

      {/* messages - the only scrolling region */}
      <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">
        <div className="space-y-3">
          {msgs.map((m, i) => (
            <div
              key={i}
              className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm ${
                m.from === "rafiki"
                  ? "rounded-tl-sm bg-surface text-ink shadow-card"
                  : "ml-auto rounded-tr-sm bg-eco-blue text-white"
              }`}
            >
              {m.text}
            </div>
          ))}
        </div>
      </div>

      {/* suggestion chips - fixed, sits just above the input */}
      <div className="shrink-0 flex flex-wrap gap-2 px-5 pb-3">
        {CHIPS.map((c) => (
          <button
            key={c.label}
            onClick={() => (c.to === "score" ? onGoScore() : c.to === "security" ? onGoSecurity() : onTransfer())}
            className="rounded-full border border-eco-blue/25 bg-eco-blue/5 px-3 py-1.5 text-xs font-semibold text-eco-blue"
          >
            {c.label}
          </button>
        ))}
      </div>

      {/* input - fixed, pinned above the floating bottom nav */}
      <div className="shrink-0 border-t border-hairline bg-bg px-5 pt-3 pb-[calc(env(safe-area-inset-bottom)+92px)]">
        <div className="flex items-center gap-2">
          <input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && send(draft)}
            placeholder="Type here to chat with me"
            className="h-12 flex-1 rounded-full border border-hairline bg-surface px-4 text-sm text-ink outline-none placeholder:text-ink-faint focus:border-eco-blue"
          />
          <button
            onClick={() => send(draft)}
            className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-eco-blue text-white"
            aria-label="Send"
          >
            {draft.trim() ? <Send size={18} weight="fill" /> : <Close size={16} className="rotate-45" />}
          </button>
        </div>
      </div>
    </div>
  );
}
