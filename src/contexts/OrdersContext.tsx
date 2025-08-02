import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface OrdersContextType {
  orders: any[];
  loading: boolean;
  getOrderWithDetails: (id: string) => any | undefined;
  deleteOrder: (id: string) => Promise<void>;
}

const OrdersContext = createContext<OrdersContextType | undefined>(undefined);

export const OrdersProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Load orders from Supabase on mount
  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('pedidos')
        .select(`
          *,
          cliente:clientes(id, nome, telefone, email, endereco, cidade, estado, cep, cpf_cnpj),
          veiculo:veiculos(id, marca, modelo, ano, placa, cor, chassi, combustivel),
          vendedor:vendedores(id, nome, email, telefone),
          instalador:instaladores(id, nome, email, telefone, especialidade),
          produtos:produtos_pedido(*)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setOrders(data || []);
    } catch (error) {
      console.error('Error loading orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const getOrderWithDetails = (id: string) => {
    return orders.find(order => order.id === id);
  };

  const deleteOrder = async (id: string) => {
    try {
      const { error } = await supabase
        .from('pedidos')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      // Remove from local state
      setOrders(prev => prev.filter(order => order.id !== id));
    } catch (error) {
      console.error('Error deleting order:', error);
      throw error;
    }
  };

  return (
    <OrdersContext.Provider value={{
      orders,
      loading,
      getOrderWithDetails,
      deleteOrder
    }}>
      {children}
    </OrdersContext.Provider>
  );
};

export const useOrders = () => {
  const context = useContext(OrdersContext);
  if (context === undefined) {
    throw new Error('useOrders must be used within an OrdersProvider');
  }
  return context;
};