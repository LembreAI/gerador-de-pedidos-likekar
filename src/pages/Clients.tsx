import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Search, Eye, Edit, Trash2, Plus, Phone, Car, MapPin, Mail, ClipboardList } from "lucide-react";
import { useClientes } from "@/contexts/ClientesContext";
import { useToast } from "@/hooks/use-toast";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { VehicleSelectionModal } from "@/components/checklist/VehicleSelectionModal";
import { ChecklistModal } from "@/components/checklist/ChecklistModal";
import { supabase } from "@/integrations/supabase/client";

export default function Clients() {
  const {
    clientes,
    loading,
    deleteCliente,
    reloadClientes
  } = useClientes();
  const {
    toast
  } = useToast();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [localLoading, setLocalLoading] = useState(loading);
  const [vehicleSelectionOpen, setVehicleSelectionOpen] = useState(false);
  const [checklistModalOpen, setChecklistModalOpen] = useState(false);
  const [selectedClienteId, setSelectedClienteId] = useState<string>("");
  const [selectedClienteNome, setSelectedClienteNome] = useState<string>("");
  const [selectedVeiculoId, setSelectedVeiculoId] = useState<string>("");
  const [checklistCompleted, setChecklistCompleted] = useState<Record<string, boolean>>({});

  // Sincronizar estado de loading local
  useEffect(() => {
    setLocalLoading(loading);
  }, [loading]);

  // Recarregar clientes quando a página carregar
  useEffect(() => {
    console.log('🔄 Clients.tsx: Página de clientes carregada, forçando reload...');
    if (clientes.length === 0) {
      reloadClientes();
    }
  }, []);

  // Carregar status dos checklists
  useEffect(() => {
    loadChecklistStatus();
  }, [clientes]);

  const loadChecklistStatus = async () => {
    if (clientes.length === 0) return;

    // Pegar todos os veículos dos clientes
    const allVeiculoIds: string[] = [];
    clientes.forEach(cliente => {
      if (cliente.veiculo?.id) {
        allVeiculoIds.push(cliente.veiculo.id);
      }
    });

    if (allVeiculoIds.length === 0) return;

    try {
      const { data, error } = await supabase
        .from('checklist_veiculo')
        .select('veiculo_id')
        .in('veiculo_id', allVeiculoIds);

      if (error) throw error;

      const completedChecklists: Record<string, boolean> = {};
      data?.forEach(item => {
        completedChecklists[item.veiculo_id] = true;
      });

      setChecklistCompleted(completedChecklists);
    } catch (error) {
      console.error('Erro ao carregar status dos checklists:', error);
    }
  };

  const handleOpenChecklist = (clienteId: string, clienteNome: string) => {
    setSelectedClienteId(clienteId);
    setSelectedClienteNome(clienteNome);
    setVehicleSelectionOpen(true);
  };

  const handleVehicleSelected = (veiculoId: string) => {
    setSelectedVeiculoId(veiculoId);
    setChecklistModalOpen(true);
  };

  const handleChecklistSaved = () => {
    loadChecklistStatus();
    toast({
      title: "Sucesso",
      description: "Checklist salvo com sucesso!"
    });
  };

  const hasChecklistCompleted = (clienteId: string) => {
    const cliente = clientes.find(c => c.id === clienteId);
    return cliente?.veiculo?.id ? checklistCompleted[cliente.veiculo.id] : false;
  };

  const filteredClientes = clientes.filter(cliente => 
    cliente.nome?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    cliente.telefone?.includes(searchTerm) ||
    cliente.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    `${cliente.veiculo?.marca || ''} ${cliente.veiculo?.modelo || ''}`.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDeleteCliente = async (clienteId: string) => {
    try {
      await deleteCliente(clienteId);
      toast({
        title: "Cliente excluído",
        description: "O cliente foi removido com sucesso."
      });
    } catch (error) {
      toast({
        title: "Erro ao excluir",
        description: "Ocorreu um erro ao excluir o cliente.",
        variant: "destructive"
      });
    }
  };

  console.log('📊 Clients.tsx: Estado atual dos clientes:', { clientes, loading, localLoading, clientesLength: clientes.length });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Clientes</h1>
          <p className="text-muted-foreground">
            Gerencie todos os clientes cadastrados
          </p>
        </div>
        <Button onClick={() => navigate('/cliente/novo')}>
          <Plus className="h-4 w-4 mr-2" />
          Adicionar Cliente
        </Button>
      </div>

      {/* Filters */}
      <Card className="p-6 border">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Buscar por cliente, telefone, email ou veículo..." 
              className="pl-10" 
              value={searchTerm} 
              onChange={e => setSearchTerm(e.target.value)} 
            />
          </div>
        </div>
      </Card>

      {/* Clients Table */}
      <Card className="border">
        <div className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-b bg-muted/30">
                  <TableHead className="w-12"></TableHead>
                  <TableHead className="font-medium text-muted-foreground">Nome</TableHead>
                  <TableHead className="font-medium text-muted-foreground">Telefone</TableHead>
                  <TableHead className="font-medium text-muted-foreground">Email</TableHead>
                  <TableHead className="font-medium text-muted-foreground">Veículo</TableHead>
                  <TableHead className="text-right font-medium text-muted-foreground">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {localLoading && clientes.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      Carregando clientes...
                    </TableCell>
                  </TableRow>
                ) : filteredClientes.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      {clientes.length === 0 ? "Nenhum cliente encontrado" : "Nenhum resultado para a busca"}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredClientes.map(cliente => (
                    <TableRow key={cliente.id} className="hover:bg-muted/30 border-b">
                      <TableCell className="w-12">
                        <input type="checkbox" className="w-4 h-4 rounded border border-input bg-background" />
                      </TableCell>
                      <TableCell className="font-medium text-foreground">{cliente.nome}</TableCell>
                      <TableCell className="text-muted-foreground">
                        <div className="flex items-center gap-2">
                          <Phone className="h-4 w-4" />
                          {cliente.telefone || 'N/A'}
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        <div className="flex items-center gap-2">
                          <Mail className="h-4 w-4" />
                          {cliente.email || 'N/A'}
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        <div className="flex items-center gap-2">
                          <Car className="h-4 w-4" />
                          {cliente.veiculo ? `${cliente.veiculo.marca} ${cliente.veiculo.modelo} ${cliente.veiculo.ano}` : 'N/A'}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-8 w-8 p-0" 
                            title="Checklist do veículo"
                            onClick={() => handleOpenChecklist(cliente.id, cliente.nome)}
                          >
                            <ClipboardList 
                              className={`h-4 w-4 ${
                                hasChecklistCompleted(cliente.id) 
                                  ? 'text-yellow-600' 
                                  : 'text-foreground'
                              }`} 
                            />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-8 w-8 p-0" 
                            title="Ver detalhes"
                            onClick={() => navigate(`/cliente/${cliente.id}`)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-8 w-8 p-0" 
                            title="Editar cliente"
                            onClick={() => navigate(`/cliente/${cliente.id}/editar`)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-destructive" title="Excluir">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Tem certeza que deseja excluir o cliente {cliente.nome}? Esta ação também removerá todos os veículos associados e não pode ser desfeita.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                <AlertDialogAction 
                                  onClick={() => handleDeleteCliente(cliente.id)} 
                                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                >
                                  Excluir
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
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

      {/* Modals */}
      <VehicleSelectionModal
        open={vehicleSelectionOpen}
        onOpenChange={setVehicleSelectionOpen}
        clienteId={selectedClienteId}
        clienteNome={selectedClienteNome}
        onVehicleSelected={handleVehicleSelected}
      />

      <ChecklistModal
        open={checklistModalOpen}
        onOpenChange={setChecklistModalOpen}
        veiculoId={selectedVeiculoId}
        onSave={handleChecklistSaved}
      />
    </div>
  );
}