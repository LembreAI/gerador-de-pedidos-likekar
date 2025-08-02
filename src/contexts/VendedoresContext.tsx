import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './AuthContext';
import { useToast } from '@/hooks/use-toast';

export interface Vendedor {
  id: string;
  nome: string;
  email: string;
  telefone?: string;
  comissao: number;
  vendas_total: number;
  ativo: boolean;
  created_at: string;
  updated_at: string;
}

interface VendedoresContextType {
  vendedores: Vendedor[];
  loading: boolean;
  createVendedor: (vendedor: Omit<Vendedor, 'id' | 'created_at' | 'updated_at'>) => Promise<Vendedor | null>;
  updateVendedor: (id: string, updates: Partial<Vendedor>) => Promise<boolean>;
  deleteVendedor: (id: string) => Promise<boolean>;
  refreshVendedores: () => Promise<void>;
}

const VendedoresContext = createContext<VendedoresContextType | undefined>(undefined);

export const VendedoresProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [vendedores, setVendedores] = useState<Vendedor[]>([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const refreshVendedores = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('vendedores')
        .select('*')
        .order('nome');

      if (error) throw error;
      setVendedores(data || []);
    } catch (error: any) {
      toast({
        title: "Erro ao carregar vendedores",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      refreshVendedores();
    }
  }, [user]);

  const createVendedor = async (vendedorData: Omit<Vendedor, 'id' | 'created_at' | 'updated_at'>): Promise<Vendedor | null> => {
    if (!user) return null;

    try {
      const { data, error } = await supabase
        .from('vendedores')
        .insert([{
          ...vendedorData,
          user_id: user.id
        }])
        .select()
        .single();

      if (error) throw error;

      const newVendedor = data as Vendedor;
      setVendedores(prev => [newVendedor, ...prev]);
      
      toast({
        title: "Vendedor criado!",
        description: `${newVendedor.nome} foi adicionado com sucesso.`,
      });

      return newVendedor;
    } catch (error: any) {
      toast({
        title: "Erro ao criar vendedor",
        description: error.message,
        variant: "destructive",
      });
      return null;
    }
  };

  const updateVendedor = async (id: string, updates: Partial<Vendedor>): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('vendedores')
        .update(updates)
        .eq('id', id);

      if (error) throw error;

      setVendedores(prev => 
        prev.map(vendedor => 
          vendedor.id === id 
            ? { ...vendedor, ...updates }
            : vendedor
        )
      );

      toast({
        title: "Vendedor atualizado!",
        description: "As informações foram salvas com sucesso.",
      });

      return true;
    } catch (error: any) {
      toast({
        title: "Erro ao atualizar vendedor",
        description: error.message,
        variant: "destructive",
      });
      return false;
    }
  };

  const deleteVendedor = async (id: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('vendedores')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setVendedores(prev => prev.filter(vendedor => vendedor.id !== id));
      
      toast({
        title: "Vendedor removido!",
        description: "O vendedor foi removido com sucesso.",
      });

      return true;
    } catch (error: any) {
      toast({
        title: "Erro ao remover vendedor",
        description: error.message,
        variant: "destructive",
      });
      return false;
    }
  };

  return (
    <VendedoresContext.Provider value={{
      vendedores,
      loading,
      createVendedor,
      updateVendedor,
      deleteVendedor,
      refreshVendedores
    }}>
      {children}
    </VendedoresContext.Provider>
  );
};

export const useVendedores = () => {
  const context = useContext(VendedoresContext);
  if (context === undefined) {
    throw new Error('useVendedores must be used within a VendedoresProvider');
  }
  return context;
};