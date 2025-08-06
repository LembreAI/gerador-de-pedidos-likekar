import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Car } from 'lucide-react';

interface VehicleSelectionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  clienteId: string;
  clienteNome: string;
  onVehicleSelected: (veiculoId: string) => void;
}

interface Veiculo {
  id: string;
  marca: string;
  modelo: string;
  ano: number;
  cor: string;
  placa: string;
}

export function VehicleSelectionModal({ 
  open, 
  onOpenChange, 
  clienteId, 
  clienteNome, 
  onVehicleSelected 
}: VehicleSelectionModalProps) {
  const [veiculos, setVeiculos] = useState<Veiculo[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (open && clienteId) {
      loadVeiculos();
    }
  }, [open, clienteId]);

  const loadVeiculos = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('veiculos')
        .select('*')
        .eq('cliente_id', clienteId);

      if (error) throw error;

      setVeiculos(data || []);
    } catch (error) {
      console.error('Erro ao carregar veículos:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao carregar veículos do cliente',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSelectVehicle = (veiculoId: string) => {
    onVehicleSelected(veiculoId);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Selecionar Veículo - {clienteNome}</DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-6">
            <div className="text-sm text-muted-foreground">Carregando veículos...</div>
          </div>
        ) : veiculos.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-6 space-y-2">
            <Car className="h-12 w-12 text-muted-foreground" />
            <div className="text-sm text-muted-foreground text-center">
              Este cliente não possui veículos cadastrados.
            </div>
          </div>
        ) : (
          <div className="space-y-3 py-4">
            <div className="text-sm text-muted-foreground mb-4">
              Selecione o veículo para fazer o checklist:
            </div>
            {veiculos.map((veiculo) => (
              <Button
                key={veiculo.id}
                variant="outline"
                className="w-full justify-start h-auto p-4"
                onClick={() => handleSelectVehicle(veiculo.id)}
              >
                <div className="flex items-center space-x-3">
                  <Car className="h-5 w-5 text-muted-foreground" />
                  <div className="text-left">
                    <div className="font-medium">
                      {veiculo.marca} {veiculo.modelo} {veiculo.ano}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {veiculo.cor} • {veiculo.placa}
                    </div>
                  </div>
                </div>
              </Button>
            ))}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}