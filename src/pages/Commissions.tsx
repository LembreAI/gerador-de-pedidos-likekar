import { useState } from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { CalendarIcon, DollarSign, TrendingUp, FileText, Users } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useCommissions } from "@/contexts/CommissionsContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

export default function Commissions() {
  const { user } = useAuth();
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

  // Dados para o gráfico
  const chartData = [
    ...vendedoresComissoes.map(v => ({
      nome: v.nome,
      comissao: v.comissao_total,
      tipo: 'Vendedor'
    })),
    ...installadoresComissoes.map(i => ({
      nome: i.nome,
      comissao: i.comissao_total,
      tipo: 'Instalador'
    }))
  ].sort((a, b) => b.comissao - a.comissao).slice(0, 10);

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

      {/* Gráfico de Comissões */}
      {!loading && chartData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Top 10 - Comissões por Funcionário</CardTitle>
            <CardDescription>
              Ranking dos funcionários com maiores comissões no período
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="nome" 
                  angle={-45}
                  textAnchor="end"
                  height={80}
                  fontSize={12}
                />
                <YAxis 
                  tickFormatter={(value) => `R$ ${value.toLocaleString()}`}
                  fontSize={12}
                />
                <Tooltip 
                  formatter={(value: number) => [formatCurrency(value), 'Comissão']}
                  labelFormatter={(label) => `Funcionário: ${label}`}
                />
                <Bar dataKey="comissao" fill="hsl(var(--primary))" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Tabelas */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Tabela de Vendedores */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Comissões - Vendedores
            </CardTitle>
            <CardDescription>
              Comissões baseadas nas vendas realizadas
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : vendedoresComissoes.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                Nenhuma comissão de vendedor encontrada para este período
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Vendedor</TableHead>
                    <TableHead className="text-center">Vendas</TableHead>
                    <TableHead className="text-right">Comissão</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {vendedoresComissoes.map((vendedor) => (
                    <TableRow key={vendedor.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarFallback className="text-xs">
                              {getInitials(vendedor.nome)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium">{vendedor.nome}</div>
                            <div className="text-sm text-muted-foreground">
                              {vendedor.comissao}% de comissão
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge variant="secondary">
                          {vendedor.total_vendas} venda{vendedor.total_vendas !== 1 ? 's' : ''}
                        </Badge>
                        <div className="text-sm text-muted-foreground mt-1">
                          {formatCurrency(vendedor.valor_total_vendas)}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="font-bold text-green-600">
                          {formatCurrency(vendedor.comissao_total)}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Tabela de Instaladores */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Comissões - Instaladores
            </CardTitle>
            <CardDescription>
              Comissões baseadas nas instalações realizadas
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : installadoresComissoes.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                Nenhuma comissão de instalador encontrada para este período
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Instalador</TableHead>
                    <TableHead className="text-center">Instalações</TableHead>
                    <TableHead className="text-right">Comissão</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {installadoresComissoes.map((instalador) => (
                    <TableRow key={instalador.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarFallback className="text-xs">
                              {getInitials(instalador.nome)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium">{instalador.nome}</div>
                            <div className="text-sm text-muted-foreground">
                              {instalador.comissao}% de comissão
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge variant="secondary">
                          {instalador.total_instalacoes} instalação{instalador.total_instalacoes !== 1 ? 'ões' : ''}
                        </Badge>
                        <div className="text-sm text-muted-foreground mt-1">
                          {formatCurrency(instalador.valor_total_instalacoes)}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="font-bold text-green-600">
                          {formatCurrency(instalador.comissao_total)}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}