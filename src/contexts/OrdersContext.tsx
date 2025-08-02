import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface OrdersContextType {
  orders: any[];
  loading: boolean;
  reloadOrders: () => Promise<void>;
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
      
      // Buscar pedidos
      const { data: pedidosData, error: pedidosError } = await supabase
        .from('pedidos')
        .select('*')
        .order('created_at', { ascending: false });

      if (pedidosError) throw pedidosError;

      if (!pedidosData || pedidosData.length === 0) {
        setOrders([]);
        return;
      }

      // Buscar dados relacionados para cada pedido
      const ordersWithDetails = await Promise.all(
        pedidosData.map(async (pedido) => {
          const [clienteResult, veiculoResult, vendedorResult, instaladorResult, produtosResult] = await Promise.all([
            pedido.cliente_id ? supabase.from('clientes').select('*').eq('id', pedido.cliente_id).single() : { data: null },
            pedido.veiculo_id ? supabase.from('veiculos').select('*').eq('id', pedido.veiculo_id).single() : { data: null },
            pedido.vendedor_id ? supabase.from('vendedores').select('*').eq('id', pedido.vendedor_id).single() : { data: null },
            pedido.instalador_id ? supabase.from('instaladores').select('*').eq('id', pedido.instalador_id).single() : { data: null },
            supabase.from('produtos_pedido').select('*').eq('pedido_id', pedido.id)
          ]);

          return {
            ...pedido,
            cliente: clienteResult.data,
            veiculo: veiculoResult.data,
            vendedor: vendedorResult.data,
            instalador: instaladorResult.data,
            produtos: produtosResult.data || []
          };
        })
      );

      setOrders(ordersWithDetails);
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
      reloadOrders: loadOrders,
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