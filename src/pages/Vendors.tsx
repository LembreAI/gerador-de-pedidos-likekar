import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Plus, Search, MoreVertical, Edit, Eye, Filter, Loader2 } from "lucide-react";
import { useVendedores } from "@/contexts/VendedoresContext";
import { useAuth } from "@/contexts/AuthContext";
import { useState } from "react";

export default function Vendors() {
  const { vendedores, loading } = useVendedores();
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");

  const filteredVendedores = vendedores.filter(vendedor =>
    vendedor.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    vendedor.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getInitials = (nome: string) => {
    return nome.split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Faça login para ver os vendedores</p>
      </div>
    );
  }
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Vendedores</h1>
          <p className="text-muted-foreground">
            Gerencie sua equipe de vendas
          </p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Adicionar Vendedor
        </Button>
      </div>

      {/* Search and Filters */}
      <Card className="p-6 border">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar vendedores..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button variant="outline" className="flex items-center gap-2">
            <Filter className="h-4 w-4" />
            Filtrar
          </Button>
        </div>
      </Card>

      {/* Vendors Table */}
      <Card className="border">
        <div className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-b bg-muted/30">
                  <TableHead className="w-12"></TableHead>
                  <TableHead className="font-medium text-muted-foreground">Vendedor</TableHead>
                  <TableHead className="font-medium text-muted-foreground">Contato</TableHead>
                  <TableHead className="font-medium text-muted-foreground">Vendas</TableHead>
                  <TableHead className="font-medium text-muted-foreground">Comissão</TableHead>
                  <TableHead className="text-right font-medium text-muted-foreground">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  // Loading skeleton
                  Array.from({ length: 3 }).map((_, index) => (
                    <TableRow key={index}>
                      <TableCell className="w-12">
                        <Skeleton className="h-4 w-4" />
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Skeleton className="h-10 w-10 rounded-full" />
                          <div>
                            <Skeleton className="h-4 w-32 mb-2" />
                            <Skeleton className="h-3 w-48" />
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-4 w-24" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-4 w-8" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-4 w-12" />
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Skeleton className="h-8 w-8" />
                          <Skeleton className="h-8 w-8" />
                          <Skeleton className="h-8 w-8" />
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : filteredVendedores.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      <p className="text-muted-foreground">
                        {searchTerm ? "Nenhum vendedor encontrado" : "Nenhum vendedor cadastrado"}
                      </p>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredVendedores.map((vendedor) => (
                    <TableRow key={vendedor.id} className="hover:bg-muted/30 border-b">
                      <TableCell className="w-12">
                        <input 
                          type="checkbox" 
                          className="w-4 h-4 rounded border border-input bg-background"
                        />
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-10 w-10 bg-muted">
                            <AvatarFallback className="text-primary font-medium text-sm">
                              {getInitials(vendedor.nome)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium text-foreground">{vendedor.nome}</p>
                            <p className="text-sm text-muted-foreground">{vendedor.email}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground">{vendedor.telefone || "-"}</TableCell>
                      <TableCell className="font-medium text-foreground">{vendedor.vendas_total}</TableCell>
                      <TableCell className="font-medium text-primary">{vendedor.comissao}%</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0" title="Ver vendas">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0" title="Editar">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0" title="Mais opções">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </Card>
    </div>
  );
}