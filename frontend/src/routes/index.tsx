import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
  Activity,
  BrainCircuit,
  CalendarCheck,
  Ghost,
  HeartHandshake,
  Lightbulb,
  ListOrdered,
  Radio,
  RefreshCw,
} from "lucide-react";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { KpiCards } from "@/components/cs/KpiCards";
import { QueueTable } from "@/components/cs/QueueTable";
import { ClientDetailModal } from "@/components/cs/ClientDetailModal";
import { PulseChecks } from "@/components/cs/PulseChecks";
import { IdeasChannel } from "@/components/cs/IdeasChannel";
import { SilencioQualificado } from "@/components/cs/SilencioQualificado";
import { CrescimentoRelacionamento } from "@/components/cs/CrescimentoRelacionamento";
import {
  AtendimentosSection,
  RegistrarAtendimentoModal,
  type Atendimento,
} from "@/components/cs/AtendimentosSection";
import { analyzeDb, analyzeExcel, type AnaliseCarteira } from "@/services/api";
import { clientesMock } from "@/data/mock";
import type { ClienteAtivo } from "@/types/inova";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Globalsys CS Pulse — Gestão de Risco de Churn B2B" },
      {
        name: "description",
        content:
          "Dashboard premium de preservação de receita: fila priorizada por IA (Score × MRR), SLA adaptativo por plano e lógica de relacionamento personalizado.",
      },
      { property: "og:title", content: "Globalsys CS Pulse — Gestão de Risco de Churn B2B" },
      {
        property: "og:description",
        content:
          "Fila de Customer Success priorizada por IA, SLA adaptativo por plano e planos de relacionamento personalizados para preservar R$ 660.000/ano de ARR.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Dashboard,
});

const baseInicial: AnaliseCarteira = {
  clientes: clientesMock,
  summary: { total_ativos: 58, risco_alto: clientesMock.filter((c) => c.score_risco > 60).length },
  origem: "mock",
  detalheOrigem: "Base local da última análise",
};

