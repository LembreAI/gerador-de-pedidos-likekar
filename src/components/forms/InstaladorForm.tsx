import React, { useState, useEffect } from "react";
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
  instalador?: any;
}

export function InstaladorForm({ open, onOpenChange, instalador }: InstaladorFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    nome: "",
    comissao: 5,
  });

  const { createInstallador, updateInstallador } = useInstaladores();
  const { toast } = useToast();

  
  // Update form data when instalador prop changes
  useEffect(() => {
    if (instalador) {
      setFormData({
        nome: instalador.nome || "",
        comissao: instalador.comissao || 5,
      });
    } else {
      setFormData({
        nome: "",
        comissao: 5,
      });
    }
  }, [instalador]);

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
      if (instalador) {
        // Editing existing instalador
        const success = await updateInstallador(instalador.id, {
          nome: formData.nome,
          comissao: formData.comissao,
        });

        if (success) {
          onOpenChange(false);
        }
      } else {
        // Creating new instalador
        const result = await createInstallador({
          nome: formData.nome,
          email: "",
          comissao: formData.comissao,
          ativo: true,
        });

        if (result) {
          setFormData({
            nome: "",
            comissao: 5,
          });
          onOpenChange(false);
        }
      }
    } catch (error) {
      console.error("Erro ao salvar instalador:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {instalador ? 'Editar Instalador' : 'Adicionar Instalador'}
          </DialogTitle>
          <DialogDescription>
            {instalador ? 'Edite as informações do instalador.' : 'Preencha as informações do novo instalador.'}
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
              {instalador ? 'Salvar Alterações' : 'Criar Instalador'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}