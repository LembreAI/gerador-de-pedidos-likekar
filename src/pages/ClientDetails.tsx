import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Edit, MapPin, Car, Calendar } from "lucide-react";

const clients = [
  {
    id: 1,
    nome: "João Silva",
    telefone: "(11) 99999-9999",
    carro: "Honda Civic 2020",
    cep: "01310-100",
    endereco: "Av. Paulista, 1000 - Bela Vista, São Paulo - SP",
    dataNascimento: "15/03/1985",
  },
  {
    id: 2,
    nome: "Maria Santos",
    telefone: "(11) 88888-8888",
    carro: "Toyota Corolla 2021",
    cep: "20040-020",
    endereco: "Rua Visconde de Pirajá, 500 - Ipanema, Rio de Janeiro - RJ",
    dataNascimento: "22/07/1990",
  },
  {
    id: 3,
    nome: "Carlos Oliveira",
    telefone: "(11) 77777-7777",
    carro: "Volkswagen Jetta 2019",
    cep: "30112-000",
    endereco: "Av. Afonso Pena, 1500 - Centro, Belo Horizonte - MG",
    dataNascimento: "10/11/1978",
  },
  {
    id: 4,
    nome: "Ana Costa",
    telefone: "(11) 66666-6666",
    carro: "Hyundai HB20 2022",
    cep: "90010-150",
    endereco: "Rua dos Andradas, 1200 - Centro Histórico, Porto Alegre - RS",
    dataNascimento: "05/09/1995",
  },
  {
    id: 5,
    nome: "Pedro Souza",
    telefone: "(11) 55555-5555",
    carro: "Chevrolet Onix 2021",
    cep: "40070-110",
    endereco: "Rua Chile, 300 - Pelourinho, Salvador - BA",
    dataNascimento: "18/12/1988",
  },
];

export default function ClientDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const client = clients.find(c => c.id === parseInt(id || ''));

  if (!client) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/clientes')}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar
          </Button>
        </div>
        <Card className="p-8 text-center">
          <p className="text-muted-foreground">Cliente não encontrado</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Back Button */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/clientes')}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar
          </Button>
        </div>
        <Button>
          <Edit className="h-4 w-4 mr-2" />
          Editar
        </Button>
      </div>

      {/* Client Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-foreground">{client.nome}</h1>
        <p className="text-xl text-muted-foreground">{client.telefone}</p>
      </div>

      {/* Client Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* CEP */}
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <MapPin className="h-5 w-5 text-primary" />
            <h3 className="font-semibold text-foreground">CEP</h3>
          </div>
          <p className="text-2xl font-medium text-foreground">{client.cep}</p>
        </Card>

        {/* Endereço */}
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <MapPin className="h-5 w-5 text-primary" />
            <h3 className="font-semibold text-foreground">Endereço</h3>
          </div>
          <p className="text-lg text-foreground">{client.endereco}</p>
        </Card>

        {/* Veículo */}
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <Car className="h-5 w-5 text-primary" />
            <h3 className="font-semibold text-foreground">Veículo</h3>
          </div>
          <p className="text-2xl font-medium text-foreground">{client.carro}</p>
        </Card>

        {/* Data de Nascimento */}
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <Calendar className="h-5 w-5 text-primary" />
            <h3 className="font-semibold text-foreground">Data de Nascimento</h3>
          </div>
          <p className="text-2xl font-medium text-foreground">{client.dataNascimento}</p>
        </Card>
      </div>
    </div>
  );
}