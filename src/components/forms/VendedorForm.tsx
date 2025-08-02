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
import { useVendedores } from "@/contexts/VendedoresContext";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

interface VendedorFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  vendedor?: any;
}

export function VendedorForm({ open, onOpenChange, vendedor }: VendedorFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    nome: "",
    comissao: 5,
  });

  const { createVendedor } = useVendedores();
  const { toast } = useToast();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === "comissao" ? parseFloat(value) || 0 : value
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
      const result = await createVendedor({
        ...formData,
        email: "",
        telefone: "",
        vendas_total: 0,
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
      console.error("Erro ao criar vendedor:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {vendedor ? 'Editar Vendedor' : 'Adicionar Vendedor'}
          </DialogTitle>
          <DialogDescription>
            {vendedor ? 'Edite as informações do vendedor.' : 'Preencha as informações do novo vendedor.'}
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
              {vendedor ? 'Salvar Alterações' : 'Criar Vendedor'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}