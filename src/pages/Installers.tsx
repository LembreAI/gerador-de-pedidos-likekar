import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Plus, Search, Mail, Phone, MoreVertical, MapPin, Calendar } from "lucide-react";

const installers = [
  {
    id: 1,
    nome: "Roberto Silva",
    email: "roberto.silva@email.com",
    telefone: "(11) 99999-1111",
    instalacoes: 45,
    avaliacao: 4.8,
    status: "Disponível",
    regiao: "São Paulo - SP",
    proximaInstalacao: "15/01/2024",
    iniciais: "RS",
  },
  {
    id: 2,
    nome: "Ana Costa",
    email: "ana.costa@email.com",
    telefone: "(11) 88888-2222",
    instalacoes: 32,
    avaliacao: 4.9,
    status: "Ocupado",
    regiao: "Rio de Janeiro - RJ",
    proximaInstalacao: "12/01/2024",
    iniciais: "AC",
  },
  {
    id: 3,
    nome: "José Santos",
    email: "jose.santos@email.com",
    telefone: "(11) 77777-3333",
    instalacoes: 28,
    avaliacao: 4.6,
    status: "Disponível",
    regiao: "Belo Horizonte - MG",
    proximaInstalacao: "18/01/2024",
    iniciais: "JS",
  },
];

const getStatusColor = (status: string) => {
  switch (status) {
    case "Disponível":
      return "bg-green-100 text-green-800 border-green-200";
    case "Ocupado":
      return "bg-red-100 text-red-800 border-red-200";
    case "Férias":
      return "bg-blue-100 text-blue-800 border-blue-200";
    default:
      return "bg-gray-100 text-gray-800 border-gray-200";
  }
};

export default function Installers() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Instaladores</h1>
          <p className="text-muted-foreground">
            Gerencie sua equipe de instalação
          </p>
        </div>
        <Button className="bg-gradient-primary hover:opacity-90">
          <Plus className="h-4 w-4 mr-2" />
          Adicionar Instalador
        </Button>
      </div>

      {/* Search and Filters */}
      <Card className="p-6 bg-gradient-card">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar instaladores..."
              className="pl-10"
            />
          </div>
          <Button variant="outline">Filtrar por região</Button>
          <Button variant="outline">Filtrar por status</Button>
        </div>
      </Card>

      {/* Installers Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {installers.map((installer) => (
          <Card key={installer.id} className="p-6 bg-gradient-card shadow-elegant hover:shadow-glow transition-all duration-300">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <Avatar className="h-14 w-14 bg-primary/10">
                  <AvatarFallback className="text-primary font-semibold text-lg">
                    {installer.iniciais}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-semibold text-lg text-foreground">{installer.nome}</h3>
                  <Badge
                    variant="outline"
                    className={getStatusColor(installer.status)}
                  >
                    {installer.status}
                  </Badge>
                </div>
              </div>
              <Button variant="ghost" size="sm">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </div>

            <div className="space-y-3 mb-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Mail className="h-4 w-4" />
                <span>{installer.email}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Phone className="h-4 w-4" />
                <span>{installer.telefone}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4" />
                <span>{installer.regiao}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="h-4 w-4" />
                <span>Próxima: {installer.proximaInstalacao}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 p-4 bg-accent/30 rounded-lg mb-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-primary">{installer.instalacoes}</p>
                <p className="text-xs text-muted-foreground">Instalações</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-primary">{installer.avaliacao}</p>
                <p className="text-xs text-muted-foreground">Avaliação</p>
              </div>
            </div>

            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="flex-1">
                Editar
              </Button>
              <Button variant="outline" size="sm" className="flex-1">
                Agendar
              </Button>
              <Button variant="outline" size="sm" className="flex-1">
                Histórico
              </Button>
            </div>
          </Card>
        ))}
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        <Card className="p-6 bg-gradient-card shadow-elegant text-center">
          <h3 className="text-2xl font-bold text-primary">3</h3>
          <p className="text-sm text-muted-foreground">Total Instaladores</p>
        </Card>
        <Card className="p-6 bg-gradient-card shadow-elegant text-center">
          <h3 className="text-2xl font-bold text-green-600">2</h3>
          <p className="text-sm text-muted-foreground">Disponíveis</p>
        </Card>
        <Card className="p-6 bg-gradient-card shadow-elegant text-center">
          <h3 className="text-2xl font-bold text-primary">105</h3>
          <p className="text-sm text-muted-foreground">Instalações Total</p>
        </Card>
        <Card className="p-6 bg-gradient-card shadow-elegant text-center">
          <h3 className="text-2xl font-bold text-primary">4.8</h3>
          <p className="text-sm text-muted-foreground">Avaliação Média</p>
        </Card>
      </div>
    </div>
  );
}