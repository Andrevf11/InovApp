import { useState } from "react";
import { UploadCloud, Bot, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

interface InitialSetupModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (formData: FormData) => Promise<void>;
  isSubmitting: boolean;
}

export function InitialSetupModal({ open, onOpenChange, onSubmit, isSubmitting }: InitialSetupModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [systemName, setSystemName] = useState("InovaApps CS");
  const [criteria, setCriteria] = useState("");
  const [priorities, setPriorities] = useState("");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);
    formData.append("system_name", systemName);
    formData.append("criteria", criteria);
    formData.append("priorities", priorities);

    await onSubmit(formData);
  };

  return (
    <Dialog open={open} onOpenChange={isSubmitting ? undefined : onOpenChange}>
      <DialogContent className="sm:max-w-[600px] bg-background/95 backdrop-blur-xl border-primary/20">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl font-display">
            <Bot className="h-6 w-6 text-primary" />
            Setup Inicial da IA
          </DialogTitle>
          <DialogDescription>
            Faça o upload da sua base de clientes e ensine a IA como ela deve interpretar o risco e priorizar a fila para a sua empresa.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 mt-4">
          {/* File Upload Area */}
          <div className="space-y-2">
            <Label>1. Planilha Base (.xlsx)</Label>
            <div className="border-2 border-dashed border-primary/30 rounded-xl p-8 text-center bg-primary/5 hover:bg-primary/10 transition-colors">
              <UploadCloud className="mx-auto h-12 w-12 text-primary/60 mb-4" />
              <div className="flex flex-col items-center">
                <label
                  htmlFor="file-upload"
                  className="cursor-pointer bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 rounded-md font-medium transition-colors"
                >
                  Selecionar Arquivo
                </label>
                <input
                  id="file-upload"
                  type="file"
                  accept=".xlsx"
                  className="hidden"
                  onChange={handleFileChange}
                  required
                />
                {file && (
                  <p className="mt-3 text-sm font-medium text-emerald-500">
                    Arquivo selecionado: {file.name}
                  </p>
                )}
                {!file && (
                  <p className="mt-3 text-xs text-muted-foreground">
                    Apenas arquivos Excel (.xlsx) são suportados.
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="col-span-1 md:col-span-2 space-y-2">
              <Label htmlFor="systemName">2. Nome do Sistema / Empresa</Label>
              <Input
                id="systemName"
                value={systemName}
                onChange={(e) => setSystemName(e.target.value)}
                placeholder="Ex: Globalsys CS"
                className="bg-background/50"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="criteria">3. Critérios de Risco Personalizados</Label>
              <Textarea
                id="criteria"
                value={criteria}
                onChange={(e) => setCriteria(e.target.value)}
                placeholder="Ex: Considerar risco alto se o cliente não abre ticket há 3 meses. Desconsiderar NPS para contas recém criadas."
                className="h-32 resize-none bg-background/50"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="priorities">4. Prioridades de Negócio</Label>
              <Textarea
                id="priorities"
                value={priorities}
                onChange={(e) => setPriorities(e.target.value)}
                placeholder="Ex: Priorizar retenção de clientes do plano Avançado. Empresas do setor financeiro devem ficar no topo da fila."
                className="h-32 resize-none bg-background/50"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-border">
            <Button
              type="button"
              variant="ghost"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={!file || isSubmitting}
              className="bg-primary hover:bg-primary/90 text-primary-foreground min-w-[140px]"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Treinando IA...
                </>
              ) : (
                "Começar Análise"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
