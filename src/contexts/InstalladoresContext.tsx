import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './AuthContext';
import { useToast } from '@/hooks/use-toast';

export interface Installador {
  id: string;
  nome: string;
  email: string;
  telefone?: string;
  especialidade?: string;
  cidade?: string;
  estado?: string;
  ativo: boolean;
  created_at: string;
  updated_at: string;
}

interface InstalladoresContextType {
  instaladores: Installador[];
  loading: boolean;
  createInstallador: (installador: Omit<Installador, 'id' | 'created_at' | 'updated_at'>) => Promise<Installador | null>;
  updateInstallador: (id: string, updates: Partial<Installador>) => Promise<boolean>;
  deleteInstallador: (id: string) => Promise<boolean>;
  refreshInstaladores: () => Promise<void>;
}

const InstalladoresContext = createContext<InstalladoresContextType | undefined>(undefined);

export const InstalladoresProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [instaladores, setInstaladores] = useState<Installador[]>([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const refreshInstaladores = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('instaladores')
        .select('*')
        .order('nome');

      if (error) throw error;
      setInstaladores(data || []);
    } catch (error: any) {
      toast({
        title: "Erro ao carregar instaladores",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      refreshInstaladores();
    }
  }, [user]);

  const createInstallador = async (installadorData: Omit<Installador, 'id' | 'created_at' | 'updated_at'>): Promise<Installador | null> => {
    if (!user) return null;

    try {
      const { data, error } = await supabase
        .from('instaladores')
        .insert([{
          ...installadorData,
          user_id: user.id
        }])
        .select()
        .single();

      if (error) throw error;

      const newInstallador = data as Installador;
      setInstaladores(prev => [newInstallador, ...prev]);
      
      toast({
        title: "Instalador criado!",
        description: `${newInstallador.nome} foi adicionado com sucesso.`,
      });

      return newInstallador;
    } catch (error: any) {
      toast({
        title: "Erro ao criar instalador",
        description: error.message,
        variant: "destructive",
      });
      return null;
    }
  };

  const updateInstallador = async (id: string, updates: Partial<Installador>): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('instaladores')
        .update(updates)
        .eq('id', id);

      if (error) throw error;

      setInstaladores(prev => 
        prev.map(installador => 
          installador.id === id 
            ? { ...installador, ...updates }
            : installador
        )
      );

      toast({
        title: "Instalador atualizado!",
        description: "As informações foram salvas com sucesso.",
      });

      return true;
    } catch (error: any) {
      toast({
        title: "Erro ao atualizar instalador",
        description: error.message,
        variant: "destructive",
      });
      return false;
    }
  };

  const deleteInstallador = async (id: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('instaladores')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setInstaladores(prev => prev.filter(installador => installador.id !== id));
      
      toast({
        title: "Instalador removido!",
        description: "O instalador foi removido com sucesso.",
      });

      return true;
    } catch (error: any) {
      toast({
        title: "Erro ao remover instalador",
        description: error.message,
        variant: "destructive",
      });
      return false;
    }
  };

  return (
    <InstalladoresContext.Provider value={{
      instaladores,
      loading,
      createInstallador,
      updateInstallador,
      deleteInstallador,
      refreshInstaladores
    }}>
      {children}
    </InstalladoresContext.Provider>
  );
};

export const useInstaladores = () => {
  const context = useContext(InstalladoresContext);
  if (context === undefined) {
    throw new Error('useInstaladores must be used within a InstalladoresProvider');
  }
  return context;
};