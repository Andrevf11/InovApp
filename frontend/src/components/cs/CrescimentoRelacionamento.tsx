import {
  Area,
  AreaChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { HeartHandshake, LineChart as LineChartIcon, TrendingUp } from "lucide-react";
import { Card } from "@/components/ui/card";
import {
  evolucaoEngajamento,
  formatBRL,
  planosRelacionamento,
} from "@/data/mock";

const riscoTone: Record<string, string> = {
  Crítico: "bg-risk-high/10 text-risk-high ring-risk-high/30",
  Alto: "bg-risk-mid/10 text-risk-mid ring-risk-mid/30",
};

/**
 * Módulo "Controle e Estatística de Crescimento & Lógica de Relacionamento":
 * [ MRR + Risco de Distanciamento + Importância Estratégica ➔ Plano Personalizado ]
 */
export function CrescimentoRelacionamento() {
  return (
    <div className="grid gap-5">
      <Card className="glass-panel p-6">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-vip/10 ring-1 ring-vip/30">
            <HeartHandshake className="h-6 w-6 text-vip" />
          </div>
          <div className="min-w-64 flex-1">
            <h3 className="font-display text-xl font-semibold">
              Controle e Estatística de Crescimento &amp; Lógica de Relacionamento
            </h3>
            <p className="text-sm text-muted-foreground">
              A lógica de relacionamento cruza valor, distanciamento e importância estratégica para definir o plano
              personalizado de cada conta.
            </p>
          </div>
        </div>
        <div className="mt-5 flex flex-wrap items-center justify-center gap-3 rounded-xl bg-background/50 px-6 py-4 text-center font-display text-sm font-semibold ring-1 ring-glass-border">
          <span className="text-revenue">Valor do Cliente (MRR)</span>
          <span className="text-muted-foreground">+</span>
          <span className="text-risk-high">Risco de Distanciamento</span>
          <span className="text-muted-foreground">+</span>
          <span className="text-vip">Importância Estratégica</span>
          <span className="text-xl text-primary">➔</span>
          <span className="text-primary text-glow-primary">Plano de Relacionamento Personalizado</span>
        </div>
      </Card>

      <div className="grid gap-5 xl:grid-cols-2">
        <Card className="glass-panel p-6">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-primary" />
            <h4 className="font-display text-base font-semibold">Evolução do Engajamento da Carteira</h4>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            Índice composto (uso da plataforma, SLA, NPS e financeiro) — queda sinaliza distanciamento.
          </p>
          <div className="mt-4 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={evolucaoEngajamento} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
                <defs>
                  <linearGradient id="gradEngajamento" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="oklch(0.82 0.12 195)" stopOpacity={0.5} />
                    <stop offset="100%" stopColor="oklch(0.82 0.12 195)" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="oklch(1 0 0 / 8%)" strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="mes" tick={{ fill: "oklch(0.7 0.014 260)", fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis domain={[40, 100]} tick={{ fill: "oklch(0.7 0.014 260)", fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    background: "oklch(0.21 0.014 260)",
                    border: "1px solid oklch(1 0 0 / 14%)",
                    borderRadius: 12,
                    fontSize: 12,
                  }}
                  labelStyle={{ color: "oklch(0.96 0.006 250)", fontWeight: 600 }}
                />
                <Area
                  type="monotone"
                  dataKey="engajamento"
                  name="Índice de engajamento"
                  stroke="oklch(0.82 0.12 195)"
                  strokeWidth={2.5}
                  fill="url(#gradEngajamento)"
                  dot={{ r: 3, fill: "oklch(0.82 0.12 195)" }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="glass-panel p-6">
          <div className="flex items-center gap-2">
            <LineChartIcon className="h-4 w-4 text-revenue" />
            <h4 className="font-display text-base font-semibold">Receita Preservada &amp; Carteira Ativa</h4>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            ARR preservado pela atuação do CS (meta: R$ 660.000/ano) e contas ativas na base.
          </p>
          <div className="mt-4 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={evolucaoEngajamento} margin={{ top: 8, right: 8, left: -6, bottom: 0 }}>
                <CartesianGrid stroke="oklch(1 0 0 / 8%)" strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="mes" tick={{ fill: "oklch(0.7 0.014 260)", fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis yAxisId="l" tick={{ fill: "oklch(0.7 0.014 260)", fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(v: number) => `${Math.round(v / 1000)}k`} />
                <YAxis yAxisId="r" orientation="right" domain={[50, 60]} tick={{ fill: "oklch(0.7 0.014 260)", fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip
                  formatter={(value: number, name: string) =>
                    name === "Receita preservada (R$)" ? formatBRL(value) : value
                  }
                  contentStyle={{
                    background: "oklch(0.21 0.014 260)",
                    border: "1px solid oklch(1 0 0 / 14%)",
                    borderRadius: 12,
                    fontSize: 12,
                  }}
                  labelStyle={{ color: "oklch(0.96 0.006 250)", fontWeight: 600 }}
                />
                <Line yAxisId="l" type="monotone" dataKey="receita_preservada" name="Receita preservada (R$)" stroke="oklch(0.82 0.14 160)" strokeWidth={2.5} dot={{ r: 3, fill: "oklch(0.82 0.14 160)" }} />
                <Line yAxisId="r" type="monotone" dataKey="contas_ativas" name="Contas ativas" stroke="oklch(0.8 0.16 70)" strokeWidth={2} strokeDasharray="5 4" dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      <Card className="glass-panel p-6">
        <h4 className="font-display text-base font-semibold">Planos de Relacionamento Personalizados</h4>
        <p className="mt-1 text-xs text-muted-foreground">
          Gerados pela fórmula acima para as contas líder da fila de risco.
        </p>
        <div className="mt-4 grid gap-3">
          {planosRelacionamento.map((p) => (
            <div
              key={p.cliente_id}
              className="glass-row flex flex-wrap items-center gap-x-6 gap-y-2 p-4"
            >
              <span className="font-display text-base font-bold">{p.cliente_id}</span>
              <span className="font-display text-sm font-semibold tabular-nums text-revenue">
                {formatBRL(p.mrr)}/mês
              </span>
              <span
                className={`rounded-full px-2.5 py-0.5 text-[10px] font-semibold ring-1 ${riscoTone[p.risco_distanciamento] ?? "bg-muted text-muted-foreground ring-border"}`}
              >
                Risco de distanciamento: {p.risco_distanciamento}
              </span>
              <span className="rounded-full bg-vip/10 px-2.5 py-0.5 text-[10px] font-semibold text-vip ring-1 ring-vip/25">
                Importância: {p.importancia_estrategica}
              </span>
              <span className="min-w-56 flex-1 text-xs font-medium text-foreground">{p.plano}</span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
