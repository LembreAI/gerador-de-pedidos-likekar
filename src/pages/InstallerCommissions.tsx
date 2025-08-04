import { useState, useEffect } from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { CalendarIcon, Settings, Package, User, Search, Save } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { Separator } from "@/components/ui/separator";

interface ProductWithInstaller {
  id: string;
  pedido_numero: string;
  cliente_nome: string;
  produto_nome: string;
  produto_valor: number;
  data_pedido: string;
  instalador_id?: string;
  instalador_nome?: string;
  comissao_instalador?: number;
  comissao_calculada: number;
}

interface Instalador {
  id: string;
  nome: string;
  email: string;
  comissao: number;
}

export default function InstallerCommissions() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [products, setProducts] = useState<ProductWithInstaller[]>([]);
  const [installers, setInstallers] = useState<Instalador[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPeriod, setSelectedPeriod] = useState<{ start: string; end: string }>({
    start: format(new Date(new Date().getFullYear(), new Date().getMonth(), 1), 'yyyy-MM-dd'),
    end: format(new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0), 'yyyy-MM-dd')
  });

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const loadData = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      // Carregar instaladores
      const { data: installersData, error: installersError } = await supabase
        .from('instaladores')
        .select('id, nome, email, comissao')
        .eq('user_id', user.id);

      if (installersError) throw installersError;
      setInstallers(installersData || []);

      // Carregar produtos dos pedidos no período
      const { data: productsData, error: productsError } = await supabase
        .from('pedidos')
        .select(`
          id,
          numero,
          valor_total,
          created_at,
          instalador_id,
          clientes!inner(nome),
          instaladores(id, nome, comissao)
        `)
        .eq('user_id', user.id)
        .gte('created_at', selectedPeriod.start + 'T00:00:00')
        .lte('created_at', selectedPeriod.end + 'T23:59:59')
        .order('created_at', { ascending: false });

      if (productsError) throw productsError;

      // Transformar dados para incluir produtos individuais
      const transformedProducts: ProductWithInstaller[] = [];
      
      productsData?.forEach((pedido: any) => {
        // Para este exemplo, vamos considerar cada pedido como um produto
        // Em um sistema real, você teria uma tabela de produtos_pedido
        const instalador = pedido.instaladores;
        transformedProducts.push({
          id: `${pedido.id}-produto`,
          pedido_numero: pedido.numero,
          cliente_nome: pedido.clientes.nome,
          produto_nome: "Produto Principal", // Aqui você pegaria da tabela de produtos
          produto_valor: pedido.valor_total || 0,
          data_pedido: pedido.created_at,
          instalador_id: pedido.instalador_id,
          instalador_nome: instalador?.nome,
          comissao_instalador: instalador?.comissao || 0,
          comissao_calculada: instalador ? (pedido.valor_total || 0) * (instalador.comissao / 100) : 0
        });
      });

      setProducts(transformedProducts);

    } catch (error: any) {
      toast({
        title: "Erro ao carregar dados",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const updateProductInstaller = async (productId: string, installerId: string | undefined) => {
    try {
      const pedidoId = productId.split('-')[0];
      
      const { error } = await supabase
        .from('pedidos')
        .update({ instalador_id: installerId })
        .eq('id', pedidoId);

      if (error) throw error;

      // Atualizar estado local
      setProducts(prev => prev.map(product => {
        if (product.id === productId) {
          const installer = installers.find(i => i.id === installerId);
          return {
            ...product,
            instalador_id: installerId,
            instalador_nome: installer?.nome,
            comissao_instalador: installer?.comissao || 0,
            comissao_calculada: installer ? product.produto_valor * (installer.comissao / 100) : 0
          };
        }
        return product;
      }));

      toast({
        title: "Instalador atualizado",
        description: "A comissão foi recalculada automaticamente.",
      });

    } catch (error: any) {
      toast({
        title: "Erro ao atualizar instalador",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user, selectedPeriod]);

  const filteredProducts = products.filter(product =>
    product.cliente_nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.pedido_numero.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.produto_nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (product.instalador_nome && product.instalador_nome.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const totalCommissions = filteredProducts.reduce((sum, product) => sum + product.comissao_calculada, 0);

  if (!user) {
    window.location.href = '/auth';
    return null;
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Comissões por Produto</h1>
          <p className="text-muted-foreground">
            Gerencie as comissões dos instaladores por produto individualmente
          </p>
        </div>

        {/* Filtros */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Pesquisar por cliente, pedido, produto ou instalador..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <div className="flex gap-2">
            <Input
              type="date"
              value={selectedPeriod.start}
              onChange={(e) => setSelectedPeriod(prev => ({ ...prev, start: e.target.value }))}
              className="w-auto"
            />
            <Input
              type="date"
              value={selectedPeriod.end}
              onChange={(e) => setSelectedPeriod(prev => ({ ...prev, end: e.target.value }))}
              className="w-auto"
            />
          </div>
        </div>
      </div>

      {/* Resumo */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Total de Produtos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{filteredProducts.length}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Total de Comissões</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(totalCommissions)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Produtos com Instalador</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {filteredProducts.filter(p => p.instalador_id).length}
            </div>
            <div className="text-xs text-muted-foreground">
              de {filteredProducts.length} produtos
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Lista de Produtos */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Produtos e Instaladores
          </CardTitle>
          <CardDescription>
            Atribua instaladores específicos para cada produto e visualize as comissões individuais
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map(i => (
                <Skeleton key={i} className="h-20 w-full" />
              ))}
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              {searchTerm ? 'Nenhum produto encontrado para a pesquisa' : 'Nenhum produto encontrado para este período'}
            </div>
          ) : (
            <div className="space-y-3">
              {filteredProducts.map((product) => (
                <div key={product.id} className="flex flex-col lg:flex-row lg:items-center gap-4 p-4 border rounded-lg hover:bg-accent/50 transition-colors">
                  {/* Informações do Produto */}
                  <div className="flex-1 space-y-2">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                      <h3 className="font-semibold">{product.produto_nome}</h3>
                      <Badge variant="outline">Pedido #{product.pedido_numero}</Badge>
                    </div>
                    
                    <div className="text-sm text-muted-foreground space-y-1">
                      <div>Cliente: {product.cliente_nome}</div>
                      <div>Data: {format(new Date(product.data_pedido), 'dd/MM/yyyy', { locale: ptBR })}</div>
                      <div className="font-medium text-foreground">
                        Valor: {formatCurrency(product.produto_valor)}
                      </div>
                    </div>
                  </div>

                  <Separator orientation="vertical" className="hidden lg:block h-16" />

                  {/* Seleção de Instalador */}
                  <div className="flex flex-col sm:flex-row sm:items-center gap-3 lg:w-80">
                    <div className="flex-1">
                      <label className="text-sm font-medium mb-1 block">Instalador</label>
                      <Select
                        value={product.instalador_id || ""}
                        onValueChange={(value) => updateProductInstaller(product.id, value || undefined)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecionar instalador" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="">Nenhum instalador</SelectItem>
                          {installers.map((installer) => (
                            <SelectItem key={installer.id} value={installer.id}>
                              {installer.nome} ({installer.comissao}%)
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Comissão Calculada */}
                    <div className="text-center sm:text-right">
                      <div className="text-sm text-muted-foreground">Comissão</div>
                      <div className="text-lg font-bold text-green-600">
                        {formatCurrency(product.comissao_calculada)}
                      </div>
                      {product.comissao_instalador > 0 && (
                        <div className="text-xs text-muted-foreground">
                          {product.comissao_instalador}%
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}