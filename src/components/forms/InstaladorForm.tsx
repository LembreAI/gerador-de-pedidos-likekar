import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useInstaladores } from "@/contexts/InstalladoresContext";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

interface InstaladorFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function InstaladorForm({ open, onOpenChange }: InstaladorFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    nome: "",
    comissao: 5,
  });

  const { createInstallador } = useInstaladores();
  const { toast } = useToast();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.nome.trim()) {
      toast({
        title: "Campo obrigatório",
        description: "Nome é obrigatório.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const result = await createInstallador({
        ...formData,
        email: "",
        telefone: "",
        especialidade: "",
        cidade: "",
        estado: "",
        ativo: true,
      });

      if (result) {
        setFormData({
          nome: "",
          comissao: 5,
        });
        onOpenChange(false);
      }
    } catch (error) {
      console.error("Erro ao criar instalador:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Adicionar Instalador</DialogTitle>
          <DialogDescription>
            Preencha as informações do novo instalador.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="nome">Nome *</Label>
            <Input
              id="nome"
              name="nome"
              value={formData.nome}
              onChange={handleInputChange}
              placeholder="Nome completo"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="comissao">Comissão (%)</Label>
            <Input
              id="comissao"
              name="comissao"
              type="number"
              step="0.1"
              min="0"
              max="100"
              value={formData.comissao}
              onChange={handleInputChange}
              placeholder="5.0"
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Criar Instalador
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}