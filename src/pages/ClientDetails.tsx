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
  const {
    id
  } = useParams();
  const navigate = useNavigate();
  const {
    toast
  } = useToast();
  const [client, setClient] = useState<any>(null);
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
    if (id) {
      loadClientData();
    }
  }, [id]);
  const loadClientData = async () => {
    try {
      setLoading(true);

      // Load client data
      const {
        data: clientData,
        error: clientError
      } = await supabase.from('clientes').select('*').eq('id', id).single();
      if (clientError) throw clientError;

      // Load client's vehicles
      const {
        data: vehiclesData,
        error: vehiclesError
      } = await supabase.from('veiculos').select('*').eq('cliente_id', id);
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

  // SEO: título e descrição
  useEffect(() => {
    if (!mounted) return;
    const titleBase = client?.nome ? `Cliente: ${client.nome} | Detalhes` : 'Detalhes do Cliente';
    document.title = `${titleBase} — Sistema`;

    // Meta description
    const desc = client?.email || client?.telefone || 'Detalhes do cliente e seus veículos';
    let meta = document.querySelector('meta[name="description"]') as HTMLMetaElement | null;
    if (!meta) {
      meta = document.createElement('meta');
      meta.name = 'description';
      document.head.appendChild(meta);
    }
    meta.content = `${titleBase}. ${desc}`;

    // Canonical
    let link = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    if (!link) {
      link = document.createElement('link');
      link.rel = 'canonical';
      document.head.appendChild(link);
    }
    link.href = window.location.href;
  }, [client, mounted]);
  const handleDeleteClient = async () => {
    try {
      const {
        error
      } = await supabase.from('clientes').delete().eq('id', id);
      if (error) throw error;
      toast({
        title: "Cliente excluído",
        description: "Cliente foi removido com sucesso."
      });
      navigate('/clientes');
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
    return <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => navigate('/clientes')} className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            Voltar
          </Button>
        </div>
        <Card className="p-8 text-center">
          <p className="text-muted-foreground">Carregando dados do cliente...</p>
        </Card>
      </div>;
  }
  if (!client) {
    return <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => navigate('/clientes')} className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            Voltar
          </Button>
        </div>
        <Card className="p-8 text-center">
          <p className="text-muted-foreground">Cliente não encontrado</p>
        </Card>
      </div>;
  }
  return <div className="space-y-6">
      {/* Modern Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => navigate('/clientes')} className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            Voltar
          </Button>
          <div>
            <h1 className="text-2xl font-semibold text-foreground">{client.nome}</h1>
            
          </div>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => navigate(`/cliente/${id}/editar`)} className="bg-primary text-primary-foreground hover:bg-primary/90">
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
        {/* Dados Pessoais - Card Principal */}
        <div className="lg:col-span-2">
          <Card className="border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5 text-primary" />
                Dados Pessoais
              </CardTitle>
              <CardDescription>
                Informações básicas do cliente
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Grid de Informações Pessoais */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Telefone */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-primary" />
                    <Label className="font-medium">Telefone</Label>
                  </div>
                  <div className="bg-muted/30 p-3 rounded-md">
                    <p className="font-medium">{client.telefone}</p>
                  </div>
                </div>

                {/* Email */}
                {client.email && <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-primary" />
                      <Label className="font-medium">E-mail</Label>
                    </div>
                    <div className="bg-muted/30 p-3 rounded-md">
                      <p className="font-medium break-all">{client.email}</p>
                    </div>
                  </div>}

                {/* CPF/CNPJ */}
                {client.cpf_cnpj && <div className="space-y-2 md:col-span-2">
                    <div className="flex items-center gap-2">
                      <CreditCard className="h-4 w-4 text-primary" />
                      <Label className="font-medium">CPF/CNPJ</Label>
                    </div>
                    <div className="bg-muted/30 p-3 rounded-md">
                      <p className="font-mono font-medium break-all">{client.cpf_cnpj}</p>
                    </div>
                  </div>}
              </div>

              {/* Endereço - Seção Separada */}
              {client.endereco && <>
                  <Separator />
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-primary" />
                      <Label className="font-medium">Endereço</Label>
                    </div>
                    <div className="bg-muted/30 p-4 rounded-md">
                      <p className="leading-relaxed">{client.endereco}</p>
                    </div>
                  </div>
                </>}
            </CardContent>
          </Card>
        </div>

        {/* Veículos - Cards Individuais */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-4">
            <Car className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-medium">Veículos</h2>
          </div>
          
          {vehicles.length > 0 ? vehicles.map(vehicle => <Card key={vehicle.id} className="border">
                <CardContent className="p-4">
                  <div className="space-y-3">
                    {/* Header do Veículo */}
                    <div className="flex items-center gap-2">
                      <Badge className="bg-primary text-primary-foreground">
                        {vehicle.marca}
                      </Badge>
                      <Badge variant="secondary">
                        {vehicle.modelo}
                      </Badge>
                    </div>

                    {/* Especificações do Veículo */}
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <span className="text-muted-foreground">Ano</span>
                        <p className="font-medium">{vehicle.ano}</p>
                      </div>
                      
                      {vehicle.placa && <div>
                          <span className="text-muted-foreground">Placa</span>
                          <p className="font-mono font-medium">{vehicle.placa}</p>
                        </div>}
                      
                      {vehicle.cor && <div className="col-span-2">
                          <div className="flex items-center gap-1">
                            <Palette className="h-3 w-3 text-muted-foreground" />
                            <span className="text-muted-foreground">Cor</span>
                          </div>
                          <p className="font-medium">{vehicle.cor}</p>
                        </div>}
                    </div>
                  </div>
                </CardContent>
              </Card>) : <Card className="border">
              <CardContent className="p-6 text-center">
                <Car className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground mb-4">
                  Nenhum veículo cadastrado
                </p>
                <Button variant="outline" size="sm" onClick={() => navigate(`/cliente/${id}/editar`)}>
                  Cadastrar Veículo
                </Button>
              </CardContent>
            </Card>}
        </div>
      </div>
    </div>;
}