import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Edit, MapPin, Car, Trash2, User, Phone, Mail, CreditCard, Palette } from "lucide-react";
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
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => navigate('/pedidos')}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar
          </Button>
          <div>
            <h1 className="text-3xl font-bold">{client.nome}</h1>
            <div className="flex items-center gap-2 mt-1">
              <Phone className="h-4 w-4 text-muted-foreground" />
              <p className="text-lg text-muted-foreground">{client.telefone}</p>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => navigate(`/cliente/${id}/editar`)} className="bg-amber-500 hover:bg-amber-600">
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Dados Pessoais */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Dados Pessoais
              </CardTitle>
              <CardDescription>
                Informações básicas do cliente
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* CPF/CNPJ */}
                {client.cpf_cnpj && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <CreditCard className="h-4 w-4 text-primary" />
                      <Label className="font-medium">CPF/CNPJ</Label>
                    </div>
                    <p className="text-lg font-mono bg-muted p-3 rounded-md">{client.cpf_cnpj}</p>
                  </div>
                )}

                {/* Email */}
                {client.email && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-primary" />
                      <Label className="font-medium">E-mail</Label>
                    </div>
                    <p className="text-lg bg-muted p-3 rounded-md">{client.email}</p>
                  </div>
                )}
              </div>

              {/* Endereço */}
              {client.endereco && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-primary" />
                    <Label className="font-medium">Endereço</Label>
                  </div>
                  <div className="bg-muted p-4 rounded-md">
                    <p className="text-lg leading-relaxed">{client.endereco}</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Veículos */}
        <div className="space-y-6">
          {vehicles.length > 0 ? (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Car className="h-5 w-5" />
                  Veículos
                </CardTitle>
                <CardDescription>
                  Veículos cadastrados para este cliente
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {vehicles.map((vehicle, index) => (
                  <div key={vehicle.id} className="space-y-3">
                    {index > 0 && <Separator />}
                    
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">
                          {vehicle.marca} {vehicle.modelo}
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div>
                          <span className="font-medium text-muted-foreground">Ano:</span>
                          <p className="font-medium">{vehicle.ano}</p>
                        </div>
                        {vehicle.placa && (
                          <div>
                            <span className="font-medium text-muted-foreground">Placa:</span>
                            <p className="font-mono font-medium">{vehicle.placa}</p>
                          </div>
                        )}
                        {vehicle.cor && (
                          <div className="col-span-2">
                            <div className="flex items-center gap-2">
                              <Palette className="h-3 w-3 text-muted-foreground" />
                              <span className="font-medium text-muted-foreground">Cor:</span>
                            </div>
                            <p className="font-medium">{vehicle.cor}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Car className="h-5 w-5" />
                  Veículos
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-6">
                  <Car className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">Nenhum veículo cadastrado</p>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="mt-3"
                    onClick={() => navigate(`/cliente/${id}/editar`)}
                  >
                    Cadastrar Veículo
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}