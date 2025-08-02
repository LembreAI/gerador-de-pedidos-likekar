import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Plus, Search, Phone, Car, MapPin, MoreVertical } from "lucide-react";

const clients = [
  {
    id: 1,
    nome: "João Silva",
    telefone: "(11) 99999-9999",
    carro: "Honda Civic 2020",
    cep: "01310-100",
    email: "joao.silva@email.com",
    endereco: "Av. Paulista, 1000 - Bela Vista, São Paulo - SP",
    dataNascimento: "15/03/1985",
    cpf: "123.456.789-00",
    rg: "12.345.678-9",
    profissao: "Engenheiro",
    observacoes: "Cliente preferencial, sempre pontual nos pagamentos.",
  },
  {
    id: 2,
    nome: "Maria Santos",
    telefone: "(11) 88888-8888",
    carro: "Toyota Corolla 2021",
    cep: "20040-020",
    email: "maria.santos@email.com",
    endereco: "Rua Visconde de Pirajá, 500 - Ipanema, Rio de Janeiro - RJ",
    dataNascimento: "22/07/1990",
    cpf: "987.654.321-00",
    rg: "98.765.432-1",
    profissao: "Arquiteta",
    observacoes: "Cliente há 3 anos, sempre solicita serviços premium.",
  },
  {
    id: 3,
    nome: "Carlos Oliveira",
    telefone: "(11) 77777-7777",
    carro: "Volkswagen Jetta 2019",
    cep: "30112-000",
    email: "carlos.oliveira@email.com",
    endereco: "Av. Afonso Pena, 1500 - Centro, Belo Horizonte - MG",
    dataNascimento: "10/11/1978",
    cpf: "456.789.123-00",
    rg: "45.678.912-3",
    profissao: "Contador",
    observacoes: "Prefere agendamentos pela manhã.",
  },
  {
    id: 4,
    nome: "Ana Costa",
    telefone: "(11) 66666-6666",
    carro: "Hyundai HB20 2022",
    cep: "90010-150",
    email: "ana.costa@email.com",
    endereco: "Rua dos Andradas, 1200 - Centro Histórico, Porto Alegre - RS",
    dataNascimento: "05/09/1995",
    cpf: "789.123.456-00",
    rg: "78.912.345-6",
    profissao: "Designer",
    observacoes: "Gosta de receber lembretes por WhatsApp.",
  },
  {
    id: 5,
    nome: "Pedro Souza",
    telefone: "(11) 55555-5555",
    carro: "Chevrolet Onix 2021",
    cep: "40070-110",
    email: "pedro.souza@email.com",
    endereco: "Rua Chile, 300 - Pelourinho, Salvador - BA",
    dataNascimento: "18/12/1988",
    cpf: "321.654.987-00",
    rg: "32.165.498-7",
    profissao: "Médico",
    observacoes: "Cliente corporativo, faz manutenção mensal.",
  },
];

export default function Clients() {
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();

  // Filter clients based on search term
  const filteredClients = clients.filter((client) =>
    client.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.telefone.includes(searchTerm) ||
    client.carro.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-medium text-foreground">Clientes</h1>
          <p className="text-muted-foreground">
            Gerencie sua base de clientes
          </p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Adicionar Cliente
        </Button>
      </div>

      {/* Search */}
      <Card className="p-6 border">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar clientes por nome, telefone ou carro..."
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </Card>

      {/* Clients Table */}
      <Card className="border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Cliente</TableHead>
              <TableHead>Telefone</TableHead>
              <TableHead>Carro</TableHead>
              <TableHead>CEP</TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredClients.map((client) => (
              <TableRow 
                key={client.id}
                className="cursor-pointer hover:bg-muted/50"
                onClick={() => navigate(`/clientes/${client.id}`)}
              >
                <TableCell>
                  <p className="font-medium text-foreground">{client.nome}</p>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Phone className="h-3 w-3" />
                    <span>{client.telefone}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Car className="h-3 w-3" />
                    <span>{client.carro}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <MapPin className="h-3 w-3" />
                    <span>{client.cep}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={(e) => e.stopPropagation()}
                  >
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      {filteredClients.length === 0 && searchTerm && (
        <Card className="p-8 text-center">
          <p className="text-muted-foreground">
            Nenhum cliente encontrado para "{searchTerm}"
          </p>
        </Card>
      )}
    </div>
  );
}