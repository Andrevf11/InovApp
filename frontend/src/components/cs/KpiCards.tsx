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

const toneMap: Record<KpiProps["tone"], { text: string; chip: string; glow: string }> = {
  primary: { text: "text-primary text-glow-primary", chip: "bg-primary/10 ring-primary/25", glow: "from-primary/20" },
  high: { text: "text-risk-high", chip: "bg-risk-high/10 ring-risk-high/30", glow: "from-risk-high/25" },
  low: { text: "text-risk-low", chip: "bg-risk-low/10 ring-risk-low/30", glow: "from-risk-low/20" },
  vip: { text: "text-vip", chip: "bg-vip/10 ring-vip/30", glow: "from-vip/20" },
};

function Kpi({ icon: Icon, label, value, suffix, detail, tone, index }: KpiProps & { index: number }) {
  const t = toneMap[tone];
  return (
    <Card
      className="glass-panel group relative gap-0 overflow-hidden border-glass-border p-5 transition-all duration-200 hover:-translate-y-0.5"
      style={{ animation: `fade-rise 480ms ease ${index * 70}ms both` }}
    >
      <div className={`pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b ${t.glow} to-transparent opacity-60`} />
      <div className="relative flex items-start justify-between">
        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">{label}</p>
        <span className={`rounded-lg p-2 ring-1 backdrop-blur-sm ${t.chip}`}>
          <Icon className={`h-4 w-4 ${t.text}`} />
        </span>
      </div>
      <div className="relative mt-5 flex items-baseline gap-1.5">
        <span className={`font-display text-[2rem] leading-none font-bold tabular-nums ${t.text}`}>{value}</span>
        {suffix ? <span className="text-sm font-medium text-muted-foreground">{suffix}</span> : null}
      </div>
      <p className="relative mt-2 text-xs text-muted-foreground">{detail}</p>
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
        detail="summary.total_ativos do motor IA"
      />
      <Kpi
        index={1}
        icon={AlertTriangle}
        tone="high"
        label="Em risco alto"
        value={String(risco)}
        suffix="contas"
        detail="summary.risco_alto — prioridade máxima"
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
