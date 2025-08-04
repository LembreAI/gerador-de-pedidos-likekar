import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './AuthContext';
import { useToast } from '@/hooks/use-toast';
import { startOfMonth, endOfMonth, parseISO } from 'date-fns';
import type { DateRange } from 'react-day-picker';

export interface VendedorComissao {
  id: string;
  nome: string;
  email: string;
  comissao: number;
  total_vendas: number;
  valor_total_vendas: number;
  comissao_total: number;
}

export interface InstaladorComissao {
  id: string;
  nome: string;
  email: string;
  comissao: number;
  total_instalacoes: number;
  valor_total_instalacoes: number;
  comissao_total: number;
}

export interface ComissoesSummary {
  total_comissoes: number;
  total_pedidos: number;
  comissao_media: number;
}

interface CommissionsContextType {
  vendedoresComissoes: VendedorComissao[];
  installadoresComissoes: InstaladorComissao[];
  summary: ComissoesSummary;
  loading: boolean;
  selectedPeriod: DateRange | undefined;
  setSelectedPeriod: (date: DateRange | undefined) => void;
  refreshCommissions: () => Promise<void>;
  getHistoricoComissoes: (funcionarioId: string, tipo: 'Vendedor' | 'Instalador') => Promise<{ month: string; comissao: number }[]>;
}

const CommissionsContext = createContext<CommissionsContextType | undefined>(undefined);

