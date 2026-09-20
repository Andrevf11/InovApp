import { useState } from "react";
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Brain, TrendingDown } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RiskBadge } from "./RiskBadge";
import { formatBRL, formatNum } from "@/data/mock";
import { enviarPostMortem, type ClienteAtivo } from "./shared";

const motivos = [
  "Preço / orçamento",
  "Falhas recorrentes de SLA",
  "Insatisfação com o suporte",
  "Baixa adoção da plataforma",
  "Troca por concorrente",
  "Mudança de gestão no cliente",
  "Crise resolvida — cliente retido",
];

export function ClientDetailModal({
  cliente,
  open,
  onOpenChange,
}: {
  cliente: ClienteAtivo | null;
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const [motivo, setMotivo] = useState("");
  const [detalhe, setDetalhe] = useState("");

  if (!cliente) return null;
  const dados = cliente.trajetoria ?? [];

  const salvar = () => {
    if (!motivo) {
      toast.error("Selecione o motivo real antes de enviar.");
      return;
    }
    void enviarPostMortem({
      cliente_id: cliente.cliente_id,
      tipo: motivo.includes("retido") ? "crise_resolvida" : "cancelamento",
      motivo_real: motivo,
      detalhe,
      registrado_em: new Date().toISOString(),
    });
    toast.success("Post-mortem enviado ao motor de Machine Learning", {
      description: `Cliente ${cliente.cliente_id} — o modelo sera recalibrado no proximo ciclo.`,
    });
    setMotivo("");
    setDetalhe("");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92vh] max-w-4xl overflow-y-auto border-border bg-surface">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl">
            {cliente.cliente_id} — {cliente.segmento} | Porte {cliente.porte}
          </DialogTitle>
          <DialogDescription>
            Contrato de {formatBRL(cliente.valor_mensal)}/mês · Prioridade financeira{" "}
            {formatNum(cliente.prioridade_financeira)} pts
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-wrap items-center gap-3">
          <RiskBadge score={cliente.score_risco} />
          <span className="rounded-full bg-muted px-3 py-1 text-xs text-muted-foreground">
            NPS: {cliente.nps_status}
          </span>
        </div>

        <section className="rounded-lg border border-border bg-background/40 p-4">
          <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold">
            <TrendingDown className="h-4 w-4 text-risk-high" />
            Trajetória de risco — últimos 90 dias
          </h3>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={dados} margin={{ top: 4, right: 12, left: -16, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                <XAxis dataKey="mes_ref" stroke="var(--color-muted-foreground)" fontSize={12} />
                <YAxis stroke="var(--color-muted-foreground)" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    background: "var(--color-surface-raised)",
                    border: "1px solid var(--color-border)",
                    borderRadius: 8,
                    color: "var(--color-foreground)",
                  }}
                />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Line
                  type="monotone"
                  dataKey="pct_sla_cumprido"
                  name="SLA cumprido (%)"
                  stroke="var(--color-chart-1)"
                  strokeWidth={2}
                  dot={{ r: 3 }}
                />
                <Line
                  type="monotone"
                  dataKey="uso_plataforma_pct"
                  name="Uso da plataforma (%)"
                  stroke="var(--color-chart-4)"
                  strokeWidth={2}
                  dot={{ r: 3 }}
                />
                <Line
                  type="monotone"
                  dataKey="dias_atraso_pagamento"
                  name="Dias de atraso"
                  stroke="var(--color-chart-3)"
                  strokeWidth={2}
                  dot={{ r: 3 }}
                />
                <Line
                  type="monotone"
                  dataKey="nota_nps"
                  name="Nota NPS"
                  stroke="var(--color-chart-2)"
                  strokeWidth={2}
                  strokeDasharray="5 4"
                  connectNulls={false}
                  dot={{ r: 3 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <ul className="mt-4 grid gap-1.5 text-xs text-muted-foreground sm:grid-cols-2">
            {(cliente.evidencias ?? []).map((e) => (
              <li key={e} className="flex gap-2">
                <span className="text-risk-high">•</span>
                {e}
              </li>
            ))}
          </ul>
        </section>

        <section className="rounded-lg border border-border bg-background/40 p-4">
          <h3 className="mb-1 flex items-center gap-2 text-sm font-semibold">
            <Brain className="h-4 w-4 text-primary" />
            Post-Mortem / Feedback Loop
          </h3>
          <p className="mb-4 text-xs text-muted-foreground">
            Registre o motivo real do cancelamento ou da resolução da crise. Estes dados alimentam o
            retreino do modelo preditivo no back-end Python.
          </p>
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label>Motivo real</Label>
              <Select value={motivo} onValueChange={setMotivo}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o motivo confirmado com o cliente" />
                </SelectTrigger>
                <SelectContent>
                  {motivos.map((m) => (
                    <SelectItem key={m} value={m}>
                      {m}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label>Detalhamento do caso</Label>
              <Textarea
                rows={4}
                value={detalhe}
                onChange={(e) => setDetalhe(e.target.value)}
                placeholder="O que realmente aconteceu, o que foi negociado e qual foi o desfecho..."
              />
            </div>
            <div>
              <Button onClick={salvar}>Enviar ao modelo preditivo</Button>
            </div>
          </div>
        </section>
      </DialogContent>
    </Dialog>
  );
}
