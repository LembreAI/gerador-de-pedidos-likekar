import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Plus, Search, Mail, Phone, MoreVertical } from "lucide-react";

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

      {/* Search */}
      <Card className="p-6 border">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar vendedores..."
            className="pl-10"
          />
        </div>
      </Card>

      {/* Vendors Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {vendors.map((vendor) => (
          <Card key={vendor.id} className="p-6 border">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <Avatar className="h-12 w-12 bg-muted">
                  <AvatarFallback className="text-primary font-medium">
                    {vendor.iniciais}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-medium text-foreground">{vendor.nome}</h3>
                  <Badge variant="outline">
                    {vendor.status}
                  </Badge>
                </div>
              </div>
              <Button variant="ghost" size="sm">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Mail className="h-4 w-4" />
                <span>{vendor.email}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Phone className="h-4 w-4" />
                <span>{vendor.telefone}</span>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t">
              <div className="grid grid-cols-2 gap-4 text-center">
                <div>
                  <p className="text-2xl font-medium text-primary">{vendor.vendas}</p>
                  <p className="text-xs text-muted-foreground">Vendas</p>
                </div>
                <div>
                  <p className="text-2xl font-medium text-primary">{vendor.comissao}</p>
                  <p className="text-xs text-muted-foreground">Comissão</p>
                </div>
              </div>
            </div>

            <div className="mt-4 flex gap-2">
              <Button variant="outline" size="sm" className="flex-1">
                Editar
              </Button>
              <Button variant="outline" size="sm" className="flex-1">
                Ver Vendas
              </Button>
            </div>
          </Card>
        ))}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="p-6 border text-center">
          <h3 className="text-2xl font-medium text-primary">3</h3>
          <p className="text-muted-foreground">Total de Vendedores</p>
        </Card>
        <Card className="p-6 border text-center">
          <h3 className="text-2xl font-medium text-primary">2</h3>
          <p className="text-muted-foreground">Ativos</p>
        </Card>
        <Card className="p-6 border text-center">
          <h3 className="text-2xl font-medium text-primary">56</h3>
          <p className="text-muted-foreground">Vendas Total</p>
        </Card>
        <Card className="p-6 border text-center">
          <h3 className="text-2xl font-medium text-primary">7.2%</h3>
          <p className="text-muted-foreground">Comissão Média</p>
        </Card>
      </div>
    </div>
  );
}