export const CommissionsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [vendedoresComissoes, setVendedoresComissoes] = useState<VendedorComissao[]>([]);
  const [installadoresComissoes, setInstalladoresComissoes] = useState<InstaladorComissao[]>([]);
  const [summary, setSummary] = useState<ComissoesSummary>({
    total_comissoes: 0,
    total_pedidos: 0,
    comissao_media: 0
  });
  const [loading, setLoading] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState<DateRange | undefined>({
    from: startOfMonth(new Date()),
    to: endOfMonth(new Date())
  });
  const { user } = useAuth();
  const { toast } = useToast();

  const refreshCommissions = async () => {
    if (!user || !selectedPeriod?.from || !selectedPeriod?.to) return;
    
    setLoading(true);
    try {
      const startDate = selectedPeriod.from.toISOString();
      const endDate = selectedPeriod.to.toISOString();

      // Buscar pedidos com vendedores no período
      const { data: pedidosVendedores, error: pedidosVendedoresError } = await supabase
        .from('pedidos')
        .select(`
          id,
          valor_total,
          vendedor_id,
          vendedores!inner(
            id,
            nome,
            email,
            comissao
          )
        `)
        .eq('user_id', user.id)
        .not('vendedor_id', 'is', null)
        .gte('created_at', startDate)
        .lte('created_at', endDate);

      if (pedidosVendedoresError) throw pedidosVendedoresError;

      // Processar dados dos vendedores
      const vendedoresMap = new Map<string, VendedorComissao>();
      
      pedidosVendedores?.forEach((pedido: any) => {
        const vendedorId = pedido.vendedor_id;
        const vendedor = pedido.vendedores;
        const valorPedido = pedido.valor_total || 0;
        
        if (vendedoresMap.has(vendedorId)) {
          const existing = vendedoresMap.get(vendedorId)!;
          existing.total_vendas++;
          existing.valor_total_vendas += valorPedido;
          existing.comissao_total = existing.valor_total_vendas * (existing.comissao / 100);
        } else {
          vendedoresMap.set(vendedorId, {
            id: vendedor.id,
            nome: vendedor.nome,
            email: vendedor.email,
            comissao: vendedor.comissao,
            total_vendas: 1,
            valor_total_vendas: valorPedido,
            comissao_total: valorPedido * (vendedor.comissao / 100)
          });
        }
      });

      const vendedoresProcessed = Array.from(vendedoresMap.values());

      // Buscar pedidos com instaladores no período
      const { data: pedidosInstaladores, error: pedidosInstalladoresError } = await supabase
        .from('pedidos')
        .select(`
          id,
          valor_total,
          instalador_id,
          instaladores!inner(
            id,
            nome,
            email,
            comissao
          )
        `)
        .eq('user_id', user.id)
        .not('instalador_id', 'is', null)
        .gte('created_at', startDate)
        .lte('created_at', endDate);

      if (pedidosInstalladoresError) throw pedidosInstalladoresError;

      // Processar dados dos instaladores
      const installadoresMap = new Map<string, InstaladorComissao>();
      
      pedidosInstaladores?.forEach((pedido: any) => {
        const instaladorId = pedido.instalador_id;
        const instalador = pedido.instaladores;
        const valorPedido = pedido.valor_total || 0;
        
        if (installadoresMap.has(instaladorId)) {
          const existing = installadoresMap.get(instaladorId)!;
          existing.total_instalacoes++;
          existing.valor_total_instalacoes += valorPedido;
          existing.comissao_total = existing.valor_total_instalacoes * (existing.comissao / 100);
        } else {
          installadoresMap.set(instaladorId, {
            id: instalador.id,
            nome: instalador.nome,
            email: instalador.email,
            comissao: instalador.comissao,
            total_instalacoes: 1,
            valor_total_instalacoes: valorPedido,
            comissao_total: valorPedido * (instalador.comissao / 100)
          });
        }
      });

      const installadoresProcessed = Array.from(installadoresMap.values());

      // Calcular resumo
      const totalComissoes = vendedoresProcessed.reduce((sum, v) => sum + v.comissao_total, 0) +
                           installadoresProcessed.reduce((sum, i) => sum + i.comissao_total, 0);
      const totalPedidos = vendedoresProcessed.reduce((sum, v) => sum + v.total_vendas, 0) +
                          installadoresProcessed.reduce((sum, i) => sum + i.total_instalacoes, 0);

      setVendedoresComissoes(vendedoresProcessed);
      setInstalladoresComissoes(installadoresProcessed);
      setSummary({
        total_comissoes: totalComissoes,
        total_pedidos: totalPedidos,
        comissao_media: totalPedidos > 0 ? totalComissoes / totalPedidos : 0
      });

    } catch (error: any) {
      toast({
        title: "Erro ao carregar comissões",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getHistoricoComissoes = async (funcionarioId: string, tipo: 'Vendedor' | 'Instalador') => {
    if (!user) return [];

    try {
      const currentDate = new Date();
      const monthsData = [];

      // Buscar dados dos últimos 6 meses
      for (let i = 5; i >= 0; i--) {
        const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
        const startDate = startOfMonth(date).toISOString();
        const endDate = endOfMonth(date).toISOString();

        const monthName = date.toLocaleDateString('pt-BR', { month: 'short' });

        if (tipo === 'Vendedor') {
          const { data } = await supabase
            .from('pedidos')
            .select('valor_total')
            .eq('user_id', user.id)
            .eq('vendedor_id', funcionarioId)
            .gte('created_at', startDate)
            .lte('created_at', endDate);

          const vendedor = await supabase
            .from('vendedores')
            .select('comissao')
            .eq('id', funcionarioId)
            .single();

          const valorTotal = data?.reduce((sum, pedido) => sum + (pedido.valor_total || 0), 0) || 0;
          const comissao = valorTotal * ((vendedor.data?.comissao || 0) / 100);

          monthsData.push({
            month: monthName,
            comissao: comissao
          });
        } else {
          const { data } = await supabase
            .from('pedidos')
            .select('valor_total')
            .eq('user_id', user.id)
            .eq('instalador_id', funcionarioId)
            .gte('created_at', startDate)
            .lte('created_at', endDate);

          const instalador = await supabase
            .from('instaladores')
            .select('comissao')
            .eq('id', funcionarioId)
            .single();

          const valorTotal = data?.reduce((sum, pedido) => sum + (pedido.valor_total || 0), 0) || 0;
          const comissao = valorTotal * ((instalador.data?.comissao || 0) / 100);

          monthsData.push({
            month: monthName,
            comissao: comissao
          });
        }
      }

      return monthsData;
    } catch (error) {
      console.error('Erro ao buscar histórico de comissões:', error);
      return [];
    }
  };

  useEffect(() => {
    if (user) {
      refreshCommissions();
    }
  }, [user, selectedPeriod]);

  return (
    <CommissionsContext.Provider value={{
      vendedoresComissoes,
      installadoresComissoes,
      summary,
      loading,
      selectedPeriod,
      setSelectedPeriod,
      refreshCommissions,
      getHistoricoComissoes
    }}>
      {children}
    </CommissionsContext.Provider>
  );
};

export const useCommissions = () => {
  const context = useContext(CommissionsContext);
  if (context === undefined) {
    throw new Error('useCommissions must be used within a CommissionsProvider');
  }
  return context;
};