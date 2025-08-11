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

      // Buscar veículos de todos os clientes de uma vez e montar mapa de contagem e primeiro veículo
      const clienteIds = clientesData.map((c) => c.id)
      const { data: veiculosAll, error: veiculosAllError } = await supabase
        .from('veiculos')
        .select('id, cliente_id, marca, modelo, ano, placa, cor, combustivel, chassi')
        .in('cliente_id', clienteIds)

      if (veiculosAllError) {
        console.error('❌ Erro ao buscar veículos:', veiculosAllError)
        throw veiculosAllError
      }

      const map = new Map<string, { count: number; first?: any }>()
      for (const v of veiculosAll || []) {
        const entry = map.get(v.cliente_id) || { count: 0 }
        if (!entry.first) entry.first = v
        entry.count += 1
        map.set(v.cliente_id, entry)
      }

      const clientesWithDetails = clientesData.map((cliente) => {
        const info = map.get(cliente.id)
        const clienteWithDetails = {
          ...cliente,
          veiculo: info?.first || null,
          veiculosCount: info?.count || 0,
        }
        console.log(`✅ Cliente ${cliente.id} processado:`, clienteWithDetails)
        return clienteWithDetails
      })

      console.log('🎉 Todos os clientes processados:', clientesWithDetails)
      setClientes(clientesWithDetails)
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