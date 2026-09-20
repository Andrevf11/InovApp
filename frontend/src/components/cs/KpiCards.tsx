import { AlertTriangle, Target, Users, Wallet } from "lucide-react";
import { Card } from "@/components/ui/card";
import { formatBRL, kpisCarteira } from "@/data/mock";
import type { LucideIcon } from "lucide-react";

interface KpiProps {
  icon: LucideIcon;
  label: string;
  value: string;
  suffix?: string;
  detail: string;
  tone: "primary" | "high" | "low" | "vip";
}

const toneMap: Record<KpiProps["tone"], { text: string; chip: string }> = {
  primary: { text: "text-indigo-400", chip: "bg-indigo-500/10 border-indigo-500/20" },
  high: { text: "text-rose-400", chip: "bg-rose-500/10 border-rose-500/20" },
  low: { text: "text-emerald-400", chip: "bg-emerald-500/10 border-emerald-500/20" },
  vip: { text: "text-amber-400", chip: "bg-amber-500/10 border-amber-500/20" },
};

function Kpi({ icon: Icon, label, value, suffix, detail, tone, index }: KpiProps & { index: number }) {
  const t = toneMap[tone];
  return (
    <Card
      className="group relative gap-0 overflow-hidden border border-zinc-800 bg-zinc-900/50 p-5 transition-all duration-200 hover:bg-zinc-800/50 shadow-sm"
      style={{ animation: `fade-rise 480ms ease ${index * 70}ms both` }}
    >
      <div className="relative flex items-start justify-between">
        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-zinc-500">{label}</p>
        <span className={`rounded-lg p-2 border ${t.chip}`}>
          <Icon className={`h-4 w-4 ${t.text}`} />
        </span>
      </div>
      <div className="relative mt-5 flex items-baseline gap-1.5">
        <span className={`font-display text-[2rem] leading-none font-bold tabular-nums text-white`}>{value}</span>
        {suffix ? <span className="text-sm font-medium text-zinc-400">{suffix}</span> : null}
      </div>
      <p className="relative mt-2 text-xs text-zinc-500">{detail}</p>
    </Card>
  );
}

export function KpiCards({
  totalAtivos,
  riscoAlto,
}: {
  totalAtivos?: number;
  riscoAlto?: number;
}) {
  const ativos = totalAtivos ?? kpisCarteira.clientes_ativos;
  const risco = riscoAlto ?? kpisCarteira.risco_alto;
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <Kpi
        index={0}
        icon={Users}
        tone="primary"
        label="Clientes ativos"
        value={String(ativos)}
        detail="Clientes monitorados ativamente"
      />
      <Kpi
        index={1}
        icon={AlertTriangle}
        tone="high"
        label="Em risco alto"
        value={String(risco)}
        suffix="contas"
        detail="Atenção prioritária requerida"
      />
      <Kpi
        index={2}
        icon={Wallet}
        tone="low"
        label="MRR ativo analisado"
        value={formatBRL(kpisCarteira.mrr_ativo)}
        suffix="/mês"
        detail="Receita recorrente sob monitoramento"
      />
      <Kpi
        index={3}
        icon={Target}
        tone="vip"
        label="Meta de retenção (ROI)"
        value={formatBRL(kpisCarteira.meta_arr_preservado)}
        suffix="/ano"
        detail="ARR preservado com atuação na fila"
      />
    </div>
  );
}
