import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Search, Eye, Edit, Trash2, Plus, Phone, Car, MapPin, Mail, Download } from "lucide-react";
import { useClientes } from "@/contexts/ClientesContext";
import { useToast } from "@/hooks/use-toast";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Checkbox } from "@/components/ui/checkbox";

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
  const [selectedClientes, setSelectedClientes] = useState<string[]>([]);

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

  const handleSelectCliente = (clienteId: string, checked: boolean) => {
    if (checked) {
      setSelectedClientes(prev => [...prev, clienteId]);
    } else {
      setSelectedClientes(prev => prev.filter(id => id !== clienteId));
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedClientes(filteredClientes.map(cliente => cliente.id));
    } else {
      setSelectedClientes([]);
    }
  };

  const exportToCSV = () => {
    const selectedClientesData = clientes.filter(cliente => 
      selectedClientes.includes(cliente.id)
    );

    if (selectedClientesData.length === 0) {
      toast({
        title: "Nenhum cliente selecionado",
        description: "Selecione pelo menos um cliente para exportar.",
        variant: "destructive"
      });
      return;
    }

    const csvHeaders = [
      "Nome",
      "Telefone", 
      "Email",
      "CPF/CNPJ",
      "Endereço",
      "Cidade",
      "Estado",
      "CEP",
      "Marca do Veículo",
      "Modelo do Veículo",
      "Ano do Veículo",
      "Placa",
      "Cor",
      "Combustível",
      "Chassi"
    ];

    const csvData = selectedClientesData.map(cliente => [
      cliente.nome || "",
      cliente.telefone || "",
      cliente.email || "",
      cliente.cpf_cnpj || "",
      cliente.endereco || "",
      cliente.cidade || "",
      cliente.estado || "",
      cliente.cep || "",
      cliente.veiculo?.marca || "",
      cliente.veiculo?.modelo || "",
      cliente.veiculo?.ano || "",
      cliente.veiculo?.placa || "",
      cliente.veiculo?.cor || "",
      cliente.veiculo?.combustivel || "",
      cliente.veiculo?.chassi || ""
    ]);

    const csvContent = [csvHeaders, ...csvData]
      .map(row => row.map(field => `"${field}"`).join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `clientes_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({
      title: "Exportação concluída",
      description: `${selectedClientesData.length} cliente(s) exportado(s) com sucesso.`
    });
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
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={exportToCSV}
            disabled={selectedClientes.length === 0}
          >
            <Download className="h-4 w-4 mr-2" />
            Exportar CSV ({selectedClientes.length})
          </Button>
          <Button onClick={() => navigate('/cliente/novo')}>
            <Plus className="h-4 w-4 mr-2" />
            Adicionar Cliente
          </Button>
        </div>
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
                  <TableHead className="w-12">
                    <Checkbox 
                      checked={filteredClientes.length > 0 && selectedClientes.length === filteredClientes.length}
                      onCheckedChange={handleSelectAll}
                    />
                  </TableHead>
                  <TableHead className="font-medium text-muted-foreground">Nome</TableHead>
                  <TableHead className="font-medium text-muted-foreground">Telefone</TableHead>
                  <TableHead className="font-medium text-muted-foreground">Email</TableHead>
                  <TableHead className="font-medium text-muted-foreground">Veículos</TableHead>
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
                        <Checkbox 
                          checked={selectedClientes.includes(cliente.id)}
                          onCheckedChange={(checked) => handleSelectCliente(cliente.id, checked as boolean)}
                        />
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
                          {typeof cliente.veiculosCount === 'number' ? cliente.veiculosCount : (cliente.veiculo ? 1 : 0)}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
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
    </div>
  );
}