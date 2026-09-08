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
    <div className="flex min-h-full flex-col">
      {/* Rafiki header */}
      <div className="bg-eco-blue px-5 pb-5 pt-safe">
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

      {/* messages */}
      <div className="min-h-[42vh] flex-1 space-y-3 px-5 py-5">
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

      {/* suggestion chips */}
      <div className="flex flex-wrap gap-2 px-5">
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

      {/* input */}
      <div className="mt-4 mb-24 flex items-center gap-2 bg-bg px-5 pt-2">
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && send(draft)}
          placeholder="Type here to chat with me"
          className="h-12 flex-1 rounded-full border border-hairline bg-surface px-4 text-sm text-ink outline-none placeholder:text-ink-faint focus:border-eco-blue"
        />
        <button
          onClick={() => send(draft)}
          className="grid h-12 w-12 place-items-center rounded-full bg-eco-blue text-white"
          aria-label="Send"
        >
          {draft.trim() ? <Send size={18} weight="fill" /> : <Close size={16} className="rotate-45" />}
        </button>
      </div>
    </div>
  );
}
