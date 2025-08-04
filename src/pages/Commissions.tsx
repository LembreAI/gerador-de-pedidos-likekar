import { useState } from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import type { DateRange } from "react-day-picker";
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
  const {
    user
  } = useAuth();
  const [selectedFuncionario, setSelectedFuncionario] = useState<FuncionarioComissao | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [chartData, setChartData] = useState<{ month: string; comissao: number }[]>([]);
  const {
    vendedoresComissoes,
    installadoresComissoes,
    summary,
    loading,
    selectedPeriod,
    setSelectedPeriod,
    refreshCommissions,
    getHistoricoComissoes
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
    return name.split(' ').map(word => word.charAt(0).toUpperCase()).slice(0, 2).join('');
  };

  // Combinar vendedores e instaladores numa lista única
  const funcionarios: FuncionarioComissao[] = [...vendedoresComissoes.map(v => ({
    ...v,
    total_trabalhos: v.total_vendas,
    valor_total_trabalhos: v.valor_total_vendas,
    tipo: 'Vendedor' as const
  })), ...installadoresComissoes.map(i => ({
    ...i,
    total_trabalhos: i.total_instalacoes,
    valor_total_trabalhos: i.valor_total_instalacoes,
    tipo: 'Instalador' as const
  }))].sort((a, b) => b.comissao_total - a.comissao_total);

  // Filtrar funcionários baseado na pesquisa
  const filteredFuncionarios = funcionarios.filter(funcionario => funcionario.nome.toLowerCase().includes(searchTerm.toLowerCase()) || funcionario.email.toLowerCase().includes(searchTerm.toLowerCase()) || funcionario.tipo.toLowerCase().includes(searchTerm.toLowerCase()));

  const setSelectedFuncionarioHandler = async (funcionario: FuncionarioComissao | null) => {
    setSelectedFuncionario(funcionario);
    if (funcionario) {
      const data = await getHistoricoComissoes(funcionario.id, funcionario.tipo);
      setChartData(data);
    } else {
      setChartData([]);
    }
  };
  return <div className="space-y-4 sm:space-y-6 p-4 sm:p-6">
      {/* Header */}
      <div className="flex flex-col gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Comissões dos Funcionários</h1>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:gap-2">
          {/* Pesquisa */}
          <div className="relative flex-1 sm:flex-initial">
            <input 
              type="text" 
              placeholder="Pesquisar funcionários..." 
              value={searchTerm} 
              onChange={e => setSearchTerm(e.target.value)} 
              className="w-full sm:w-64 px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring" 
            />
          </div>

          {/* Seletor de Período */}
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className={cn("w-full sm:w-auto justify-start text-left font-normal", !selectedPeriod && "text-muted-foreground")}>
                <CalendarIcon className="mr-2 h-4 w-4 flex-shrink-0" />
                <span className="truncate">
                  {selectedPeriod?.from && selectedPeriod?.to 
                    ? `${format(selectedPeriod.from, "dd/MM/yyyy", { locale: ptBR })} - ${format(selectedPeriod.to, "dd/MM/yyyy", { locale: ptBR })}`
                    : "Selecione o período"
                  }
                </span>
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start" side="bottom">
              <Calendar 
                mode="range" 
                selected={selectedPeriod} 
                onSelect={setSelectedPeriod} 
                numberOfMonths={1}
                initialFocus 
                locale={ptBR}
                className="p-3 pointer-events-auto" 
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>

      {/* Cards de Resumo */}
      

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
          {loading ? <div className="space-y-3">
              {[1, 2, 3, 4, 5].map(i => <Skeleton key={i} className="h-16 w-full" />)}
            </div> : filteredFuncionarios.length === 0 ? <div className="text-center py-8 text-muted-foreground">
              {searchTerm ? 'Nenhum funcionário encontrado para a pesquisa' : 'Nenhuma comissão encontrada para este período'}
            </div> : <div className="space-y-2">
              {filteredFuncionarios.map(funcionario => <div key={`${funcionario.tipo}-${funcionario.id}`} className="flex flex-col sm:flex-row sm:items-center gap-4 p-4 border rounded-lg hover:bg-accent/50 cursor-pointer transition-colors" onClick={() => setSelectedFuncionarioHandler(funcionario)}>
                  <div className="flex items-center gap-3 flex-1">
                    <Avatar className="h-10 w-10 sm:h-12 sm:w-12 flex-shrink-0">
                      <AvatarFallback className="text-xs sm:text-sm font-semibold">
                        {getInitials(funcionario.nome)}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                        <h3 className="font-semibold text-base sm:text-lg truncate">{funcionario.nome}</h3>
                        <Badge variant={funcionario.tipo === 'Vendedor' ? 'default' : 'secondary'} className="text-xs w-fit">
                          {funcionario.tipo}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground truncate">{funcionario.email}</p>
                      <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 mt-1">
                        <span className="text-xs sm:text-sm text-muted-foreground">
                          {funcionario.comissao}% de comissão
                        </span>
                        <span className="text-xs sm:text-sm text-muted-foreground">
                          {funcionario.total_trabalhos} {funcionario.tipo === 'Vendedor' ? 'venda' : 'produto instalado'}{funcionario.total_trabalhos !== 1 ? funcionario.tipo === 'Vendedor' ? 's' : 's' : ''}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:flex-col sm:text-right">
                    <div className="flex flex-col">
                      <div className="text-base sm:text-lg font-bold text-green-600">
                        {formatCurrency(funcionario.comissao_total)}
                      </div>
                      <div className="text-xs sm:text-sm text-muted-foreground">
                        de {formatCurrency(funcionario.valor_total_trabalhos)}
                      </div>
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground flex-shrink-0 sm:mt-1" />
                  </div>
                </div>)}
            </div>}
        </CardContent>
      </Card>

      {/* Dialog com Gráfico Detalhado */}
      <Dialog open={!!selectedFuncionario} onOpenChange={() => setSelectedFuncionarioHandler(null)}>
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
                  <Badge variant={selectedFuncionario?.tipo === 'Vendedor' ? 'default' : 'secondary'} className="text-xs">
                    {selectedFuncionario?.tipo}
                  </Badge>
                </div>
              </div>
            </DialogTitle>
            <DialogDescription>
              Histórico de comissões e performance no período selecionado
            </DialogDescription>
          </DialogHeader>

          {selectedFuncionario && <div className="space-y-6">
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
                      {selectedFuncionario.tipo === 'Vendedor' ? 'Vendas' : 'Produtos Instalados'}
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
                    Histórico mensal de comissões (últimos 6 meses)
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis tickFormatter={value => `R$ ${value.toLocaleString()}`} />
                      <Tooltip formatter={(value: number) => [formatCurrency(value), 'Comissão']} labelFormatter={label => `Mês: ${label}`} />
                      <Line type="monotone" dataKey="comissao" stroke="hsl(var(--primary))" strokeWidth={2} dot={{
                    r: 4
                  }} />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>}
        </DialogContent>
      </Dialog>
    </div>;
}