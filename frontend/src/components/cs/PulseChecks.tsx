import { useState } from "react";
import { Frown, Meh, Smile, Send, Zap } from "lucide-react";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function PulseChecks() {
  const [pergunta, setPergunta] = useState("Como foi sua experiência com o suporte esta semana?");
  const [frequencia, setFrequencia] = useState("quinzenal");
  const [gatilho, setGatilho] = useState(true);
  const [alvo, setAlvo] = useState([60]);

  return (
    <div className="grid gap-5 lg:grid-cols-[1.1fr_1fr]">
      <Card className="border-border bg-surface p-6">
        <h3 className="font-display text-lg font-semibold">Configurar Pulse Check</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Pesquisa de 1 clique embutida no produto. Sem formulário longo, sem fadiga de resposta.
        </p>

        <div className="mt-6 grid gap-5">
          <div className="grid gap-2">
            <Label>Pergunta exibida no app</Label>
            <Input value={pergunta} onChange={(e) => setPergunta(e.target.value)} />
          </div>

          <div className="grid gap-2">
            <Label>Frequência de disparo</Label>
            <Select value={frequencia} onValueChange={setFrequencia}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="semanal">Semanal</SelectItem>
                <SelectItem value="quinzenal">Quinzenal</SelectItem>
                <SelectItem value="mensal">Mensal</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label>Disparar apenas para contas com score de risco acima de {alvo[0]}</Label>
            <Slider value={alvo} onValueChange={setAlvo} min={0} max={100} step={5} />
          </div>

          <div className="flex items-center justify-between rounded-lg border border-border bg-background/40 p-4">
            <div>
              <p className="text-sm font-medium">Gatilho pós-chamado crítico</p>
              <p className="text-xs text-muted-foreground">
                Envia o pulse automaticamente 24h após o fechamento de um ticket crítico.
              </p>
            </div>
            <Switch checked={gatilho} onCheckedChange={setGatilho} />
          </div>

          <div>
            <Button onClick={() => toast.success("Pulse Check publicado para a carteira selecionada")}>
              <Send /> Publicar Pulse Check
            </Button>
          </div>
        </div>
      </Card>

      <Card className="border-border bg-surface p-6">
        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
          Pré-visualização no produto do cliente
        </p>
        <div className="mt-4 rounded-xl border border-primary/30 bg-background/60 p-6">
          <div className="flex items-center gap-2 text-xs text-primary">
            <Zap className="h-3.5 w-3.5" /> Globalsys Pulse
          </div>
          <p className="mt-3 text-base font-medium">{pergunta}</p>
          <div className="mt-5 flex gap-3">
            {[
              { icon: Frown, label: "Ruim" },
              { icon: Meh, label: "Ok" },
              { icon: Smile, label: "Ótimo" },
            ].map(({ icon: Icon, label }) => (
              <button
                key={label}
                onClick={() => toast.success(`Resposta simulada: ${label}`)}
                className="flex flex-1 flex-col items-center gap-2 rounded-lg border border-border bg-surface-raised p-4 transition-colors hover:border-primary hover:bg-primary/10"
              >
                <Icon className="h-6 w-6 text-muted-foreground" />
                <span className="text-xs font-medium">{label}</span>
              </button>
            ))}
          </div>
          <p className="mt-4 text-center text-[11px] text-muted-foreground">
            Resposta em 1 clique · 4 segundos em média
          </p>
        </div>

        <div className="mt-6 grid grid-cols-3 gap-3 text-center">
          {[
            { k: "Taxa de resposta", v: "74%" },
            { k: "Contas em silêncio", v: "12" },
            { k: "Pulses no mês", v: "312" },
          ].map((m) => (
            <div key={m.k} className="rounded-lg border border-border bg-background/40 p-3">
              <p className="font-display text-xl font-semibold text-primary">{m.v}</p>
              <p className="mt-1 text-[10px] uppercase tracking-wider text-muted-foreground">{m.k}</p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
