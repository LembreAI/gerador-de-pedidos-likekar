import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, Search, MoreVertical, Edit, Filter, Trash2 } from "lucide-react";
import { useInstaladores } from "@/contexts/InstalladoresContext";
import { useAuth } from "@/contexts/AuthContext";
import { InstaladorForm } from "@/components/forms/InstaladorForm";
import { useState } from "react";
export default function Installers() {
  const {
    instaladores,
    loading,
    deleteInstallador
  } = useInstaladores();
  const {
    user
  } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingInstallador, setEditingInstallador] = useState(null);
  const filteredInstaladores = instaladores.filter(instalador => instalador.nome.toLowerCase().includes(searchTerm.toLowerCase()) || instalador.email.toLowerCase().includes(searchTerm.toLowerCase()) || instalador.cidade && instalador.cidade.toLowerCase().includes(searchTerm.toLowerCase()));
  const getInitials = (nome: string) => {
    return nome.split(' ').map(word => word.charAt(0)).join('').toUpperCase().slice(0, 2);
  };
  const handleEdit = instalador => {
    setEditingInstallador(instalador);
    setShowForm(true);
  };
  const handleDelete = async (id: string, nome: string) => {
    if (window.confirm(`Tem certeza que deseja excluir o instalador ${nome}?`)) {
      await deleteInstallador(id);
    }
  };
  const handleCloseForm = () => {
    setShowForm(false);
    setEditingInstallador(null);
  };
  if (!user) {
    return <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Faça login para ver os instaladores</p>
      </div>;
  }
  return <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Instaladores</h1>
          <p className="text-muted-foreground">
            Gerencie sua equipe de instalação
          </p>
        </div>
        <Button onClick={() => setShowForm(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Adicionar Instalador
        </Button>
      </div>

      {/* Search and Filters */}
      <Card className="p-6 border">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Buscar instaladores..." className="pl-10" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
          </div>
          
        </div>
      </Card>

      {/* Installers Table */}
      <Card className="border">
        <div className="p-0">
          <div className="overflow-x-auto">
            <div className="min-w-full">
              <div className="border-b bg-muted/30 flex p-4">
                <div className="flex-1 font-medium text-muted-foreground">Instalador</div>
                <div className="w-32 font-medium text-muted-foreground">Comissão</div>
                <div className="w-32 text-right font-medium text-muted-foreground">Ações</div>
              </div>
              
              <div className="divide-y">
                {loading ?
              // Loading skeleton
              Array.from({
                length: 3
              }).map((_, index) => <div key={index} className="flex items-center p-4 hover:bg-muted/30">
                       <div className="flex-1">
                         <div className="flex items-center gap-3">
                           <Skeleton className="h-10 w-10 rounded-full" />
                           <div>
                             <Skeleton className="h-4 w-32 mb-2" />
                             <Skeleton className="h-3 w-48" />
                           </div>
                         </div>
                       </div>
                       <div className="w-32">
                         <Skeleton className="h-4 w-24" />
                       </div>
                       <div className="w-32 text-right">
                         <div className="flex justify-end gap-1">
                           <Skeleton className="h-8 w-8" />
                           <Skeleton className="h-8 w-8" />
                         </div>
                       </div>
                     </div>) : filteredInstaladores.length === 0 ? <div className="p-8 text-center">
                    <p className="text-muted-foreground">
                      {searchTerm ? "Nenhum instalador encontrado" : "Nenhum instalador cadastrado"}
                    </p>
                  </div> : filteredInstaladores.map(instalador => <div key={instalador.id} className="flex items-center p-4 hover:bg-muted/30 border-b">
                       <div className="flex-1">
                         <div className="flex items-center gap-3">
                           <Avatar className="h-10 w-10 bg-muted">
                             <AvatarFallback className="text-primary font-medium text-sm">
                               {getInitials(instalador.nome)}
                             </AvatarFallback>
                           </Avatar>
                           <div>
                             <p className="font-medium text-foreground">{instalador.nome}</p>
                             <p className="text-sm text-muted-foreground">{instalador.email}</p>
                           </div>
                         </div>
                       </div>
                       <div className="w-32 text-muted-foreground">
                         {instalador.comissao ? `${instalador.comissao}%` : "5%"}
                       </div>
                       <div className="w-32 text-right">
                         <div className="flex justify-end gap-1">
                           <Button variant="ghost" size="sm" className="h-8 w-8 p-0" title="Editar" onClick={() => handleEdit(instalador)}>
                             <Edit className="h-4 w-4" />
                           </Button>
                           <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-destructive hover:text-destructive" title="Excluir" onClick={() => handleDelete(instalador.id, instalador.nome)}>
                             <Trash2 className="h-4 w-4" />
                           </Button>
                         </div>
                       </div>
                     </div>)}
              </div>
            </div>
          </div>
        </div>
      </Card>
      
      <InstaladorForm open={showForm} onOpenChange={handleCloseForm} instalador={editingInstallador} />
    </div>;
}