import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { ArrowLeft, User, Car, Save, Phone, Mail, MapPin, CreditCard } from 'lucide-react';

const ClientEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const [clientData, setClientData] = useState({
    nome: '',
    telefone: '',
    email: '',
    endereco: '',
    cidade: '',
    estado: '',
    cep: '',
    cpf_cnpj: ''
  });

  const [vehicleData, setVehicleData] = useState({
    marca: '',
    modelo: '',
    ano: '',
    placa: '',
    cor: '',
    chassi: '',
    combustivel: ''
  });

  const [vehicleId, setVehicleId] = useState<string>('');

  useEffect(() => {
    loadClientData();
  }, [id]);

  const loadClientData = async () => {
    try {
      setLoading(true);
      
      // Buscar dados do cliente
      const { data: client, error: clientError } = await supabase
        .from('clientes')
        .select('*')
        .eq('id', id)
        .single();

      if (clientError) throw clientError;

      setClientData({
        nome: client.nome || '',
        telefone: client.telefone || '',
        email: client.email || '',
        endereco: client.endereco || '',
        cidade: client.cidade || '',
        estado: client.estado || '',
        cep: client.cep || '',
        cpf_cnpj: client.cpf_cnpj || ''
      });

      // Buscar dados do veículo (sempre pegar o primeiro se existir)
      const { data: vehicles, error: vehicleError } = await supabase
        .from('veiculos')
        .select('*')
        .eq('cliente_id', id)
        .order('created_at', { ascending: false })
        .limit(1);

      const vehicle = vehicles && vehicles.length > 0 ? vehicles[0] : null;

      if (vehicle) {
        setVehicleId(vehicle.id);
        setVehicleData({
          marca: vehicle.marca || '',
          modelo: vehicle.modelo || '',
          ano: vehicle.ano?.toString() || '',
          placa: vehicle.placa || '',
          cor: vehicle.cor || '',
          chassi: vehicle.chassi || '',
          combustivel: vehicle.combustivel || ''
        });
      }

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

  const handleSave = async () => {
    try {
      setSaving(true);

      // Atualizar dados do cliente
      const { error: clientError } = await supabase
        .from('clientes')
        .update(clientData)
        .eq('id', id);

      if (clientError) throw clientError;

      // Atualizar ou criar veículo usando upsert para evitar duplicatas
      if (vehicleData.marca || vehicleData.modelo) {
        const vehiclePayload = {
          ...vehicleData,
          ano: vehicleData.ano ? parseInt(vehicleData.ano) : null,
          cliente_id: id
        };

        if (vehicleId) {
          // Atualizar veículo existente
          const { error: vehicleError } = await supabase
            .from('veiculos')
            .update(vehiclePayload)
            .eq('id', vehicleId);

          if (vehicleError) throw vehicleError;
        } else {
          // Verificar se já existe um veículo para este cliente antes de criar
          const { data: existingVehicle } = await supabase
            .from('veiculos')
            .select('id')
            .eq('cliente_id', id)
            .limit(1);

          if (existingVehicle && existingVehicle.length > 0) {
            // Se já existe, atualizar o existente
            const { error: vehicleError } = await supabase
              .from('veiculos')
              .update(vehiclePayload)
              .eq('id', existingVehicle[0].id);

            if (vehicleError) throw vehicleError;
          } else {
            // Criar novo veículo apenas se não existir nenhum
            const { error: vehicleError } = await supabase
              .from('veiculos')
              .insert(vehiclePayload);

            if (vehicleError) throw vehicleError;
          }
        }
      }

      toast({
        title: "Dados atualizados!",
        description: "As informações do cliente foram salvas com sucesso."
      });

      navigate(`/cliente/${id}`);

    } catch (error) {
      console.error('Error updating client:', error);
      toast({
        title: "Erro ao salvar",
        description: "Não foi possível salvar as alterações.",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center h-40">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Carregando dados...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate(`/cliente/${id}`)}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Editar Cliente</h1>
          <p className="text-muted-foreground">Atualize as informações do cliente e veículo</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Dados do Cliente */}
        <Card className="h-fit">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Dados Pessoais
            </CardTitle>
            <CardDescription>
              Informações básicas do cliente
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="nome" className="flex items-center gap-2">
                <User className="h-4 w-4" />
                Nome Completo
              </Label>
              <Input
                id="nome"
                placeholder="Digite o nome completo"
                value={clientData.nome}
                onChange={(e) => setClientData({ ...clientData, nome: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="telefone" className="flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  Telefone
                </Label>
                <Input
                  id="telefone"
                  placeholder="(00) 00000-0000"
                  value={clientData.telefone}
                  onChange={(e) => setClientData({ ...clientData, telefone: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  E-mail
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="email@exemplo.com"
                  value={clientData.email}
                  onChange={(e) => setClientData({ ...clientData, email: e.target.value })}
                />
              </div>
            </div>

            <Separator />

            <div className="space-y-2">
              <Label htmlFor="endereco" className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                Endereço Completo
              </Label>
              <Input
                id="endereco"
                placeholder="Digite o endereço completo"
                value={clientData.endereco}
                onChange={(e) => setClientData({ ...clientData, endereco: e.target.value })}
              />
            </div>

            <Separator />

            <div className="space-y-2">
              <Label htmlFor="cpf_cnpj" className="flex items-center gap-2">
                <CreditCard className="h-4 w-4" />
                CPF/CNPJ
              </Label>
              <Input
                id="cpf_cnpj"
                placeholder="000.000.000-00"
                value={clientData.cpf_cnpj}
                onChange={(e) => setClientData({ ...clientData, cpf_cnpj: e.target.value })}
              />
            </div>
          </CardContent>
        </Card>

        {/* Dados do Veículo */}
        <Card className="h-fit">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Car className="h-5 w-5" />
              Dados do Veículo
            </CardTitle>
            <CardDescription>
              Informações do veículo do cliente
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="marca">Marca</Label>
                <Input
                  id="marca"
                  placeholder="Ex: Toyota, Honda"
                  value={vehicleData.marca}
                  onChange={(e) => setVehicleData({ ...vehicleData, marca: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="modelo">Modelo</Label>
                <Input
                  id="modelo"
                  placeholder="Ex: Corolla, Civic"
                  value={vehicleData.modelo}
                  onChange={(e) => setVehicleData({ ...vehicleData, modelo: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="ano">Ano</Label>
                <Input
                  id="ano"
                  placeholder="2023"
                  value={vehicleData.ano}
                  onChange={(e) => setVehicleData({ ...vehicleData, ano: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="cor">Cor</Label>
                <Input
                  id="cor"
                  placeholder="Ex: Branco, Prata"
                  value={vehicleData.cor}
                  onChange={(e) => setVehicleData({ ...vehicleData, cor: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="placa">Placa</Label>
                <Input
                  id="placa"
                  placeholder="ABC-1234"
                  value={vehicleData.placa}
                  onChange={(e) => setVehicleData({ ...vehicleData, placa: e.target.value })}
                />
              </div>
            </div>

          </CardContent>
        </Card>
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-4 mt-8">
        <Button
          variant="outline"
          onClick={() => navigate(`/cliente/${id}`)}
          disabled={saving}
        >
          Cancelar
        </Button>
        <Button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2"
        >
          {saving ? (
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
          ) : (
            <Save className="h-4 w-4" />
          )}
          {saving ? 'Salvando...' : 'Salvar Alterações'}
        </Button>
      </div>
    </div>
  );
};

export default ClientEdit;