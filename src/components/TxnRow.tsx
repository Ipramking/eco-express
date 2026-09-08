import { naira, type Transaction } from "../core/index.js";
import { ArrowDown, ArrowUp } from "./Icons.js";

export function TxnRow({ txn }: { txn: Transaction }) {
  const isIn = txn.direction === "in";
  const date = new Date(txn.ts).toLocaleDateString("en-NG", {
    day: "numeric",
    month: "short",
  });
  return (
    <div className="flex items-center justify-between px-4 py-3">
      <div className="flex items-center gap-3">
        <span
          className={`flex h-10 w-10 items-center justify-center rounded-full ${
            isIn
              ? "bg-positive/15 text-positive"
              : "bg-eco-blue/20 text-eco-cyan"
          }`}
        >
          {isIn ? <ArrowDown size={16} /> : <ArrowUp size={16} />}
        </span>
        <div>
          <p className="text-sm font-medium text-ink">{txn.counterpartyName}</p>
          <p className="text-[11px] capitalize text-ink-faint">
            {txn.category.replace(/_/g, " ")} · {date}
          </p>
        </div>
      </div>
      <span
        className={`tabular text-sm font-semibold ${
          isIn ? "text-positive" : "text-ink"
        }`}
      >
        {isIn ? "+" : "-"}
        {naira(txn.amountKobo)}
      </span>
    </div>
  );
}
