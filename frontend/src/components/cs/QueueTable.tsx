import { useState } from "react";
import {
  AlertTriangle,
  CalendarClock,
  ChevronRight,
  FileText,
  Gauge,
  Lightbulb,
  Zap,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { formatBRL, formatNum, matrizSla } from "@/data/mock";
import { registrarAcao } from "./shared";
import type { ClienteAtivo } from "@/types/inova";
import { cn } from "@/lib/utils";

const tagTones = [
  "bg-risk-high/10 text-risk-high ring-risk-high/25",
  "bg-risk-mid/10 text-risk-mid ring-risk-mid/30",
  "bg-vip/10 text-vip ring-vip/25",
  "bg-primary/10 text-primary ring-primary/25",
];

/** Régua de SLA adaptativo por PLANO — tempo máximo = contrato − margem de erro fixa (2h). */
function SlaCell({ plano, tempo }: { plano: string; tempo?: number | undefined }) {
  const m = matrizSla[plano] ?? { sla_limite_h: 6, margem_erro_h: 2, tempo_maximo_h: 4 };
  const alerta = tempo != null && tempo > m.tempo_maximo_h;
  const pctMaximo = (m.tempo_maximo_h / m.sla_limite_h) * 100;
  return (
    <div className="min-w-44">
      <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
        Plano {plano} · Contrato {m.sla_limite_h}h · Máx {m.tempo_maximo_h}h
      </p>

      <div className="mt-1.5 flex items-center gap-2">
        <span
          className={cn(
            "w-12 font-mono text-sm font-semibold tabular-nums",
            alerta && "text-risk-high",
          )}
        >
          {tempo != null ? `${formatNum(tempo)}h` : "—"}
        </span>
        <div className="relative h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
          {/* zona da margem de erro (tempo máximo → limite do contrato) */}
          <span
            className="absolute inset-y-0 right-0 bg-risk-high/25"
            style={{ width: `${100 - pctMaximo}%` }}
          />
          {/* linha do tempo máximo permitido */}
          <span
            className="absolute inset-y-0 border-r border-dashed border-risk-high/70"
            style={{ left: `${pctMaximo}%`, width: "2px" }}
          />
          <div
            className={cn(
              "h-full rounded-full transition-all duration-500",
              alerta
                ? "bg-gradient-to-r from-risk-mid to-risk-high shadow-[0_0_10px_oklch(0.63_0.24_25/0.6)]"
                : "bg-gradient-to-r from-risk-low/70 to-risk-low",
            )}
            style={{ width: `${Math.min(((tempo ?? 0) / m.sla_limite_h) * 100, 100)}%` }}
          />
        </div>
      </div>
      {alerta ? (
        <p className="mt-1 flex items-center gap-1 text-[10px] font-semibold text-risk-high">
          <AlertTriangle className="h-3 w-3" /> Excede o tempo máximo ({m.tempo_maximo_h}h)
        </p>
      ) : (
        <p className="mt-1 text-[10px] text-muted-foreground">
          Dentro do máximo · margem de erro {m.margem_erro_h}h
        </p>
      )}
    </div>
  );
}

/** Barra de urgência 0-100 — vermelho neon acima de 80. */
function UrgenciaBar({ score, nivel }: { score: number; nivel?: string | undefined }) {
  const neon = score > 80;
  const tone = neon
    ? "from-risk-high to-[oklch(0.72_0.26_30)] shadow-[0_0_14px_oklch(0.63_0.24_25/0.8)]"
    : score >= 60
      ? "from-risk-high/80 to-risk-high"
      : score >= 40
        ? "from-risk-mid/80 to-risk-mid"
        : "from-risk-low/80 to-risk-low";
  return (
    <div className="min-w-36">
      <div className="flex items-baseline justify-between">
        <span className={cn("font-display text-lg font-bold tabular-nums", neon && "text-risk-high text-glow-risk")}>
          {score}
          <span className="text-[10px] font-normal text-muted-foreground">/100</span>
        </span>
        <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
          {nivel ?? "—"}
        </span>
      </div>
      <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-muted/80">
        <div
          className={cn("h-full rounded-full bg-gradient-to-r transition-all duration-700", tone)}
          style={{ width: `${Math.min(score, 100)}%` }}
        />
      </div>
    </div>
  );
}

/** Ação recomendada — destaque roxo/dourado quando [VIP Humanizado]. */
function AcaoCell({ acao, onRegistrar }: { acao: string; onRegistrar: () => void }) {
  const vip = acao.startsWith("[VIP Humanizado]");
  const tag = vip ? "[VIP Humanizado]" : null;
  const resto = vip ? acao.slice("[VIP Humanizado]".length).trim() : acao;
  return (
    <div className="max-w-72 text-right">
      {vip ? (
        <span className="inline-flex rounded-md bg-gradient-to-r from-vip/25 to-risk-mid/20 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-vip ring-1 ring-vip/40">
          ★ VIP Humanizado
        </span>
      ) : null}
      <p className={cn("mt-1 line-clamp-2 text-xs leading-snug", vip ? "font-semibold text-foreground" : "text-muted-foreground")}>
        {resto}
      </p>
      <Button size="sm" variant="outline" className="mt-2" onClick={onRegistrar}>
        <Zap className="h-3.5 w-3.5 text-primary" /> Registrar ação
      </Button>
    </div>
  );
}

export function QueueTable({
  clientes,
  onOpen,
  onRegistrarAcao,
}: {
  clientes: ClienteAtivo[];
  onOpen: (c: ClienteAtivo) => void;
  onRegistrarAcao: (c: ClienteAtivo) => void;
}) {
  const [expandida, setExpandida] = useState<string | null>(null);

  const prescritivo = (c: ClienteAtivo, acao: string) => {
    void registrarAcao(c.cliente_id, acao);
    toast.success("Ação prescritiva registrada", {
      description: `${c.cliente_id} — ${acao}`,
    });
  };

  return (
    <div className="grid gap-4">
      {clientes.map((c, i) => {
        const aberta = expandida === c.cliente_id;
        return (
          <div
            key={c.cliente_id}
            className={cn(
              "glass-row group grid gap-4 p-5 hover:border-glass-border hover:bg-glass",
              aberta && "border-glass-border bg-glass",
            )}
            style={{ animation: `fade-rise 480ms ease ${Math.min(i, 6) * 70}ms both` }}
          >
            <div className="flex flex-wrap items-start gap-x-8 gap-y-5">
              {/* Cliente */}
              <div className="min-w-32">
                <div className="flex items-center gap-1">
                  <span className="font-display text-xs font-bold tabular-nums text-muted-foreground">
                    #{String(i + 1).padStart(2, "0")}
                  </span>
                  <button
                    onClick={() => onOpen(c)}
                    className="flex items-center gap-0.5 font-display text-lg font-bold tracking-tight transition-colors hover:text-primary"
                  >
                    {c.cliente_id}
                    <ChevronRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
                  </button>
                </div>
                <p className="mt-0.5 font-display text-sm font-semibold tabular-nums text-revenue">
                  {formatBRL(c.valor_mensal)}
                  <span className="text-[10px] font-normal text-muted-foreground">/mês</span>
                </p>
                <p className="text-[10px] text-muted-foreground">
                  Prioridade {formatNum(c.prioridade_financeira)}
                </p>
              </div>

              {/* Perfil */}
              <div className="min-w-36">
                <p className="text-sm font-semibold">Plano {c.plano ?? "Enterprise"}</p>
                <p className="text-xs text-muted-foreground">
                  {c.segmento} · Porte {c.porte}
                </p>
              </div>

              {/* Urgência */}
              <UrgenciaBar score={c.score_risco} nivel={c.urgencia_fila} />

              {/* SLA adaptativo */}
              <SlaCell plano={c.plano ?? "Enterprise"} tempo={c.tempo_resposta_h} />


              {/* Palavras-chave IA */}
              <div className="min-w-48 flex-1">
                <div className="flex flex-wrap gap-1.5">
                  {(Array.isArray(c.palavras_chave) ? c.palavras_chave : typeof c.palavras_chave === 'string' ? (c.palavras_chave as string).split(',').map(s => s.trim()) : []).map((k, idx) => (
                    <span
                      key={k}
                      className={cn(
                        "rounded-full px-2 py-0.5 text-[10px] font-semibold ring-1",
                        tagTones[idx % tagTones.length],
                      )}
                    >
                      {k}
                    </span>
                  ))}
                </div>
                <p className="mt-1.5 text-xs italic leading-snug text-muted-foreground">
                  {c.evidencias?.[0] ?? "Sem evidências registradas"}
                  {(c.evidencias?.length ?? 0) > 1 && (
                    <button
                      onClick={() => setExpandida(aberta ? null : c.cliente_id)}
                      className="ml-1 font-semibold not-italic text-primary hover:underline"
                    >
                      +{(c.evidencias?.length ?? 0) - 1} no dossiê
                    </button>
                  )}
                </p>
              </div>

              {/* Ação recomendada */}
              <AcaoCell acao={c.acao_prescritiva} onRegistrar={() => onRegistrarAcao(c)} />
            </div>

            {/* Botões prescritivos */}
            <div className="flex flex-wrap items-center gap-2 border-t border-glass-border pt-3">
              <Button
                size="sm"
                variant="ghost"
                className="text-xs"
                onClick={() => prescritivo(c, "Agendamento de Reunião Executiva (QBR)")}
              >
                <CalendarClock className="h-3.5 w-3.5 text-primary" /> Agendar Reunião Executiva (QBR)
              </Button>
              <Button
                size="sm"
                variant="ghost"
                className="text-xs"
                onClick={() => prescritivo(c, "Escalonamento Suporte N3 / Consultoria Especialista")}
              >
                <Gauge className="h-3.5 w-3.5 text-risk-mid" /> Escalonar Suporte N3 / Consultoria
              </Button>
              <Button size="sm" variant="ghost" className="text-xs" onClick={() => onRegistrarAcao(c)}>
                <FileText className="h-3.5 w-3.5 text-revenue" /> Registrar Atendimento
              </Button>
            </div>

            {/* Dossiê expandido */}
            {aberta && (
              <div className="grid gap-2 rounded-xl bg-background/50 p-4 ring-1 ring-glass-border">
                <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                  Dossiê de evidências · Diagnóstico da IA
                </p>
                <ul className="grid gap-1.5">
                  {(c.evidencias ?? []).map((e) => (
                    <li key={e} className="flex gap-2 text-xs italic leading-snug text-muted-foreground">
                      <span className="mt-0.5 text-risk-high">•</span> {e}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        );
      })}

      {clientes.length === 0 && (
        <div className="glass-panel p-10 text-center text-sm text-muted-foreground">
          Nenhum cliente na fila. Clique em “Gerar Fila de Priorização IA” para processar a base.
        </div>
      )}

      {/* Guia Narrativo para o pitch */}
      <div className="glass-panel flex flex-wrap items-center justify-center gap-2 px-6 py-4 text-center text-sm">
        <span className="flex items-center gap-1.5 font-semibold text-primary"><Lightbulb className="h-4 w-4" /> Guia Narrativo:</span>
        <span className="text-muted-foreground">
          <strong className="text-foreground">1. Identifique o Score de Risco</strong> ➔{" "}
          <strong className="text-foreground">2. Avalie o SLA Adaptativo por Plano</strong> ➔{" "}
          <strong className="text-foreground">3. Execute o Plano de Relacionamento VIP / Ação Prescritiva.</strong>
        </span>
      </div>
    </div>
  );
}

export function SilencioBadge() {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-risk-mid/10 px-2.5 py-0.5 text-[11px] font-semibold text-risk-mid ring-1 ring-risk-mid/30">
      <CalendarClock className="h-3 w-3" /> Alerta Amarelo de Desengajamento
    </span>
  );
}
