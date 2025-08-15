import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Eye, Edit, Trash2, User, Phone, Mail, Car } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface MobileClientCardProps {
  client: any;
  isSelected: boolean;
  onSelect: (clientId: string, checked: boolean) => void;
  onDelete: (clientId: string) => void;
}

export function MobileClientCard({ client, isSelected, onSelect, onDelete }: MobileClientCardProps) {
  const navigate = useNavigate();

  return (
    <Card className="p-4 space-y-4">
      {/* Header with Checkbox and Name */}
      <div className="flex items-start gap-3">
        <Checkbox 
          checked={isSelected}
          onCheckedChange={(checked) => onSelect(client.id, checked as boolean)}
          className="mt-1"
        />
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-foreground truncate">{client.nome}</h3>
        </div>
      </div>

      {/* Contact Information */}
      <div className="space-y-2">
        {client.telefone && (
          <div className="flex items-center gap-2">
            <Phone className="h-4 w-4 text-muted-foreground flex-shrink-0" />
            <span className="text-sm text-muted-foreground">{client.telefone}</span>
          </div>
        )}
        {client.email && (
          <div className="flex items-center gap-2">
            <Mail className="h-4 w-4 text-muted-foreground flex-shrink-0" />
            <span className="text-sm text-muted-foreground truncate">{client.email}</span>
          </div>
        )}
      </div>

      {/* Vehicle Count */}
      <div className="flex items-center gap-2">
        <Car className="h-4 w-4 text-muted-foreground flex-shrink-0" />
        <span className="text-sm text-muted-foreground">
          {typeof client.veiculosCount === 'number' ? client.veiculosCount : client.veiculo ? 1 : 0} veículo(s)
        </span>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2 pt-2 border-t">
        <Button
          variant="outline"
          size="sm"
          className="flex-1 h-9"
          onClick={() => navigate(`/cliente/${client.id}`)}
        >
          <Eye className="h-4 w-4 mr-2" />
          Ver
        </Button>
        
        <Button
          variant="outline"
          size="sm"
          className="flex-1 h-9"
          onClick={() => navigate(`/cliente/${client.id}/editar`)}
        >
          <Edit className="h-4 w-4 mr-2" />
          Editar
        </Button>
        
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="h-9 px-3 text-destructive border-destructive/20"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
              <AlertDialogDescription>
                Tem certeza que deseja excluir o cliente {client.nome}? Esta ação também removerá todos os veículos associados e não pode ser desfeita.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction 
                onClick={() => onDelete(client.id)}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Excluir
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </Card>
  );
}