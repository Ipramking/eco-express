import type { Icon } from "@phosphor-icons/react";
import {
  ShieldCheck,
  Gauge,
  ExchangeRates,
  CustomerService,
  RateUs,
  EcobankAssist,
  ChevronRight,
} from "../components/Icons.js";

function Row({
  label,
  Icon,
  onClick,
  accent,
}: {
  label: string;
  Icon: Icon;
  onClick: () => void;
  accent?: boolean;
}) {
  return (
    <button onClick={onClick} className="flex w-full items-center gap-3.5 px-4 py-3.5 text-left transition active:bg-surface2/60">
      <span
        className={`grid h-10 w-10 shrink-0 place-items-center rounded-full bg-eco-blue/10 text-eco-blue ${
          accent ? "ring-1 ring-eco-green/50" : ""
        }`}
      >
        <Icon size={19} weight="bold" />
      </span>
      <span className="flex-1 text-sm font-bold text-ink">{label}</span>
      <ChevronRight size={18} className="text-ink-faint" />
    </button>
  );
}

export function ServicesTab({
  onGoScore,
  onGoSecurity,
  onComingSoon,
}: {
  onGoScore: () => void;
  onGoSecurity: () => void;
  onComingSoon: (title: string, Icon: Icon) => void;
}) {
  return (
    <div className="stagger pb-2">
      <h2 className="label-micro mb-2 px-1">Security &amp; credit</h2>
      <div className="card divide-y divide-hairline/70 overflow-hidden">
        <Row label="SentryAI Protection" Icon={ShieldCheck} accent onClick={onGoSecurity} />
        <Row label="BehaviourScore" Icon={Gauge} accent onClick={onGoScore} />
      </div>

      <h2 className="label-micro mb-2 mt-6 px-1">Ecobank services</h2>
      <div className="card divide-y divide-hairline/70 overflow-hidden">
        <Row label="Exchange Rates" Icon={ExchangeRates} onClick={() => onComingSoon("Exchange Rates", ExchangeRates)} />
        <Row label="Customer Service" Icon={CustomerService} onClick={() => onComingSoon("Customer Service", CustomerService)} />
        <Row label="Rate Us" Icon={RateUs} onClick={() => onComingSoon("Rate Us", RateUs)} />
        <Row label="Ecobank Assist" Icon={EcobankAssist} onClick={() => onComingSoon("Ecobank Assist", EcobankAssist)} />
      </div>
    </div>
  );
}
