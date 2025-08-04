import { useState } from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { CalendarIcon, DollarSign, TrendingUp, FileText, Users, ChevronRight } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useCommissions, VendedorComissao, InstaladorComissao } from "@/contexts/CommissionsContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from "recharts";

// Tipo unificado para funcionários
interface FuncionarioComissao {
  id: string;
  nome: string;
  email: string;
  comissao: number;
  total_trabalhos: number;
  valor_total_trabalhos: number;
  comissao_total: number;
  tipo: 'Vendedor' | 'Instalador';
}

export default function Commissions() {
  const { user } = useAuth();
  const [selectedFuncionario, setSelectedFuncionario] = useState<FuncionarioComissao | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const {
    vendedoresComissoes,
    installadoresComissoes,
    summary,
    loading,
    selectedPeriod,
    setSelectedPeriod,
    refreshCommissions
  } = useCommissions();

  if (!user) {
    window.location.href = '/auth';
    return null;
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0).toUpperCase())
      .slice(0, 2)
      .join('');
  };

  // Combinar vendedores e instaladores numa lista única
  const funcionarios: FuncionarioComissao[] = [
    ...vendedoresComissoes.map(v => ({
      ...v,
      total_trabalhos: v.total_vendas,
      valor_total_trabalhos: v.valor_total_vendas,
      tipo: 'Vendedor' as const
    })),
    ...installadoresComissoes.map(i => ({
      ...i,
      total_trabalhos: i.total_instalacoes,
      valor_total_trabalhos: i.valor_total_instalacoes,
      tipo: 'Instalador' as const
    }))
  ].sort((a, b) => b.comissao_total - a.comissao_total);

  // Filtrar funcionários baseado na pesquisa
  const filteredFuncionarios = funcionarios.filter(funcionario =>
    funcionario.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    funcionario.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    funcionario.tipo.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Gerar dados do gráfico para o funcionário selecionado (simulado por mês)
  const generateChartData = (funcionario: FuncionarioComissao) => {
    // Simulando dados mensais (em uma implementação real, você buscaria do backend)
    const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun'];
    return months.map(month => ({
      mes: month,
      comissao: Math.random() * funcionario.comissao_total * 0.3 + funcionario.comissao_total * 0.1,
      trabalhos: Math.floor(Math.random() * funcionario.total_trabalhos * 0.4) + 1
    }));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Comissões dos Funcionários</h1>
          <p className="text-muted-foreground">
            Visualize as comissões de vendedores e instaladores baseadas nos pedidos
          </p>
        </div>

        <div className="flex gap-2">
          {/* Pesquisa */}
          <div className="relative">
            <input
              type="text"
              placeholder="Pesquisar funcionários..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring w-64"
            />
          </div>

          {/* Seletor de Período */}
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-[240px] justify-start text-left font-normal",
                  !selectedPeriod && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {selectedPeriod ? (
                  format(selectedPeriod, "MMMM 'de' yyyy", { locale: ptBR })
                ) : (
                  <span>Selecione o período</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={selectedPeriod}
                onSelect={(date) => date && setSelectedPeriod(date)}
                initialFocus
                className="p-3 pointer-events-auto"
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>

      {/* Cards de Resumo */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Comissões</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-8 w-24" />
            ) : (
              <>
                <div className="text-2xl font-bold">{formatCurrency(summary.total_comissoes)}</div>
                <p className="text-xs text-muted-foreground">
                  Para o período selecionado
                </p>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pedidos com Comissão</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <>
                <div className="text-2xl font-bold">{summary.total_pedidos}</div>
                <p className="text-xs text-muted-foreground">
                  Pedidos que geraram comissões
                </p>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Comissão Média</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-8 w-20" />
            ) : (
              <>
                <div className="text-2xl font-bold">{formatCurrency(summary.comissao_media)}</div>
                <p className="text-xs text-muted-foreground">
                  Por pedido
                </p>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Lista de Funcionários */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Funcionários com Comissões
          </CardTitle>
          <CardDescription>
            Clique em um funcionário para ver o gráfico detalhado das comissões
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : filteredFuncionarios.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              {searchTerm ? 'Nenhum funcionário encontrado para a pesquisa' : 'Nenhuma comissão encontrada para este período'}
            </div>
          ) : (
            <div className="space-y-2">
              {filteredFuncionarios.map((funcionario) => (
                <div
                  key={`${funcionario.tipo}-${funcionario.id}`}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 cursor-pointer transition-colors"
                  onClick={() => setSelectedFuncionario(funcionario)}
                >
                  <div className="flex items-center gap-4">
                    <Avatar className="h-12 w-12">
                      <AvatarFallback className="text-sm font-semibold">
                        {getInitials(funcionario.nome)}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-lg">{funcionario.nome}</h3>
                        <Badge 
                          variant={funcionario.tipo === 'Vendedor' ? 'default' : 'secondary'}
                          className="text-xs"
                        >
                          {funcionario.tipo}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{funcionario.email}</p>
                      <div className="flex items-center gap-4 mt-1">
                        <span className="text-sm text-muted-foreground">
                          {funcionario.comissao}% de comissão
                        </span>
                        <span className="text-sm text-muted-foreground">
                          {funcionario.total_trabalhos} {funcionario.tipo === 'Vendedor' ? 'venda' : 'instalação'}{funcionario.total_trabalhos !== 1 ? (funcionario.tipo === 'Vendedor' ? 's' : 'ões') : ''}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-lg font-bold text-green-600">
                      {formatCurrency(funcionario.comissao_total)}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      de {formatCurrency(funcionario.valor_total_trabalhos)}
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground mt-1 mx-auto" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialog com Gráfico Detalhado */}
      <Dialog open={!!selectedFuncionario} onOpenChange={() => setSelectedFuncionario(null)}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              <Avatar className="h-10 w-10">
                <AvatarFallback>
                  {selectedFuncionario ? getInitials(selectedFuncionario.nome) : ''}
                </AvatarFallback>
              </Avatar>
              <div>
                <div className="flex items-center gap-2">
                  {selectedFuncionario?.nome}
                  <Badge 
                    variant={selectedFuncionario?.tipo === 'Vendedor' ? 'default' : 'secondary'}
                    className="text-xs"
                  >
                    {selectedFuncionario?.tipo}
                  </Badge>
                </div>
              </div>
            </DialogTitle>
            <DialogDescription>
              Histórico de comissões e performance no período selecionado
            </DialogDescription>
          </DialogHeader>

          {selectedFuncionario && (
            <div className="space-y-6">
              {/* Cards de Resumo do Funcionário */}
              <div className="grid gap-4 md:grid-cols-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Total de Comissões</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-green-600">
                      {formatCurrency(selectedFuncionario.comissao_total)}
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">% Comissão</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {selectedFuncionario.comissao}%
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">
                      {selectedFuncionario.tipo === 'Vendedor' ? 'Vendas' : 'Instalações'}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {selectedFuncionario.total_trabalhos}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Valor Total</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {formatCurrency(selectedFuncionario.valor_total_trabalhos)}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Gráfico de Comissões por Mês */}
              <Card>
                <CardHeader>
                  <CardTitle>Evolução das Comissões</CardTitle>
                  <CardDescription>
                    Histórico mensal de comissões (dados simulados)
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={generateChartData(selectedFuncionario)}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="mes" />
                      <YAxis tickFormatter={(value) => `R$ ${value.toLocaleString()}`} />
                      <Tooltip 
                        formatter={(value: number) => [formatCurrency(value), 'Comissão']}
                        labelFormatter={(label) => `Mês: ${label}`}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="comissao" 
                        stroke="hsl(var(--primary))" 
                        strokeWidth={2}
                        dot={{ r: 4 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}