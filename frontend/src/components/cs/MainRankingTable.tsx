import { useState, useMemo } from "react";
import {
  AlertTriangle,
  Building2,
  ChevronRight,
  ExternalLink,
  Flame,
  Search,
  Sparkles,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { formatBRL, formatNum } from "@/data/mock";
import { cn } from "@/lib/utils";
import type { ClienteAtivo } from "@/types/inova";

interface MainRankingTableProps {
  clientes: ClienteAtivo[];
  onOpenIndividual: (cliente: ClienteAtivo) => void;
}

export function MainRankingTable({
  clientes,
  onOpenIndividual,
}: MainRankingTableProps) {
  const [busca, setBusca] = useState("");
  const [filtroPorte, setFiltroPorte] = useState<string>("todos");

  const clientesFiltrados = useMemo(() => {
    return clientes.filter((c) => {
      const matchBusca =
        c.cliente_id.toLowerCase().includes(busca.toLowerCase()) ||
        c.porte.toLowerCase().includes(busca.toLowerCase()) ||
        c.segmento.toLowerCase().includes(busca.toLowerCase()) ||
        (c.palavras_chave &&
          (Array.isArray(c.palavras_chave) ? c.palavras_chave : typeof c.palavras_chave === 'string' ? (c.palavras_chave as string).split(',').map(s => s.trim()) : []).some((p) => p.toLowerCase().includes(busca.toLowerCase())));

      const matchPorte =
        filtroPorte === "todos" ||
        c.porte.toLowerCase() === filtroPorte.toLowerCase();

      return matchBusca && matchPorte;
    });
  }, [clientes, busca, filtroPorte]);

  return (
    <div className="space-y-4">
      {/* Barra de Filtros e Busca Rápida */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-zinc-800 bg-zinc-900 p-4">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por ID, Porte ou Sintoma..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            className="h-9 pl-9 text-xs bg-zinc-950/50 border-zinc-800 focus:border-indigo-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-1.5 text-xs">
          <span className="text-muted-foreground mr-1 text-[11px] font-semibold uppercase tracking-wider">
            Filtrar Porte:
          </span>
          {["todos", "Grande", "Médio", "Pequeno"].map((porte) => (
            <button
              key={porte}
              onClick={() => setFiltroPorte(porte)}
              className={cn(
                "rounded-lg px-2.5 py-1 text-xs font-medium transition-colors cursor-pointer",
                filtroPorte === porte
                  ? "bg-indigo-600 text-white font-bold shadow-sm"
                  : "bg-zinc-800 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-700",
              )}
            >
              {porte === "todos" ? "Todos os Portes" : porte}
            </button>
          ))}
        </div>
      </div>

      {/* Tabela Principal Ranqueada */}
      <div className="overflow-hidden border border-zinc-800 bg-zinc-900 shadow-xl rounded-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-zinc-800 bg-zinc-950/50 text-[11px] font-bold uppercase tracking-wider text-zinc-500">
                <th className="py-4 px-5 text-center w-16"># Fila</th>
                <th className="py-4 px-5">Cliente (ID + Porte)</th>
                <th className="py-4 px-5">Mensalidade</th>
                <th className="py-4 px-5">Nível de Severidade</th>
                <th className="py-4 px-5 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800">
              {clientesFiltrados.map((c, index) => {
                const urgenciaNum =
                  typeof c.urgencia_fila_num === "number"
                    ? c.urgencia_fila_num
                    : typeof c.urgencia_fila === "number"
                      ? c.urgencia_fila
                      : c.score_risco;
                const isNeon = c.score_risco > 80;
                const isHigh = c.score_risco >= 60;

                return (
                  <tr
                    key={c.cliente_id}
                    className="group transition-colors hover:bg-zinc-800/40"
                  >
                    {/* 0. Posição na Fila */}
                    <td className="py-4 px-5 text-center">
                      <span
                        className={cn(
                          "inline-flex h-7 w-7 items-center justify-center rounded-lg font-mono text-xs font-bold",
                          index === 0
                            ? "bg-rose-500/20 text-rose-500 ring-1 ring-rose-500/40"
                            : index < 3
                              ? "bg-amber-500/20 text-amber-500 ring-1 ring-amber-500/30"
                              : "bg-zinc-800 text-zinc-500",
                        )}
                      >
                        {String(index + 1).padStart(2, "0")}
                      </span>
                    </td>

                    {/* 1. Coluna: Cliente (ID + Porte) */}
                    <td className="py-4 px-5">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-500/10 ring-1 ring-indigo-500/20 group-hover:ring-indigo-500/40 transition-all">
                          <Building2 className="h-5 w-5 text-indigo-400" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-sm font-bold text-foreground group-hover:text-primary transition-colors">
                              {c.cliente_id}
                            </span>
                            <Badge
                              variant="outline"
                              className={cn(
                                "text-[10px] font-bold uppercase tracking-wider",
                                c.porte === "Grande"
                                  ? "border-indigo-500/40 bg-indigo-500/10 text-indigo-400 ring-1 ring-indigo-500/30"
                                  : "border-zinc-500/30 bg-zinc-800 text-zinc-400",
                              )}
                            >
                              Porte {c.porte}
                            </Badge>
                          </div>
                          <p className="mt-0.5 text-[11px] text-muted-foreground">
                            {c.segmento} · Plano {c.plano ?? "Enterprise"}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* 2. Coluna: Mensalidade */}
                    <td className="py-4 px-5">
                      <div>
                        <span className="font-display text-sm font-bold tabular-nums text-emerald-400">
                          {formatBRL(c.valor_mensal)}
                        </span>
                        <span className="text-[10px] text-zinc-500 block">/mês</span>
                      </div>
                    </td>

                    {/* 3. Coluna: Urgência (IA) */}
                    <td className="py-4 px-5">
                      <div className="min-w-44 max-w-60">
                        <div className="flex items-baseline justify-between text-xs">
                          <span
                            className={cn(
                              "font-display font-extrabold tabular-nums flex items-center gap-1",
                              isNeon
                                ? "text-rose-500"
                                : isHigh
                                  ? "text-rose-400"
                                  : "text-zinc-200",
                            )}
                          >
                            {isNeon && <Flame className="h-3.5 w-3.5 text-rose-500 animate-pulse" />}
                            Urgência: {urgenciaNum} pts
                          </span>
                          <span className="text-[10px] font-semibold text-zinc-500">
                            Score: {c.score_risco}/100
                          </span>
                        </div>

                        {/* Barra de Risco Visual com Neon se > 80 */}
                        <div className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-zinc-800">
                          <div
                            className={cn(
                              "h-full rounded-full transition-all duration-700",
                              isNeon
                                ? "bg-rose-500"
                                : isHigh
                                  ? "bg-rose-400"
                                  : c.score_risco >= 40
                                    ? "bg-amber-400"
                                    : "bg-emerald-400",
                            )}
                            style={{ width: `${Math.min(c.score_risco, 100)}%` }}
                          />
                        </div>

                        {/* Especificação do porquê está Alto / Médio / Baixo */}
                        {(() => {
                          const score = c.score_risco;
                          const isAlto = score > 60;
                          const isMedio = score >= 40 && score <= 60;
                          const titulo = isAlto ? "Por que está ALTO?" : isMedio ? "Por que está MÉDIO?" : "Por que está BAIXO?";
                          const resumo = isAlto
                            ? `${c.score_risco}/100 > 60 · Sinais críticos de atrito operacional acumulados`
                            : isMedio
                              ? `${c.score_risco}/100 (40-60) · Oscilação pontual que exige prevenção`
                              : `${c.score_risco}/100 (< 40) · Métricas saudáveis e SLA cumprido`;
                          return (
                            <div className="mt-2 rounded-md border border-zinc-800 bg-zinc-950/50 p-2 text-[10px] leading-tight">
                              <span className={cn("font-bold uppercase tracking-wider block", isAlto ? "text-rose-400" : isMedio ? "text-amber-400" : "text-emerald-400")}>
                                {titulo}
                              </span>
                              <p className="mt-0.5 text-zinc-400 line-clamp-2">
                                {c.evidencias?.[0] || resumo}
                              </p>
                            </div>
                          );
                        })()}
                      </div>
                    </td>

                    {/* 4. Coluna: Botão de Ação "Ver Dashboard Individual" */}
                    <td className="py-4 px-5 text-right">
                      <Button
                        size="sm"
                        onClick={() => onOpenIndividual(c)}
                        className="h-8 px-4 text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white rounded-md transition-colors"
                      >
                        <ExternalLink className="mr-1.5 h-3.5 w-3.5" />
                        Detalhes
                        <ChevronRight className="ml-1 h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {clientesFiltrados.length === 0 && (
            <div className="p-12 text-center text-sm text-muted-foreground">
              Nenhum cliente encontrado com os filtros atuais.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
