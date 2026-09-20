import { useState } from "react";
import { Award, Gift, Lightbulb, Medal, Trophy, ArrowBigUp } from "lucide-react";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";

interface Ideia {
  id: number;
  cliente_id: string;
  titulo: string;
  descricao: string;
  votos: number;
  pontos: number;
  status: "Em análise" | "Planejada" | "Entregue";
}

const iniciais: Ideia[] = [
  {
    id: 1,
    cliente_id: "C061",
    titulo: "Alerta de SLA em tempo real no painel do cliente",
    descricao: "Notificação quando o ticket passa de 70% do tempo de SLA contratado.",
    votos: 42,
    pontos: 320,
    status: "Planejada",
  },
  {
    id: 2,
    cliente_id: "C010",
    titulo: "Exportação automática do relatório mensal",
    descricao: "Envio do PDF consolidado por e-mail todo dia 1º.",
    votos: 31,
    pontos: 240,
    status: "Em análise",
  },
  {
    id: 3,
    cliente_id: "C052",
    titulo: "Assinatura digital no aceite de chamados",
    descricao: "Exigência de compliance para o setor de saúde.",
    votos: 27,
    pontos: 410,
    status: "Entregue",
  },
];

const recompensas = [
  { icon: Medal, nivel: "Bronze", req: "100 pts", premio: "Selo de parceiro no portal" },
  { icon: Award, nivel: "Prata", req: "300 pts", premio: "1 hora extra de consultoria/mês" },
  { icon: Trophy, nivel: "Ouro", req: "600 pts", premio: "5% de bônus na renovação" },
];

export function IdeasChannel() {
  const [ideias, setIdeias] = useState(iniciais);
  const [titulo, setTitulo] = useState("");
  const [descricao, setDescricao] = useState("");
  const [clienteId, setClienteId] = useState("C071");

  const votar = (id: number) =>
    setIdeias((prev) => prev.map((i) => (i.id === id ? { ...i, votos: i.votos + 1 } : i)));

  const enviar = () => {
    if (!titulo.trim()) {
      toast.error("Descreva a ideia antes de enviar.");
      return;
    }
    setIdeias((prev) => [
      { id: Date.now(), cliente_id: clienteId, titulo, descricao, votos: 1, pontos: 50, status: "Em análise" },
      ...prev,
    ]);
    toast.success("Ideia registrada · +50 pontos creditados", { description: `Cliente ${clienteId}` });
    setTitulo("");
    setDescricao("");
  };

  const pontosCliente = ideias
    .filter((i) => i.cliente_id === clienteId)
    .reduce((s, i) => s + i.pontos, 0);

  return (
    <div className="grid gap-5 lg:grid-cols-[1fr_1fr]">
      <Card className="border-border bg-surface p-6">
        <h3 className="flex items-center gap-2 font-display text-lg font-semibold">
          <Lightbulb className="h-5 w-5 text-risk-mid" /> Canal Gamificado de Ideias
        </h3>
        <p className="mt-1 text-sm text-muted-foreground">
          O cliente sugere melhorias, a comunidade vota e os pontos viram benefícios no contrato.
        </p>

        <div className="mt-6 grid gap-4">
          <div className="grid gap-2">
            <Label>ID do cliente</Label>
            <Input value={clienteId} onChange={(e) => setClienteId(e.target.value.toUpperCase())} />
          </div>
          <div className="grid gap-2">
            <Label>Ideia</Label>
            <Input
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              placeholder="Ex.: Painel de SLA em tempo real"
            />
          </div>
          <div className="grid gap-2">
            <Label>Detalhes</Label>
            <Textarea
              rows={3}
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              placeholder="Que problema isso resolve no dia a dia?"
            />
          </div>
          <div>
            <Button onClick={enviar}>
              <Gift /> Enviar ideia e ganhar pontos
            </Button>
          </div>
        </div>

        <div className="mt-6 rounded-lg border border-border bg-background/40 p-4">
          <div className="flex items-baseline justify-between">
            <p className="text-sm font-medium">Pontuação de {clienteId}</p>
            <p className="font-display text-xl font-semibold text-primary">{pontosCliente} pts</p>
          </div>
          <Progress value={Math.min((pontosCliente / 600) * 100, 100)} className="mt-3" />
          <div className="mt-4 grid gap-2">
            {recompensas.map(({ icon: Icon, nivel, req, premio }) => (
              <div key={nivel} className="flex items-center gap-3 text-xs">
                <Icon className="h-4 w-4 text-risk-mid" />
                <span className="w-14 font-semibold">{nivel}</span>
                <span className="w-16 text-muted-foreground">{req}</span>
                <span className="text-muted-foreground">{premio}</span>
              </div>
            ))}
          </div>
        </div>
      </Card>

      <Card className="border-border bg-surface p-6">
        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
          Mural de ideias da carteira
        </p>
        <div className="mt-4 grid gap-3">
          {ideias.map((i) => (
            <div key={i.id} className="flex gap-3 rounded-lg border border-border bg-background/40 p-4">
              <button
                onClick={() => votar(i.id)}
                className="flex h-14 w-12 shrink-0 flex-col items-center justify-center rounded-md border border-border bg-surface-raised transition-colors hover:border-primary hover:bg-primary/10"
              >
                <ArrowBigUp className="h-4 w-4 text-primary" />
                <span className="text-xs font-semibold tabular-nums">{i.votos}</span>
              </button>
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-sm font-medium">{i.titulo}</p>
                  <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] uppercase tracking-wider text-muted-foreground">
                    {i.status}
                  </span>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">{i.descricao}</p>
                <p className="mt-2 text-[11px] text-muted-foreground">
                  {i.cliente_id} · <span className="text-risk-mid">+{i.pontos} pts</span>
                </p>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