function Dashboard() {
  const [dados, setDados] = useState<AnaliseCarteira>(baseInicial);
  const [selecionado, setSelecionado] = useState<ClienteAtivo | null>(null);
  const [aberto, setAberto] = useState(false);
  const [atualizadoEm, setAtualizadoEm] = useState("");
  const [modalAtendimento, setModalAtendimento] = useState<{ aberto: boolean; clienteId: string }>({
    aberto: false,
    clienteId: "",
  });
  const [atendimentos, setAtendimentos] = useState<Atendimento[]>([
    {
      id: 1,
      cliente_id: "C071",
      canal: "Telefone",
      severidade: "Grave",
      observacoes: "Sponsor cobrou plano de recuperação do SLA em 30 dias.",
      status_resolucao: "Escalado para N2/N3",
      registrado_em: new Date().toISOString(),
    },
    {
      id: 2,
      cliente_id: "C080",
      canal: "WhatsApp",
      severidade: "Moderado",
      observacoes: "Alinhado cronograma de re-onboarding dos usuários.",
      status_resolucao: "Em andamento",
      registrado_em: new Date().toISOString(),
    },
  ]);

  // Carga inicial silenciosa (fallback mock já garante dados na tela).
  const { data: inicial } = useQuery({
    queryKey: ["analyze_db"],
    queryFn: ({ signal }) => analyzeDb(signal),
    staleTime: 60_000,
  });

  useEffect(() => {
    if (inicial) {
      setDados(inicial);
      setAtualizadoEm(new Date().toLocaleString("pt-BR"));
    }
  }, [inicial]);

  // Ação principal: POST /analyze_excel -> /analyze_db -> base mockada.
  const gerarFila = useMutation({
    mutationFn: () => analyzeExcel(),
    onSuccess: (r) => {
      setDados(r);
      setAtualizadoEm(new Date().toLocaleString("pt-BR"));
      if (r.origem === "api") {
        toast.success("Fila de priorização gerada!", {
          description: `Motor ${r.detalheOrigem} processou ${r.summary.total_ativos} clientes ativos.`,
        });
      } else {
        toast.warning("Motor local indisponível — exibindo base mockada", {
          description:
            "Ligue o servidor Python (127.0.0.1:8000) e clique novamente para a análise real da IA. A tela segue 100% funcional com a última base conhecida.",
        });
      }
    },
    onError: () => {
      toast.error("Não foi possível concluir a análise", {
        description: "A base local mockada permanece carregada — nenhuma informação foi perdida.",
      });
    },
  });

  const clientes = dados.clientes;

  return (
    <div className="aurora-bg min-h-screen">
      {/* Overlay premium de processamento da IA */}
      {gerarFila.isPending && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-md">
          <div className="glass-panel flex max-w-md flex-col items-center gap-6 px-10 py-12 text-center">
            <div className="relative flex h-20 w-20 items-center justify-center">
              <span className="absolute inset-0 animate-ping rounded-full bg-primary/20" />
              <span className="absolute inset-2 rounded-full border-2 border-primary/30 border-t-primary animate-spin" />
              <BrainCircuit className="relative h-8 w-8 text-primary text-glow-primary" />
            </div>
            <div>
              <p className="font-display text-lg font-semibold">A IA está cruzando NPS, Atendimentos e Padrões de Risco...</p>
              <p className="mt-2 text-sm text-muted-foreground">Por favor aguarde. Isso pode levar até 10 segundos.</p>
            </div>
            <div className="h-1 w-56 overflow-hidden rounded-full bg-muted">
              <div className="cta-glow h-full w-1/2 animate-[pulse_1.2s_ease-in-out_infinite] rounded-full" />
            </div>
          </div>
        </div>
      )}

      <header className="grid-industrial border-b border-glass-border">
        <div className="mx-auto max-w-[1500px] px-6 py-8">
          <div className="flex flex-wrap items-start justify-between gap-6">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 ring-1 ring-primary/30 backdrop-blur-sm">
                <Activity className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h1 className="font-display text-2xl font-bold sm:text-3xl">
                  Globalsys CS Pulse
                  <span className="block text-base font-medium text-muted-foreground sm:inline sm:text-2xl">
                    {" "}
                    — Preservação de Receita B2B
                  </span>
                </h1>
                <p className="mt-1 text-sm text-muted-foreground">
                  Motor de Análise Preditiva e Diagnóstico Prescritivo de Churn · InovaApps 2026
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <Button
                size="lg"
                onClick={() => gerarFila.mutate()}
                disabled={gerarFila.isPending}
                className="cta-glow h-14 px-7 text-base font-bold text-primary-foreground hover:scale-[1.02] active:scale-[0.99]"
              >
                ⚡ Gerar Fila de Priorização IA
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => gerarFila.mutate()}
                disabled={gerarFila.isPending}
                className="backdrop-blur-sm"
              >
                <RefreshCw className={gerarFila.isPending ? "animate-spin" : ""} /> Reprocessar
              </Button>
            </div>
          </div>

          <div className="mt-8">
            <KpiCards
              totalAtivos={dados.summary.total_ativos}
              riscoAlto={dados.summary.risco_alto}
            />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-[1500px] px-6 py-8">
        <Tabs defaultValue="fila">
          <TabsList className="flex-wrap backdrop-blur-sm">
            <TabsTrigger value="fila">
              <ListOrdered className="mr-2 h-4 w-4" /> Fila Prioritária
            </TabsTrigger>
            <TabsTrigger value="atendimentos">
              <CalendarCheck className="mr-2 h-4 w-4" /> Atendimentos
            </TabsTrigger>
            <TabsTrigger value="silencio">
              <Ghost className="mr-2 h-4 w-4" /> Silêncio Qualificado
            </TabsTrigger>
            <TabsTrigger value="crescimento">
              <HeartHandshake className="mr-2 h-4 w-4" /> Crescimento &amp; Relacionamento
            </TabsTrigger>
            <TabsTrigger value="pulse">
              <Radio className="mr-2 h-4 w-4" /> Pulse Checks
            </TabsTrigger>
            <TabsTrigger value="ideias">
              <Lightbulb className="mr-2 h-4 w-4" /> Canal de Ideias
            </TabsTrigger>
          </TabsList>

          <TabsContent value="fila" className="mt-6">
            <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
              <div>
                <h2 className="font-display text-xl font-semibold">Fila de Atendimento Priorizada</h2>
                <p className="text-sm text-muted-foreground">
                  Ordenação rigorosa por impacto financeiro (Score de Risco × MRR). Última análise: {atualizadoEm || "—"}
                </p>
              </div>
              <p className="text-xs text-muted-foreground">
                {clientes.length} contas na fila · {dados.summary.total_ativos} ativos analisados ·{" "}
                {dados.origem === "api" ? `Dados do motor (${dados.detalheOrigem})` : dados.detalheOrigem}
              </p>
            </div>

            <QueueTable
              clientes={clientes}
              onOpen={(c) => {
                setSelecionado(c);
                setAberto(true);
              }}
              onRegistrarAcao={(c) => setModalAtendimento({ aberto: true, clienteId: c.cliente_id })}
            />
          </TabsContent>

          <TabsContent value="atendimentos" className="mt-6">
            <AtendimentosSection
              atendimentos={atendimentos}
              onNovo={() => setModalAtendimento({ aberto: true, clienteId: "" })}
            />
          </TabsContent>

          <TabsContent value="silencio" className="mt-6">
            <SilencioQualificado />
          </TabsContent>


          <TabsContent value="crescimento" className="mt-6">
            <CrescimentoRelacionamento />
          </TabsContent>

          <TabsContent value="pulse" className="mt-6">
            <PulseChecks />
          </TabsContent>

          <TabsContent value="ideias" className="mt-6">
            <IdeasChannel />
          </TabsContent>
        </Tabs>
      </main>

      <ClientDetailModal cliente={selecionado} open={aberto} onOpenChange={setAberto} />
      <RegistrarAtendimentoModal
        open={modalAtendimento.aberto}
        onOpenChange={(v) => setModalAtendimento((s) => ({ ...s, aberto: v }))}
        clienteIdPadrao={modalAtendimento.clienteId}
        onSalvar={(a) => setAtendimentos((prev) => [a, ...prev])}
      />
    </div>
  );
}
