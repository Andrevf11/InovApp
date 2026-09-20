import { useEffect, useState } from "react";
import { Loader2, Database, Layers, CheckCircle2 } from "lucide-react";

interface AiProcessingLoaderProps {
  open: boolean;
  mensagem?: string;
}

const passosProc = [
  "Lendo abas da planilha (clientes, atendimento_mensal, pesquisas_nps)...",
  "Cruzando histórico de SLAs e chamados críticos reabertos...",
  "Identificando contas em Silêncio Qualificado (NPS ausente)...",
  "Calculando matriz de Risco e urgência da carteira...",
  "Sintetizando diagnósticos e planos de ação...",
];

export function AiProcessingLoader({
  open,
  mensagem = "Processando análise de dados de risco...",
}: AiProcessingLoaderProps) {
  const [passoAtual, setPassoAtual] = useState(0);

  useEffect(() => {
    if (!open) {
      setPassoAtual(0);
      return;
    }
    const interval = setInterval(() => {
      setPassoAtual((prev) => (prev + 1) % passosProc.length);
    }, 2200);
    return () => clearInterval(interval);
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/80 backdrop-blur-md animate-in fade-in duration-300">
      <div className="relative flex max-w-lg flex-col items-center gap-6 rounded-xl border border-zinc-800 bg-zinc-900 px-8 py-10 text-center shadow-xl">
        
        {/* Simple Loading Spinner */}
        <div className="relative flex h-20 w-20 items-center justify-center rounded-2xl bg-zinc-800/50 border border-zinc-700/50">
          <Loader2 className="h-10 w-10 text-indigo-500 animate-spin" />
        </div>

        {/* Mensagem Principal */}
        <div>
          <h3 className="font-display text-xl sm:text-xl font-semibold tracking-tight text-zinc-100">
            {mensagem}
          </h3>
          <p className="mt-2 text-xs sm:text-sm text-zinc-400 max-w-md mx-auto">
            O motor de analytics está compilando os dados estruturados e cruzando o contexto comportamental para o cálculo de churn.
          </p>
        </div>

        {/* Passo em andamento dinâmico */}
        <div className="w-full rounded-lg border border-zinc-800 bg-zinc-950/50 px-4 py-3">
          <div className="flex items-center justify-center gap-2 text-xs font-medium text-indigo-400">
            <span className="line-clamp-1">{passosProc[passoAtual]}</span>
          </div>

          {/* Barra de progresso */}
          <div className="mt-3 h-1 w-full overflow-hidden rounded-full bg-zinc-800">
            <div className="h-full rounded-full bg-indigo-500 animate-pulse w-full" />
          </div>
        </div>

        {/* Rodapé informativo */}
        <div className="flex items-center gap-4 text-[11px] text-zinc-500 font-medium">
          <span className="flex items-center gap-1">
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" /> Origem: Excel (.xlsx)
          </span>
          <span className="flex items-center gap-1">
            <Layers className="h-3.5 w-3.5 text-zinc-400" /> Fila Priorizada
          </span>
          <span className="flex items-center gap-1">
            <Database className="h-3.5 w-3.5 text-zinc-400" /> Modelagem de Dados
          </span>
        </div>
      </div>
    </div>
  );
}
