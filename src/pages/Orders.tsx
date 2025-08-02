import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Search, Eye, Edit, Trash2, Download, Filter } from "lucide-react";
import { useOrders } from "@/contexts/OrdersContext";
import { useToast } from "@/hooks/use-toast";
import { generateLikeKarPDF } from "@/services/likeKarPDFGenerator";
import { useState } from "react";


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

export default function Orders() {
  const { orders, deleteOrder } = useOrders();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");

  const filteredOrders = orders.filter(order =>
    order.cliente.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.numero.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.carro.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDownloadPDF = async (order: any) => {
    try {
      if (order.pdfBlob) {
        // Use the saved PDF blob
        const url = URL.createObjectURL(order.pdfBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `Pedido_LikeKar_${order.numero}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      } else {
        // Regenerate PDF from saved data
        const orderData = {
          cliente: order.extractedData.cliente,
          pedido: order.extractedData.pedido,
          produtos: order.extractedData.produtos,
          veiculo: order.vehicleData,
          responsaveis: {
            instalador: order.vehicleData.instalador,
            vendedor: order.vehicleData.vendedor
          }
        };
        
        const pdfBytes = await generateLikeKarPDF(orderData);
        const blob = new Blob([pdfBytes], { type: 'application/pdf' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `Pedido_LikeKar_${order.numero}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      }
      
      toast({
        title: "PDF baixado com sucesso!",
        description: `Pedido ${order.numero} foi baixado.`
      });
    } catch (error) {
      console.error('Erro ao baixar PDF:', error);
      toast({
        title: "Erro ao baixar PDF",
        description: "Ocorreu um erro ao processar o download.",
        variant: "destructive"
      });
    }
  };

  const handleDeleteOrder = (orderId: string) => {
    deleteOrder(orderId);
    toast({
      title: "Pedido excluído",
      description: "O pedido foi removido com sucesso."
    });
  };
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Pedidos</h1>
        <p className="text-muted-foreground">
          Gerencie todos os pedidos de vendas
        </p>
      </div>

      {/* Filters */}
      <Card className="p-6 border">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por cliente, vendedor ou ID do pedido..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button variant="outline" className="flex items-center gap-2">
            <Filter className="h-4 w-4" />
            Filtrar
          </Button>
        </div>
      </Card>

      {/* Orders Table */}
      <Card className="border">
        <div className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-b bg-muted/30">
                  <TableHead className="w-12"></TableHead>
                  <TableHead className="font-medium text-muted-foreground">Número</TableHead>
                  <TableHead className="font-medium text-muted-foreground">Data</TableHead>
                  <TableHead className="font-medium text-muted-foreground">Cliente</TableHead>
                  <TableHead className="font-medium text-muted-foreground">Carro</TableHead>
                  <TableHead className="text-right font-medium text-muted-foreground">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredOrders.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      {orders.length === 0 ? "Nenhum pedido encontrado" : "Nenhum resultado para a busca"}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredOrders.map((order) => (
                    <TableRow key={order.id} className="hover:bg-muted/30 border-b">
                      <TableCell className="w-12">
                        <input 
                          type="checkbox" 
                          className="w-4 h-4 rounded border border-input bg-background"
                        />
                      </TableCell>
                      <TableCell className="font-medium text-foreground">{order.numero}</TableCell>
                      <TableCell className="text-muted-foreground">{order.data}</TableCell>
                      <TableCell className="text-foreground">{order.cliente}</TableCell>
                      <TableCell className="text-muted-foreground">{order.carro}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0" title="Ver detalhes">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0" title="Editar">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-8 w-8 p-0" 
                            title="Baixar PDF"
                            onClick={() => handleDownloadPDF(order)}
                          >
                            <Download className="h-4 w-4" />
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
                                  Tem certeza que deseja excluir o pedido {order.numero}? Esta ação não pode ser desfeita.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                <AlertDialogAction 
                                  onClick={() => handleDeleteOrder(order.id)}
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