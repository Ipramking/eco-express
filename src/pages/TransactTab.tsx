import type { Icon } from "@phosphor-icons/react";
import {
  TransferNow,
  XpressCash,
  PayBill,
  Airtime,
  BuyData,
  WalletIcon,
  ChevronRight,
} from "../components/Icons.js";

const ROWS: {
  label: string;
  sub: string;
  Icon: Icon;
  action: "transfer" | "soon";
}[] = [
  { label: "Transfer Now", sub: "To Ecobank or any Nigerian bank", Icon: TransferNow, action: "transfer" },
  { label: "Xpress Cash", sub: "Send cash to collect at any branch", Icon: XpressCash, action: "soon" },
  { label: "Pay a Bill", sub: "Electricity, TV, and more", Icon: PayBill, action: "soon" },
  { label: "Buy Airtime", sub: "Top up any network", Icon: Airtime, action: "soon" },
  { label: "Buy Data", sub: "Data bundles for any network", Icon: BuyData, action: "soon" },
  { label: "Request Money", sub: "Ask someone to pay you", Icon: WalletIcon, action: "soon" },
];

export function TransactTab({
  onTransfer,
  onComingSoon,
}: {
  onTransfer: () => void;
  onComingSoon: (title: string, Icon: Icon) => void;
}) {
  return (
    <div className="stagger pb-2">
      <h2 className="label-micro mb-3">Move money</h2>
      <div className="card divide-y divide-hairline/70 overflow-hidden">
        {ROWS.map(({ label, sub, Icon, action }) => (
          <button
            key={label}
            onClick={() => (action === "transfer" ? onTransfer() : onComingSoon(label, Icon))}
            className="flex w-full items-center gap-3.5 px-4 py-3.5 text-left transition active:bg-surface2/60"
          >
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-eco-blue/10 text-eco-blue">
              <Icon size={20} weight="bold" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-bold text-ink">{label}</p>
              <p className="truncate text-xs text-ink-soft">{sub}</p>
            </div>
            <ChevronRight size={18} className="shrink-0 text-ink-faint" />
          </button>
        ))}
      </div>
    </div>
  );
}
