import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Plus, Search, Mail, Phone, MoreVertical, Edit, Eye, Filter } from "lucide-react";

const vendors = [
  {
    id: 1,
    nome: "Maria Santos",
    email: "maria.santos@email.com",
    telefone: "(11) 99999-9999",
    vendas: 23,
    comissao: "8%",
    status: "Ativo",
    iniciais: "MS",
  },
  {
    id: 2,
    nome: "Carlos Oliveira",
    email: "carlos.oliveira@email.com",
    telefone: "(11) 88888-8888",
    vendas: 18,
    comissao: "7%",
    status: "Ativo",
    iniciais: "CO",
  },
  {
    id: 3,
    nome: "Pedro Souza",
    email: "pedro.souza@email.com",
    telefone: "(11) 77777-7777",
    vendas: 15,
    comissao: "6%",
    status: "Inativo",
    iniciais: "PS",
  },
];

export default function Vendors() {
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
                {vendors.map((vendor) => (
                  <TableRow key={vendor.id} className="hover:bg-muted/30 border-b">
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
                            {vendor.iniciais}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium text-foreground">{vendor.nome}</p>
                          <p className="text-sm text-muted-foreground">{vendor.email}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{vendor.telefone}</TableCell>
                    <TableCell className="font-medium text-foreground">{vendor.vendas}</TableCell>
                    <TableCell className="font-medium text-primary">{vendor.comissao}</TableCell>
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
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </Card>
    </div>
  );
}