import { useEffect, useState } from "react";
import { ClipboardList, FilePlus2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";

export interface Atendimento {
  id: number;
  cliente_id: string;
  canal: string;
  severidade: "Leve" | "Moderado" | "Grave";
  observacoes: string;
  status_resolucao: string;
  registrado_em: string;
}

const severidadeTone: Record<Atendimento["severidade"], string> = {
  Leve: "bg-risk-low/10 text-risk-low ring-risk-low/30",
  Moderado: "bg-risk-mid/10 text-risk-mid ring-risk-mid/30",
  Grave: "bg-risk-high/10 text-risk-high ring-risk-high/30",
};

export function RegistrarAtendimentoModal({
  open,
  onOpenChange,
  clienteIdPadrao,
  onSalvar,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  clienteIdPadrao?: string;
  onSalvar: (a: Atendimento) => void;
}) {
  const [clienteId, setClienteId] = useState(clienteIdPadrao ?? "");
  const [canal, setCanal] = useState("");
  const [severidade, setSeveridade] = useState<Atendimento["severidade"] | "">("");
  const [observacoes, setObservacoes] = useState("");
  const [status, setStatus] = useState("");

  // Reaplica o cliente pré-selecionado sempre que o modal abre.
  useEffect(() => {
    if (open) setClienteId(clienteIdPadrao ?? "");
  }, [open, clienteIdPadrao]);

  const salvar = () => {
    if (!clienteId.trim() || !canal || !severidade || !status) {
      toast.error("Preencha ID do cliente, canal, severidade e status da resolução.");
      return;
    }
    onSalvar({
      id: Date.now(),
      cliente_id: clienteId.trim().toUpperCase(),
      canal,
      severidade,
      observacoes,
      status_resolucao: status,
      registrado_em: new Date().toISOString(),
    });
    toast.success("Atendimento registrado", {
      description: `${clienteId.toUpperCase()} · ${canal} · Severidade ${severidade}`,
    });
    setCanal("");
    setSeveridade("");
    setObservacoes("");
    setStatus("");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="border-border bg-surface sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-display text-xl">Registrar Atendimento</DialogTitle>
          <DialogDescription>
            Cada registro alimenta o histórico do cliente e a priorização da fila de CS.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4">
          <div className="grid gap-2">
            <Label>ID do Cliente</Label>
            <Input
              value={clienteId}
              onChange={(e) => setClienteId(e.target.value.toUpperCase())}
              placeholder="Ex.: C071"
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label>Canal</Label>
              <Select value={canal} onValueChange={setCanal}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Telefone">Telefone</SelectItem>
                  <SelectItem value="WhatsApp">WhatsApp</SelectItem>
                  <SelectItem value="E-mail">E-mail</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label>Severidade</Label>
              <Select value={severidade} onValueChange={(v) => setSeveridade(v as Atendimento["severidade"])}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Leve">Leve</SelectItem>
                  <SelectItem value="Moderado">Moderado</SelectItem>
                  <SelectItem value="Grave">Grave</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid gap-2">
            <Label>Observações</Label>
            <Textarea
              rows={3}
              value={observacoes}
              onChange={(e) => setObservacoes(e.target.value)}
              placeholder="Resumo do contato, demandas levantadas e próximos passos..."
            />
          </div>
          <div className="grid gap-2">
            <Label>Status da Resolução</Label>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Resolvido no primeiro contato">Resolvido no primeiro contato</SelectItem>
                <SelectItem value="Em andamento">Em andamento</SelectItem>
                <SelectItem value="Escalado para N2/N3">Escalado para N2/N3</SelectItem>
                <SelectItem value="Aguardando cliente">Aguardando cliente</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button onClick={salvar}>
            <FilePlus2 /> Salvar registro
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function AtendimentosSection({
  atendimentos,
  onNovo,
}: {
  atendimentos: Atendimento[];
  onNovo: () => void;
}) {
  return (
    <Card className="glass-panel p-6">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="flex items-center gap-2 font-display text-lg font-semibold">
            <ClipboardList className="h-5 w-5 text-primary" /> Registro de Atendimentos
          </h3>
          <p className="text-sm text-muted-foreground">
            Histórico de contatos da equipe de CS com a carteira — canal, severidade e resolução.
          </p>
        </div>
        <Button onClick={onNovo}>
          <FilePlus2 /> Registrar Novo Atendimento
        </Button>
      </div>

      <div className="overflow-x-auto rounded-lg border border-border">
        <Table>
          <TableHeader>
            <TableRow className="border-border bg-surface-raised/60 hover:bg-surface-raised/60">
              <TableHead className="text-muted-foreground">ID do Cliente</TableHead>
              <TableHead className="text-muted-foreground">Canal</TableHead>
              <TableHead className="text-muted-foreground">Severidade</TableHead>
              <TableHead className="min-w-56 text-muted-foreground">Observações</TableHead>
              <TableHead className="text-muted-foreground">Status da Resolução</TableHead>
              <TableHead className="text-right text-muted-foreground">Registrado em</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {atendimentos.map((a) => (
              <TableRow key={a.id} className="border-border">
                <TableCell className="font-display font-semibold">{a.cliente_id}</TableCell>
                <TableCell>{a.canal}</TableCell>
                <TableCell>
                  <span
                    className={cn(
                      "inline-flex rounded-full px-2.5 py-0.5 text-[11px] font-semibold ring-1",
                      severidadeTone[a.severidade],
                    )}
                  >
                    {a.severidade}
                  </span>
                </TableCell>
                <TableCell className="text-xs text-muted-foreground">{a.observacoes || "—"}</TableCell>
                <TableCell className="text-xs">{a.status_resolucao}</TableCell>
                <TableCell className="text-right text-xs tabular-nums text-muted-foreground">
                  {new Date(a.registrado_em).toLocaleString("pt-BR")}
                </TableCell>
              </TableRow>
            ))}
            {atendimentos.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="py-8 text-center text-sm text-muted-foreground">
                  Nenhum atendimento registrado ainda.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </Card>
  );
}
