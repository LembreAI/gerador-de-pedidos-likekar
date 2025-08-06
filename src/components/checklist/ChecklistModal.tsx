import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface ChecklistModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  veiculoId: string;
  onSave: () => void;
}

interface ChecklistData {
  possui_multimidia: boolean;
  possui_insulfilm: boolean;
}

export function ChecklistModal({ open, onOpenChange, veiculoId, onSave }: ChecklistModalProps) {
  const [checklist, setChecklist] = useState<ChecklistData>({
    possui_multimidia: false,
    possui_insulfilm: false,
  });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (open && veiculoId) {
      loadChecklist();
    }
  }, [open, veiculoId]);

  const loadChecklist = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('checklist_veiculo')
        .select('*')
        .eq('veiculo_id', veiculoId)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (data) {
        setChecklist({
          possui_multimidia: data.possui_multimidia,
          possui_insulfilm: data.possui_insulfilm,
        });
      }
    } catch (error) {
      console.error('Erro ao carregar checklist:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao carregar checklist do veículo',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const { error } = await supabase
        .from('checklist_veiculo')
        .upsert({
          veiculo_id: veiculoId,
          possui_multimidia: checklist.possui_multimidia,
          possui_insulfilm: checklist.possui_insulfilm,
        });

      if (error) throw error;

      toast({
        title: 'Sucesso',
        description: 'Checklist salvo com sucesso!',
      });

      onSave();
      onOpenChange(false);
    } catch (error) {
      console.error('Erro ao salvar checklist:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao salvar checklist',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const updateChecklist = (field: keyof ChecklistData, value: boolean) => {
    setChecklist(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Checklist do Veículo</DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-6">
            <div className="text-sm text-muted-foreground">Carregando...</div>
          </div>
        ) : (
          <div className="space-y-4 py-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="multimidia"
                checked={checklist.possui_multimidia}
                onCheckedChange={(checked) => updateChecklist('possui_multimidia', checked as boolean)}
              />
              <label 
                htmlFor="multimidia" 
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Possui Multimídia
              </label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="insulfilm"
                checked={checklist.possui_insulfilm}
                onCheckedChange={(checked) => updateChecklist('possui_insulfilm', checked as boolean)}
              />
              <label 
                htmlFor="insulfilm" 
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Possui Insulfilm
              </label>
            </div>

            <div className="flex justify-end space-x-2 pt-4">
              <Button
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={saving}
              >
                Cancelar
              </Button>
              <Button onClick={handleSave} disabled={saving}>
                {saving ? 'Salvando...' : 'Salvar'}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}