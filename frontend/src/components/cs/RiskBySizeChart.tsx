import { useMemo } from "react";
import { Line, LineChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Activity } from "lucide-react";
import { formatBRL } from "@/data/mock";
import type { ClienteAtivo } from "@/types/inova";

interface RiskBySizeChartProps {
  clientes: ClienteAtivo[];
}

export function RiskBySizeChart({ clientes }: RiskBySizeChartProps) {
  const chartData = useMemo(() => {
    // Eixo X: Níveis de Risco. Linhas: Porte da Empresa. Eixo Y: MRR (Importância)
    const buckets = [
      { name: "Saudável (< 40 pts)", Grande: 0, Médio: 0, Pequeno: 0 },
      { name: "Risco Médio (40-60 pts)", Grande: 0, Médio: 0, Pequeno: 0 },
      { name: "Risco Crítico (> 60 pts)", Grande: 0, Médio: 0, Pequeno: 0 },
    ];

    clientes.forEach((c) => {
      let porte = c.porte || "Pequeno";
      if (porte.toLowerCase().includes("médio") || porte.toLowerCase().includes("medio")) {
        porte = "Médio";
      } else if (porte.toLowerCase().includes("grand")) {
        porte = "Grande";
      } else {
        porte = "Pequeno";
      }

      const score = c.score_risco ?? 0;
      const mrr = c.valor_mensal ?? 0;

      if (score > 60) {
        buckets[2][porte as "Grande" | "Médio" | "Pequeno"] += mrr;
      } else if (score >= 40) {
        buckets[1][porte as "Grande" | "Médio" | "Pequeno"] += mrr;
      } else {
        buckets[0][porte as "Grande" | "Médio" | "Pequeno"] += mrr;
      }
    });

    return buckets;
  }, [clientes]);

  if (clientes.length === 0) return null;

  return (
    <div className="glass-panel mt-8 flex flex-col sm:flex-row gap-6 p-6 border-glass-border shadow-xl">
      {/* Informações Textuais Laterais */}
      <div className="flex w-full sm:w-1/3 flex-col justify-center space-y-4 pr-4">
        <div>
          <h3 className="font-display text-xl font-bold text-foreground flex items-center gap-2">
            <Activity className="h-5 w-5 text-primary" /> Risco vs. Importância
          </h3>
          <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
            Este gráfico cruza o <strong>Nível de Risco</strong> (Eixo X) com a <strong>Importância Financeira / MRR</strong> (Eixo Y).
          </p>
          <p className="mt-3 text-xs text-muted-foreground border-l-2 border-primary/50 pl-3 py-1 italic bg-primary/5 rounded-r-md">
            Quanto mais alta a linha estiver na zona de <strong>Risco Crítico</strong>, maior a perda financeira (Churn) iminente.
          </p>
        </div>
      </div>

      {/* Gráfico Recharts de Linha */}
      <div className="relative w-full sm:w-2/3 h-[320px] rounded-xl bg-background/40 p-4 ring-1 ring-glass-border shadow-inner">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={chartData}
            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="4 4" stroke="rgba(255,255,255,0.06)" vertical={false} />
            <XAxis 
              dataKey="name" 
              axisLine={{ stroke: "#4b5563" }} 
              tickLine={false} 
              tick={{ fontSize: 11, fill: "#9ca3af", fontWeight: 600 }} 
              dy={15}
            />
            <YAxis 
              axisLine={{ stroke: "#4b5563" }} 
              tickLine={false} 
              tick={{ fontSize: 11, fill: "#9ca3af" }} 
              tickFormatter={(value) => `R$ ${value >= 1000 ? (value / 1000).toFixed(0) + 'k' : value}`}
            />
            <Tooltip
              cursor={{ stroke: "rgba(255,255,255,0.1)", strokeWidth: 2, strokeDasharray: "4 4" }}
              contentStyle={{
                backgroundColor: "rgba(10, 10, 10, 0.85)",
                backdropFilter: "blur(12px)",
                borderColor: "rgba(255,255,255,0.15)",
                borderRadius: "12px",
                color: "hsl(var(--foreground))",
                fontSize: "12px",
                fontWeight: 500,
                boxShadow: "0 10px 40px rgba(0,0,0,0.5)",
              }}
              itemStyle={{ fontWeight: 700 }}
              formatter={(value: number, name: string) => [
                formatBRL(value), 
                `Porte ${name}`
              ]}
              labelStyle={{ color: "#d1d5db", marginBottom: "8px", fontWeight: "bold" }}
            />
            <Legend 
              wrapperStyle={{ paddingTop: "20px", fontSize: "12px", fontWeight: 600, color: "#e5e7eb" }} 
              iconType="circle"
            />
            
            <Line 
              type="monotone" 
              dataKey="Grande" 
              name="Grande"
              stroke="#3b82f6" 
              strokeWidth={4}
              dot={{ r: 5, strokeWidth: 2, fill: "#1e293b", stroke: "#3b82f6" }}
              activeDot={{ r: 8, strokeWidth: 0, fill: "#3b82f6" }}
            />
            <Line 
              type="monotone" 
              dataKey="Médio" 
              name="Médio"
              stroke="#a855f7" 
              strokeWidth={3}
              dot={{ r: 4, strokeWidth: 2, fill: "#1e293b", stroke: "#a855f7" }}
              activeDot={{ r: 6, strokeWidth: 0, fill: "#a855f7" }}
            />
            <Line 
              type="monotone" 
              dataKey="Pequeno" 
              name="Pequeno"
              stroke="#10b981" 
              strokeWidth={3}
              strokeDasharray="5 5"
              dot={{ r: 4, strokeWidth: 2, fill: "#1e293b", stroke: "#10b981" }}
              activeDot={{ r: 5, strokeWidth: 0, fill: "#10b981" }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
