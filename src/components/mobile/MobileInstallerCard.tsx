import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Edit, Trash2, Mail, TrendingUp } from "lucide-react";

interface MobileInstallerCardProps {
  installer: any;
  onEdit: (installer: any) => void;
  onDelete: (id: string, name: string) => void;
}

export function MobileInstallerCard({ installer, onEdit, onDelete }: MobileInstallerCardProps) {
  const getInitials = (nome: string) => {
    return nome.split(' ').map(word => word.charAt(0)).join('').toUpperCase().slice(0, 2);
  };

  return (
    <Card className="p-4 space-y-4">
      {/* Header with Avatar and Name */}
      <div className="flex items-center gap-3">
        <Avatar className="h-12 w-12 bg-muted flex-shrink-0">
          <AvatarFallback className="text-primary font-medium">
            {getInitials(installer.nome)}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-foreground truncate">{installer.nome}</h3>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Mail className="h-3 w-3 flex-shrink-0" />
            <span className="truncate">{installer.email}</span>
          </div>
        </div>
      </div>

      {/* Commission */}
      <div className="flex items-center gap-2">
        <TrendingUp className="h-4 w-4 text-muted-foreground flex-shrink-0" />
        <span className="text-sm text-muted-foreground">
          Comissão: {installer.comissao ? `${installer.comissao}%` : "5%"}
        </span>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2 pt-2 border-t">
        <Button
          variant="outline"
          size="sm"
          className="flex-1 h-9"
          onClick={() => onEdit(installer)}
        >
          <Edit className="h-4 w-4 mr-2" />
          Editar
        </Button>
        
        <Button
          variant="outline"
          size="sm"
          className="h-9 px-3 text-destructive border-destructive/20"
          onClick={() => onDelete(installer.id, installer.nome)}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </Card>
  );
}