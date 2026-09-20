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
import { MainRankingTable } from "@/components/cs/MainRankingTable";
import { AiProcessingLoader } from "@/components/cs/AiProcessingLoader";
import { IndividualClientDrawer } from "@/components/cs/IndividualClientDrawer";
import { RiskBySizeChart } from "@/components/cs/RiskBySizeChart";
import { PulseChecks } from "@/components/cs/PulseChecks";
import { SilencioQualificado } from "@/components/cs/SilencioQualificado";
import { CrescimentoRelacionamento } from "@/components/cs/CrescimentoRelacionamento";
import { InitialSetupModal } from "@/components/cs/InitialSetupModal";
import {
  AtendimentosSection,
  RegistrarAtendimentoModal,
  type Atendimento,
} from "@/components/cs/AtendimentosSection";
import { baseVazia, analyzeExcel, type AnaliseCarteira } from "@/services/api";
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

function Dashboard() {
  const [dados, setDados] = useState<AnaliseCarteira>(baseVazia());
  const [selecionado, setSelecionado] = useState<ClienteAtivo | null>(null);
  const [aberto, setAberto] = useState(false);
  const [showSetupModal, setShowSetupModal] = useState(false);
  const [nomeSistema, setNomeSistema] = useState("InovaApps CS");
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

  // O backend deve retornar a fila ao processar a planilha. Não usaremos fallback silêncioso para manter o empty state real.

  // Ação principal: POST /analyze_excel com as regras do Setup
  const gerarFila = useMutation({
    mutationFn: (formData: FormData) => analyzeExcel(formData),
    onSuccess: (r, variables) => {
      setDados(r);
      const name = variables.get("system_name") as string;
      if (name) setNomeSistema(name);
      
      setShowSetupModal(false);
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
    onError: (err) => {
      toast.error("Não foi possível concluir a análise", {
        description: err instanceof Error ? err.message : "Verifique se a API está rodando e tente novamente.",
      });
    },
  });

  const clientes = dados.clientes;

  return (
    <div className="min-h-screen bg-zinc-950 text-slate-50 selection:bg-indigo-500/30">
      {/* Overlay premium de processamento da IA */}
      <AiProcessingLoader
        open={gerarFila.isPending}
        mensagem="Processando cruzamento de dados e padrões de risco..."
      />

      <header className="border-b border-white/5 bg-zinc-950/50 backdrop-blur-md sticky top-0 z-10">
        <div className="mx-auto max-w-[1500px] px-6 py-8">
          <div className="flex flex-wrap items-start justify-between gap-6">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 ring-1 ring-primary/30 backdrop-blur-sm">
                <Activity className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h1 className="font-display text-2xl font-bold tracking-tight text-white sm:text-3xl">
                  {nomeSistema}
                  <span className="block text-base font-medium text-zinc-400 sm:inline sm:text-2xl">
                    {" "}
                    — Analytics & Risco B2B
                  </span>
                </h1>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <Button
                size="lg"
                onClick={() => setShowSetupModal(true)}
                disabled={gerarFila.isPending}
                className="h-11 px-6 text-sm font-semibold bg-indigo-600 hover:bg-indigo-500 text-white rounded-md shadow-sm transition-all"
              >
                Nova Análise
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowSetupModal(true)}
                disabled={gerarFila.isPending}
                className="backdrop-blur-sm"
              >
                <RefreshCw className={gerarFila.isPending ? "animate-spin" : ""} /> Reprocessar
              </Button>
            </div>
          </div>

          <div className="mt-8">
            {clientes.length > 0 && (
              <KpiCards
                totalAtivos={dados.summary.total_ativos}
                riscoAlto={dados.summary.risco_alto}
              />
            )}
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-[1500px] px-6 py-8">
          {clientes.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-32 text-center">
              <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-zinc-900 border border-zinc-800 shadow-sm">
                <Activity className="h-8 w-8 text-indigo-400" />
              </div>
              <h2 className="font-display text-2xl font-semibold tracking-tight text-white">Nenhuma base analisada</h2>
              <p className="mt-2 max-w-md text-sm text-zinc-400">
                Inicie uma nova análise enviando a planilha de clientes para gerar o diagnóstico de risco.
              </p>
              <Button
                size="lg"
                onClick={() => setShowSetupModal(true)}
                className="mt-8 h-12 px-8 text-base font-medium bg-indigo-600 hover:bg-indigo-500 text-white rounded-md shadow-sm transition-all"
              >
                Iniciar Análise
              </Button>
            </div>
          ) : (
            <div className="space-y-8">
              <RiskBySizeChart clientes={clientes} />
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

                <MainRankingTable
                  clientes={clientes}
                  onOpenIndividual={(c) => {
                    setSelecionado(c);
                    setAberto(true);
                  }}
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
            </Tabs>
            </div>
          )}
      </main>

      <InitialSetupModal 
        open={showSetupModal} 
        onOpenChange={setShowSetupModal} 
        onSubmit={async (formData) => { await gerarFila.mutateAsync(formData); }} 
        isSubmitting={gerarFila.isPending} 
      />
      <IndividualClientDrawer
        cliente={selecionado}
        open={aberto}
        onOpenChange={setAberto}
        onRegistrarAtendimento={(c) =>
          setModalAtendimento({ aberto: true, clienteId: c.cliente_id })
        }
      />
      <RegistrarAtendimentoModal
        open={modalAtendimento.aberto}
        onOpenChange={(v) => setModalAtendimento((s) => ({ ...s, aberto: v }))}
        clienteIdPadrao={modalAtendimento.clienteId}
        onSalvar={(a) => setAtendimentos((prev) => [a, ...prev])}
      />
    </div>
  );
}
