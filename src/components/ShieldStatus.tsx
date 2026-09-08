/**
 * SentryAI status indicator. Green = normal, amber = monitoring, red = active
 * intervention. Tapping it would open the security activity feed (next slice).
 */
export function ShieldStatus({
  state,
}: {
  state: "normal" | "monitoring" | "alert";
}) {
  const meta = {
    normal: { color: "rgb(var(--positive))", label: "Protected" },
    monitoring: { color: "rgb(var(--warn))", label: "Watching" },
    alert: { color: "rgb(var(--danger))", label: "Alert" },
  }[state];

  return (
    <button className="flex items-center gap-2 rounded-full border border-hairline bg-surface/60 px-3 py-1.5">
      <span className="relative flex h-2.5 w-2.5">
        {state === "alert" && (
          <span
            className="absolute inline-flex h-full w-full animate-ping rounded-full opacity-70"
            style={{ background: meta.color }}
          />
        )}
        <span
          className="relative inline-flex h-2.5 w-2.5 rounded-full"
          style={{ background: meta.color }}
        />
      </span>
      <span className="text-xs font-semibold" style={{ color: meta.color }}>
        {meta.label}
      </span>
    </button>
  );
}
