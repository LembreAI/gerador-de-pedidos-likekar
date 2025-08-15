import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Eye, Printer, Download, Trash2, CalendarDays, User, Car, Phone } from "lucide-react";

interface MobileOrderCardProps {
  order: any;
  onView: (order: any) => void;
  onPrint: (order: any) => void;
  onDownload: (order: any) => void;
  onDelete: (orderId: string) => void;
}

const getStatusColor = (status: string) => {
  switch (status) {
    case "Concluído":
      return "bg-green-100 text-green-800 border-green-200";
    case "Em andamento":
      return "bg-blue-100 text-blue-800 border-blue-200";
    case "Pendente":
      return "bg-yellow-100 text-yellow-800 border-yellow-200";
    default:
      return "bg-gray-100 text-gray-800 border-gray-200";
  }
};

export function MobileOrderCard({ order, onView, onPrint, onDownload, onDelete }: MobileOrderCardProps) {
  return (
    <Card className="p-4 space-y-4">
      {/* Header with Order Number and Status */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h3 className="font-semibold text-foreground">#{order.id}</h3>
          {new Date(order.created_at) > new Date(Date.now() - 24 * 60 * 60 * 1000) && (
            <Badge variant="secondary" className="text-xs">Novo</Badge>
          )}
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <CalendarDays className="h-3 w-3" />
          {new Date(order.created_at).toLocaleDateString('pt-BR')}
        </div>
      </div>

      {/* Client Information */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <User className="h-4 w-4 text-muted-foreground flex-shrink-0" />
          <span className="font-medium text-sm">{order.cliente?.nome || 'N/A'}</span>
        </div>
        {order.cliente?.telefone && (
          <div className="flex items-center gap-2">
            <Phone className="h-4 w-4 text-muted-foreground flex-shrink-0" />
            <span className="text-sm text-muted-foreground">{order.cliente.telefone}</span>
          </div>
        )}
      </div>

      {/* Vehicle Information */}
      {order.veiculo && (
        <div className="flex items-center gap-2">
          <Car className="h-4 w-4 text-muted-foreground flex-shrink-0" />
          <span className="text-sm text-muted-foreground">
            {`${order.veiculo.marca} ${order.veiculo.modelo} ${order.veiculo.ano}`}
          </span>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-2 pt-2 border-t">
        <Button
          variant="outline"
          size="sm"
          className="flex-1 h-9"
          onClick={() => onView(order)}
        >
          <Eye className="h-4 w-4 mr-2" />
          Ver
        </Button>
        
        {order.pdf_gerado_url ? (
          <Button
            variant="outline"
            size="sm"
            className="flex-1 h-9 text-green-600 border-green-200"
            onClick={() => onDownload(order)}
          >
            <Download className="h-4 w-4 mr-2" />
            PDF
          </Button>
        ) : (
          <Button
            variant="outline"
            size="sm"
            className="flex-1 h-9"
            onClick={() => onPrint(order)}
          >
            <Printer className="h-4 w-4 mr-2" />
            Gerar
          </Button>
        )}
        
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
                Tem certeza que deseja excluir o pedido {order.id}? Esta ação não pode ser desfeita.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction 
                onClick={() => onDelete(order.id)}
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