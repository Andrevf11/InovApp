import React from "react";
import {
  BrainCircuit,
  Building2,
  CalendarCheck,
  CheckCircle2,
  Copy,
  Crown,
  DollarSign,
  FileText,
  Gauge,
  Layers,
  PhoneCall,
  ShieldAlert,
  Sparkles,
  Tag,
  Users,
  Zap,
} from "lucide-react";
import { toast } from "sonner";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatBRL, formatNum, matrizSla } from "@/data/mock";
import { RiskGauge } from "./RiskGauge";
import { obterEspecificacaoRisco } from "./shared";
import type { ClienteAtivo } from "@/types/inova";

interface IndividualClientDrawerProps {
  cliente: ClienteAtivo | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onRegistrarAtendimento?: (cliente: ClienteAtivo) => void;
}

const tagCores = [
  "bg-primary/10 text-primary border-primary/30",
  "bg-vip/10 text-vip border-vip/30",
  "bg-risk-high/10 text-risk-high border-risk-high/30",
  "bg-risk-mid/10 text-risk-mid border-risk-mid/30",
  "bg-risk-low/10 text-risk-low border-risk-low/30",
];

export function IndividualClientDrawer({
  cliente,
  open,
  onOpenChange,
  onRegistrarAtendimento,
}: IndividualClientDrawerProps) {
  if (!cliente) return null;

  const acao = cliente.acao_recomendada || cliente.acao_prescritiva || "";
  const isVipHumanizado = acao.includes("[VIP Humanizado]");
  const acaoTextoLimpo = isVipHumanizado
    ? acao.replace("[VIP Humanizado]", "").trim()
    : acao;

  const mSla = matrizSla[cliente.plano ?? "Enterprise"] ?? {
    sla_limite_h: 6,
    tempo_maximo_h: 4,
  };

  const copiarDiagnostico = () => {
    const texto = `Dossiê Analítico - Cliente ${cliente.cliente_id} (${cliente.segmento} - Porte ${cliente.porte})
Valor: ${formatBRL(cliente.valor_mensal)}/mês
Score de Risco: ${cliente.score_risco}/100
Diagnóstico: ${cliente.evidencias_texto || cliente.evidencias?.join(" | ")}
Ação Recomendada: ${acao}`;
    navigator.clipboard.writeText(texto);
    toast.success("Dossiê copiado para a área de transferência!", {
      description: `Informações do cliente ${cliente.cliente_id} prontas para envio.`,
    });
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-2xl overflow-y-auto border-l border-glass-border bg-background/95 backdrop-blur-2xl p-6 sm:p-8 shadow-2xl"
      >
        <SheetHeader className="space-y-3 text-left">
          {/* Topo com Badges e ID */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-500/10 border border-indigo-500/20">
                <Building2 className="h-5 w-5 text-indigo-400" />
              </span>
              <div>
                <span className="font-mono text-xs font-bold text-zinc-500 uppercase tracking-widest">
                  Gestão Individual Exclusiva
                </span>
                <SheetTitle className="font-display text-2xl sm:text-3xl font-extrabold text-white flex items-center gap-2">
                  Cliente {cliente.cliente_id}
                  {isVipHumanizado && (
                    <Crown className="h-5 w-5 text-amber-500" title="Conta C-Level" />
                  )}
                </SheetTitle>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-1.5">
              <Badge
                variant="outline"
                className="border-zinc-800 bg-zinc-900 px-2.5 py-1 text-xs font-semibold text-zinc-300"
              >
                {cliente.segmento}
              </Badge>
              <Badge
                variant="outline"
                className={`px-2.5 py-1 text-xs font-semibold ${
                  cliente.porte === "Grande"
                    ? "border-amber-500/20 bg-amber-500/10 text-amber-500"
                    : "border-indigo-500/20 bg-indigo-500/10 text-indigo-400"
                }`}
              >
                Porte {cliente.porte}
              </Badge>
            </div>
          </div>

          <SheetDescription className="text-xs text-zinc-400">
            Painel prescritivo em tempo real com diagnóstico analítico e recomendações para preservação do contrato.
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          {/* 1. RESUMO FINANCEIRO (3 Cards de Vidro) */}
          <div>
            <h4 className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-1.5">
              <DollarSign className="h-3.5 w-3.5 text-revenue" /> Resumo Financeiro do Contrato
            </h4>
            <div className="grid grid-cols-3 gap-3">
              <div className="rounded-xl border border-zinc-800 bg-zinc-950/50 p-3.5 text-center">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500">
                  Mensalidade (MRR)
                </p>
                <p className="mt-1 font-display text-base sm:text-lg font-bold text-emerald-400 tabular-nums">
                  {formatBRL(cliente.valor_mensal)}
                </p>
                <p className="text-[10px] text-zinc-500">
                  ARR: {formatBRL(cliente.valor_mensal * 12)}
                </p>
              </div>

              <div className="rounded-xl border border-zinc-800 bg-zinc-950/50 p-3.5 text-center">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500">
                  Plano Atual
                </p>
                <p className="mt-1 font-display text-base sm:text-lg font-bold text-white">
                  {cliente.plano ?? "Enterprise"}
                </p>
                <p className="text-[10px] text-zinc-500">
                  SLA Máx: {mSla.tempo_maximo_h}h
                </p>
              </div>

              <div className="rounded-xl border border-zinc-800 bg-zinc-950/50 p-3.5 text-center">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500">
                  Porte Corporativo
                </p>
                <p className="mt-1 font-display text-base sm:text-lg font-bold text-amber-500">
                  {cliente.porte}
                </p>
                <p className="text-[10px] text-zinc-500">
                  Prioridade {formatNum(cliente.prioridade_financeira)}
                </p>
              </div>
            </div>
          </div>

          {/* 2. GRÁFICO CIRCULAR / MEDIDOR (GAUGE) VISUAL DE SCORE DE RISCO */}
          <div className="relative overflow-hidden border border-zinc-800 bg-zinc-900 rounded-xl p-5 text-center shadow-sm">
            <h4 className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 flex items-center justify-center gap-1.5">
              <Gauge className="h-4 w-4 text-indigo-400" /> Medidor de Probabilidade de Churn
            </h4>

            {/* Medidor Gauge SVG com suporte a Neon Red quando > 80 */}
            <div className="mt-2 flex justify-center">
              <RiskGauge score={cliente.score_risco} size={190} strokeWidth={15} />
            </div>

            <div className="mt-1 flex justify-center gap-4 text-xs text-muted-foreground">
              <span>
                Prioridade da Fila:{" "}
                <strong className="text-foreground">
                  {cliente.urgencia_fila_num ?? cliente.urgencia_fila ?? "Alta"}
                </strong>
              </span>
              <span>·</span>
              <span>
                Status NPS:{" "}
                <strong
                  className={
                    cliente.nps_status?.includes("Não respondeu")
                      ? "text-risk-high"
                      : "text-foreground"
                  }
                >
                  {cliente.nps_status || "Não respondeu"}
                </strong>
              </span>
            </div>

            {/* Especificação do porquê está ALTO, MÉDIO ou BAIXO */}
            {(() => {
              const espec = obterEspecificacaoRisco(cliente);
              return (
                <div className="mt-4 rounded-xl border border-glass-border bg-background/50 p-3.5 text-left text-xs">
                  <div className="flex items-center gap-1.5 font-bold uppercase tracking-wider mb-1 text-[11px]">
                    <ShieldAlert className="h-3.5 w-3.5 text-primary shrink-0" />
                    <span
                      className={
                        espec.nivel === "ALTA"
                          ? "text-rose-500"
                          : espec.nivel === "MÉDIA"
                            ? "text-amber-500"
                            : "text-emerald-500"
                      }
                    >
                      {espec.titulo}
                    </span>
                  </div>

                  <p className="text-zinc-400 leading-relaxed text-xs">
                    {espec.explicacaoCompleta}
                  </p>

                  <div className="mt-2.5 pt-2 border-t border-zinc-800 flex flex-wrap gap-1.5">
                    {espec.fatoresCriticos.map((fator, idx) => (
                      <span
                        key={idx}
                        className="rounded-md bg-zinc-800 border border-zinc-700 px-2 py-0.5 text-[10px] font-medium text-zinc-300"
                      >
                        • {fator}
                      </span>
                    ))}
                  </div>

                  <p className="mt-2 text-[10px] italic text-zinc-500 border-l-2 border-indigo-500/40 pl-1.5">
                    {espec.regraGeral}
                  </p>
                </div>
              );
            })()}
          </div>

          {/* 3. SEÇÃO DE DIAGNÓSTICO (Evidências em texto claro) */}
          <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-400 flex items-center gap-2">
                <FileText className="h-4 w-4 text-indigo-400" /> Diagnóstico Analítico (Evidências Clínicas)
              </h4>
              <Button
                variant="ghost"
                size="sm"
                onClick={copiarDiagnostico}
                className="h-7 text-[11px] text-muted-foreground hover:text-foreground"
              >
                <Copy className="mr-1 h-3 w-3" /> Copiar
              </Button>
            </div>

            <div className="mt-3 rounded-lg border border-zinc-800 bg-zinc-950/50 p-4">
              {cliente.evidencias && cliente.evidencias.length > 0 ? (
                <ul className="space-y-2">
                  {cliente.evidencias.map((ev, i) => (
                    <li key={i} className="flex items-start gap-2.5 text-xs text-zinc-300 leading-relaxed">
                      <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-rose-500" />
                      <span>{ev}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-xs text-zinc-300 leading-relaxed">
                  {cliente.evidencias_texto ||
                    "O motor de risco identificou instabilidade operacional no período, com descompasso no cumprimento de chamados e redução do engajamento com a equipe de Customer Success."}
                </p>
              )}
            </div>
          </div>

          {/* 4. ÁREA DE SINTOMAS (Palavras-chave em formato de Tags estilizadas) */}
          <div>
            <h4 className="text-[11px] font-bold uppercase tracking-wider text-zinc-500 mb-2 flex items-center gap-1.5">
              <Tag className="h-3.5 w-3.5 text-zinc-400" /> Sintomas Identificados
            </h4>
            <div className="flex flex-wrap gap-2">
              {(() => {
                const tags = Array.isArray(cliente.palavras_chave) 
                  ? cliente.palavras_chave 
                  : typeof cliente.palavras_chave === 'string' 
                    ? (cliente.palavras_chave as string).split(',').map(s => s.trim()) 
                    : [];
                
                return tags.length > 0 ? (
                  tags.map((tag, idx) => (
                    <span
                      key={idx}
                      className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold transition-all hover:scale-105 shadow-sm ${
                        tagCores[idx % tagCores.length]
                      }`}
                    >
                      #{tag.replace(/^#+/, "")}
                    </span>
                  ))
                ) : (
                  <span className="text-xs text-muted-foreground">Nenhum sintoma registrado.</span>
                );
              })()}
            </div>
          </div>

          {/* 5. BLOCO EM DESTAQUE: PLANO DE AÇÃO RECOMENDADO (Com destaque VIP Humanizado) */}
          <div
            className={`rounded-2xl border p-5 transition-all duration-300 ${
              isVipHumanizado
                ? "border-amber-500/30 bg-zinc-900 shadow-md"
                : "border-indigo-500/20 bg-indigo-500/5 shadow-sm"
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {isVipHumanizado ? (
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-500/10 text-amber-500 border border-amber-500/20">
                    <Crown className="h-4 w-4" />
                  </div>
                ) : (
                  <Zap className="h-5 w-5 text-indigo-400" />
                )}
                <h4
                  className={`text-xs font-extrabold uppercase tracking-wider ${
                    isVipHumanizado ? "text-amber-500" : "text-indigo-400"
                  }`}
                >
                  {isVipHumanizado
                    ? "★ PLANO DE AÇÃO RECOMENDADO [C-LEVEL]"
                    : "Plano de Ação Recomendado (Prescritivo)"}
                </h4>
              </div>

              {isVipHumanizado && (
                <span className="rounded-full bg-vip/20 px-2.5 py-0.5 text-[10px] font-bold text-vip ring-1 ring-vip/40 animate-pulse">
                  Prioridade C-Level
                </span>
              )}
            </div>

            <p
              className={`mt-3 text-sm leading-relaxed ${
                isVipHumanizado
                  ? "font-semibold text-white"
                  : "text-zinc-200"
              }`}
            >
              {acaoTextoLimpo || "Realizar reunião com decisores para reverter quadro de desengajamento."}
            </p>

            {/* Ações Rápidas do CSM */}
            <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-zinc-800 pt-3">
              <Button
                size="sm"
                className="h-8 px-4 text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white rounded-md shadow-sm transition-colors cursor-pointer"
                onClick={() => {
                  toast.success("Reunião Executiva (QBR) Agendada!", {
                    description: `Notificação enviada ao sponsor do cliente ${cliente.cliente_id}.`,
                  });
                }}
              >
                <CalendarCheck className="mr-1.5 h-3.5 w-3.5" /> Agendar QBR Executiva
              </Button>

              <Button
                size="sm"
                variant="outline"
                className="h-8 text-xs border-glass-border hover:bg-glass cursor-pointer"
                onClick={() => {
                  toast.warning("Suporte N3 Notificado!", {
                    description: `Ticket de alta severidade aberto para a conta ${cliente.cliente_id}.`,
                  });
                }}
              >
                <ShieldAlert className="mr-1.5 h-3.5 w-3.5 text-risk-mid" /> Escalonar Suporte N3
              </Button>

              {onRegistrarAtendimento && (
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-8 text-xs hover:bg-glass cursor-pointer"
                  onClick={() => {
                    onRegistrarAtendimento(cliente);
                  }}
                >
                  <FileText className="mr-1.5 h-3.5 w-3.5 text-revenue" /> Registrar Atendimento
                </Button>
              )}
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
