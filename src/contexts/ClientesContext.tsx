import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface ClientesContextType {
  clientes: any[];
  loading: boolean;
  reloadClientes: () => Promise<void>;
  getClienteWithDetails: (id: string) => any | undefined;
  deleteCliente: (id: string) => Promise<void>;
}

const ClientesContext = createContext<ClientesContextType | undefined>(undefined);

export const ClientesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [clientes, setClientes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Load clientes from Supabase on mount
  useEffect(() => {
    loadClientes();
  }, []);

  const loadClientes = async () => {
    try {
      setLoading(true);
      console.log('🔄 Carregando clientes...');
      
      // Buscar clientes
      const { data: clientesData, error: clientesError } = await supabase
        .from('clientes')
        .select('*')
        .order('created_at', { ascending: false });

      console.log('📊 Clientes carregados:', clientesData);
      if (clientesError) {
        console.error('❌ Erro ao buscar clientes:', clientesError);
        throw clientesError;
      }

      if (!clientesData || clientesData.length === 0) {
        console.log('📭 Nenhum cliente encontrado');
        setClientes([]);
        return;
      }

      // Buscar dados do veículo para cada cliente
      const clientesWithDetails = await Promise.all(
        clientesData.map(async (cliente) => {
          console.log(`🔍 Processando cliente ${cliente.id}...`);
          
          // Buscar veículo do cliente
          const { data: veiculoData, error: veiculoError } = await supabase
            .from('veiculos')
            .select('*')
            .eq('cliente_id', cliente.id)
            .maybeSingle();

          if (veiculoError) {
            console.error('❌ Erro ao buscar veículo:', veiculoError);
          }

          const clienteWithDetails = {
            ...cliente,
            veiculo: veiculoData
          };

          console.log(`✅ Cliente ${cliente.id} processado:`, clienteWithDetails);
          return clienteWithDetails;
        })
      );

      console.log('🎉 Todos os clientes processados:', clientesWithDetails);
      setClientes(clientesWithDetails);
    } catch (error) {
      console.error('💥 Error loading clientes:', error);
    } finally {
      setLoading(false);
    }
  };

  const getClienteWithDetails = (id: string) => {
    return clientes.find(cliente => cliente.id === id);
  };

  const deleteCliente = async (id: string) => {
    try {
      // Primeiro, deletar veículos relacionados
      const { error: veiculosError } = await supabase
        .from('veiculos')
        .delete()
        .eq('cliente_id', id);

      if (veiculosError) throw veiculosError;

      // Depois, deletar o cliente
      const { error: clienteError } = await supabase
        .from('clientes')
        .delete()
        .eq('id', id);

      if (clienteError) throw clienteError;
      
      // Remove from local state
      setClientes(prev => prev.filter(cliente => cliente.id !== id));
    } catch (error) {
      console.error('Error deleting cliente:', error);
      throw error;
    }
  };

  return (
    <ClientesContext.Provider value={{
      clientes,
      loading,
      reloadClientes: loadClientes,
      getClienteWithDetails,
      deleteCliente
    }}>
      {children}
    </ClientesContext.Provider>
  );
};

export const useClientes = () => {
  const context = useContext(ClientesContext);
  if (context === undefined) {
    throw new Error('useClientes must be used within a ClientesProvider');
  }
  return context;
};