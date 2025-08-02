import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Edit, MapPin, Car, Calendar, Trash2 } from "lucide-react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useState, useEffect } from "react";

export default function ClientDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [client, setClient] = useState<any>(null);
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      loadClientData();
    }
  }, [id]);

  const loadClientData = async () => {
    try {
      setLoading(true);
      
      // Load client data
      const { data: clientData, error: clientError } = await supabase
        .from('clientes')
        .select('*')
        .eq('id', id)
        .single();

      if (clientError) throw clientError;

      // Load client's vehicles
      const { data: vehiclesData, error: vehiclesError } = await supabase
        .from('veiculos')
        .select('*')
        .eq('cliente_id', id);

      if (vehiclesError) throw vehiclesError;

      setClient(clientData);
      setVehicles(vehiclesData || []);
    } catch (error) {
      console.error('Error loading client data:', error);
      toast({
        title: "Erro ao carregar dados",
        description: "Não foi possível carregar os dados do cliente.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClient = async () => {
    try {
      const { error } = await supabase
        .from('clientes')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Cliente excluído",
        description: "Cliente foi removido com sucesso."
      });

      navigate('/pedidos');
    } catch (error) {
      console.error('Error deleting client:', error);
      toast({
        title: "Erro ao excluir",
        description: "Não foi possível excluir o cliente.",
        variant: "destructive"
      });
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/pedidos')}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar
          </Button>
        </div>
        <Card className="p-8 text-center">
          <p className="text-muted-foreground">Carregando dados do cliente...</p>
        </Card>
      </div>
    );
  }

  if (!client) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/pedidos')}
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
            onClick={() => navigate('/pedidos')}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar
          </Button>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => navigate(`/cliente/${id}/editar`)}>
            <Edit className="h-4 w-4 mr-2" />
            Editar
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive">
                <Trash2 className="h-4 w-4 mr-2" />
                Excluir
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
                <AlertDialogDescription>
                  Tem certeza que deseja excluir o cliente {client.nome}? Esta ação não pode ser desfeita e todos os dados relacionados serão removidos.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction onClick={handleDeleteClient} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                  Excluir
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      {/* Client Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-foreground">{client.nome}</h1>
        <p className="text-xl text-muted-foreground">{client.telefone}</p>
      </div>

      {/* Client Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* CPF/CNPJ */}
        {client.cpf_cnpj && (
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <MapPin className="h-5 w-5 text-primary" />
              <h3 className="font-semibold text-foreground">CPF/CNPJ</h3>
            </div>
            <p className="text-2xl font-medium text-foreground">{client.cpf_cnpj}</p>
          </Card>
        )}

        {/* Email */}
        {client.email && (
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <MapPin className="h-5 w-5 text-primary" />
              <h3 className="font-semibold text-foreground">Email</h3>
            </div>
            <p className="text-lg text-foreground">{client.email}</p>
          </Card>
        )}

        {/* CEP */}
        {client.cep && (
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <MapPin className="h-5 w-5 text-primary" />
              <h3 className="font-semibold text-foreground">CEP</h3>
            </div>
            <p className="text-2xl font-medium text-foreground">{client.cep}</p>
          </Card>
        )}

        {/* Endereço */}
        {client.endereco && (
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <MapPin className="h-5 w-5 text-primary" />
              <h3 className="font-semibold text-foreground">Endereço</h3>
            </div>
            <p className="text-lg text-foreground">
              {client.endereco}
              {client.cidade && `, ${client.cidade}`}
              {client.estado && ` - ${client.estado}`}
            </p>
          </Card>
        )}
      </div>

      {/* Vehicles Section */}
      {vehicles.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-foreground">Veículos</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {vehicles.map(vehicle => (
              <Card key={vehicle.id} className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <Car className="h-5 w-5 text-primary" />
                  <h3 className="font-semibold text-foreground">
                    {vehicle.marca} {vehicle.modelo}
                  </h3>
                </div>
                <div className="space-y-2">
                  <p className="text-foreground"><strong>Ano:</strong> {vehicle.ano}</p>
                  {vehicle.placa && <p className="text-foreground"><strong>Placa:</strong> {vehicle.placa}</p>}
                  {vehicle.cor && <p className="text-foreground"><strong>Cor:</strong> {vehicle.cor}</p>}
                  {vehicle.chassi && <p className="text-foreground"><strong>Chassi:</strong> {vehicle.chassi}</p>}
                  {vehicle.combustivel && <p className="text-foreground"><strong>Combustível:</strong> {vehicle.combustivel}</p>}
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}