import { Ghost, PhoneCall } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { formatBRL } from "@/data/mock";
import { silencioMock, type ContaSilencio } from "@/data/mock";
import { registrarAcao } from "./shared";
import { SilencioBadge } from "./QueueTable";

export function SilencioQualificado() {
  const agir = (c: ContaSilencio) => {
    void registrarAcao(c.cliente_id, "Contato preventivo de reengajamento (Silêncio Qualificado)");
    toast.success("Contato preventivo registrado", {
      description: `Cliente ${c.cliente_id} — acione ${c.cs_responsavel} para o follow-up.`,
    });
  };

  const mrrEmRisco = silencioMock.reduce((s, c) => s + c.valor_mensal, 0);

  return (
    <div className="grid gap-5">
      <Card className="glass-panel flex flex-wrap items-center justify-between gap-4 p-6">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-risk-mid/10 ring-1 ring-risk-mid/30">
            <Ghost className="h-6 w-6 text-risk-mid" />
          </div>
          <div>
            <h3 className="font-display text-xl font-semibold">Silêncio Qualificado — Afastamento Invisível</h3>
            <p className="text-sm text-muted-foreground">
              Empresas ativas sem contatos, chamados ou reuniões há mais de 14 dias. O churn aqui chega sem aviso —
              aja antes do pedido de cancelamento em segredo.
            </p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">MRR em silêncio</p>
          <p className="font-display text-2xl font-semibold tabular-nums text-risk-mid">{formatBRL(mrrEmRisco)}</p>
        </div>
      </Card>

      <div className="grid gap-4">
        <p className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
          Risco de Cancelamento Invisível · {silencioMock.length} contas monitoradas
        </p>
        {silencioMock.map((c) => (
          <Card key={c.cliente_id} className="glass-row flex flex-wrap items-center gap-5 p-5">
            <div className="min-w-40">
              <p className="font-display text-lg font-semibold">{c.cliente_id}</p>
              <p className="text-xs text-muted-foreground">
                {c.segmento} | Porte {c.porte}
              </p>
            </div>
            <div className="text-right">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Contrato</p>
              <p className="font-display text-base font-semibold tabular-nums text-revenue">
                {formatBRL(c.valor_mensal)}/mês
              </p>
            </div>
            <div className="grid flex-1 grid-cols-3 gap-3">
              {[
                { k: "Sem contato", v: `${c.dias_sem_contato} dias` },
                { k: "Sem chamados", v: `${c.dias_sem_chamados} dias` },
                { k: "Sem reuniões", v: `${c.dias_sem_reunioes} dias` },
              ].map((m) => (
                <div key={m.k} className="rounded-md border border-border bg-background/40 p-3">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{m.k}</p>
                  <p className="font-display text-sm font-semibold tabular-nums text-foreground">{m.v}</p>
                </div>
              ))}
            </div>
            <div className="flex min-w-56 flex-col items-end gap-2">
              <SilencioBadge />
              <p className="text-[11px] text-muted-foreground">
                Último canal: {c.ultimo_canal} · CS: {c.cs_responsavel}
              </p>
              <Button size="sm" variant="outline" onClick={() => agir(c)}>
                <PhoneCall className="h-3.5 w-3.5 text-risk-mid" /> Contato preventivo
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
