import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Search, Trash2, Printer, Filter, Eye, Download } from "lucide-react";
import { useOrders } from "@/contexts/OrdersContext";
import { useToast } from "@/hooks/use-toast";
import { generateLikeKarPDF, PedidoData } from "@/services/likeKarPDFGenerator";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
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
  const {
    orders,
    loading,
    deleteOrder,
    reloadOrders,
    getOrderWithDetails
  } = useOrders();
  const {
    toast
  } = useToast();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [localLoading, setLocalLoading] = useState(loading);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);

  // Sincronizar estado de loading local
  useEffect(() => {
    setLocalLoading(loading);
  }, [loading]);

  // Recarregar pedidos quando a página carregar - apenas uma vez
  useEffect(() => {
    console.log('🔄 Orders.tsx: Página de pedidos carregada, forçando reload...');
    if (orders.length === 0) {
      reloadOrders();
    }
  }, []); // Array vazio para executar apenas uma vez

  console.log('📊 Orders.tsx: Estado atual dos pedidos:', { orders, loading, localLoading, ordersLength: orders.length });
  const filteredOrders = orders.filter(order => 
    order.cliente?.nome?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    order.id?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    `${order.veiculo?.marca} ${order.veiculo?.modelo}`.toLowerCase().includes(searchTerm.toLowerCase())
  );
  const handlePrintOrder = async (order: any) => {
    try {
      console.log('🖨️ Iniciando impressão do pedido:', order.id);
      setLocalLoading(true);
      
      // Buscar detalhes completos do pedido
      const orderDetails = await getOrderWithDetails(order.id);
      console.log('📊 Detalhes completos do pedido:', orderDetails);
      
      if (!orderDetails) {
        throw new Error('Não foi possível carregar os detalhes do pedido');
      }
      
      // Usar dados originais do PDF se disponíveis, senão usar dados do banco
      let orderData: PedidoData;
      
      if (orderDetails.dados_pdf_original) {
        console.log('📄 Usando dados originais do PDF para impressão');
        orderData = JSON.parse(orderDetails.dados_pdf_original);
        
        // Atualizar dados que podem ter mudado
        orderData.veiculo = {
          marca: orderDetails.veiculo?.marca || orderData.veiculo.marca,
          modelo: orderDetails.veiculo?.modelo || orderData.veiculo.modelo,
          cor: orderDetails.veiculo?.cor || orderData.veiculo.cor,
          ano: orderDetails.veiculo?.ano?.toString() || orderData.veiculo.ano,
          placa: orderDetails.veiculo?.placa || orderData.veiculo.placa
        };
        
        orderData.responsaveis = {
          instalador: orderDetails.instalador?.nome || orderData.responsaveis.instalador,
          vendedor: orderDetails.vendedor?.nome || orderData.responsaveis.vendedor
        };
      } else {
        console.log('⚠️ Dados originais do PDF não encontrados, usando dados do banco');
        // Preparar dados do pedido para impressão com a estrutura correta da interface PedidoData
        orderData = {
          cliente: {
            nome: orderDetails.cliente?.nome || orderDetails.responsavel_nome || 'Cliente não identificado',
            empresa: orderDetails.cliente?.nome || '',
            telefone: orderDetails.cliente?.telefone || orderDetails.responsavel_telefone || '',
            email: orderDetails.cliente?.email || '',
            endereco: orderDetails.cliente?.endereco || '',
            cnpj: orderDetails.cliente?.cpf_cnpj || ''
          },
          pedido: {
            numero: orderDetails.id || 'N/A',
            data: new Date(orderDetails.created_at).toLocaleDateString('pt-BR') || new Date().toLocaleDateString('pt-BR'),
            formaPagamento: 'À vista'
          },
          produtos: (orderDetails.produtos || []).map((produto: any) => {
            const valorUnitario = produto.valor_unitario || 0;
            const quantidade = produto.quantidade || 1;
            const total = valorUnitario * quantidade;
            
            return {
              descricao: produto.descricao || 'Produto',
              codigo: '001', // Valor padrão
              quantidade: quantidade,
              unitario: valorUnitario,
              desconto: 0, // Valor padrão
              total: total
            };
          }),
          veiculo: {
            marca: orderDetails.veiculo?.marca || '',
            modelo: orderDetails.veiculo?.modelo || '',
            cor: orderDetails.veiculo?.cor || '',
            ano: orderDetails.veiculo?.ano?.toString() || '',
            placa: orderDetails.veiculo?.placa || ''
          },
          responsaveis: {
            instalador: orderDetails.instalador?.nome || 'Não definido',
            vendedor: orderDetails.vendedor?.nome || 'Não definido'
          },
          observacoes: orderDetails.observacoes || ''
        };
      }

      console.log('📋 Dados formatados para PDF:', orderData);
        
        const pdfBytes = await generateLikeKarPDF(orderData);
        const blob = new Blob([pdfBytes], {
          type: 'application/pdf'
        });
        const url = URL.createObjectURL(blob);
        
        // Tentar abrir em nova aba para impressão
        const printWindow = window.open('', '_blank');
        if (printWindow) {
          printWindow.document.write(`
            <html>
              <head>
                <title>Impressão - Pedido ${order.id}</title>
              </head>
              <body style="margin:0;">
                <iframe src="${url}" width="100%" height="100%" frameborder="0"></iframe>
                <script>
                  window.addEventListener('load', function() {
                    setTimeout(function() {
                      window.print();
                    }, 1000);
                  });
                </script>
              </body>
            </html>
          `);
          printWindow.document.close();
        } else {
          // Fallback: download se não conseguir imprimir
          const link = document.createElement('a');
          link.href = url;
          link.download = `Pedido_LikeKar_${order.id}.pdf`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        }
        
        // Cleanup
        setTimeout(() => URL.revokeObjectURL(url), 5000);
      
      toast({
        title: "PDF enviado para impressão",
        description: "O pedido foi enviado para a impressora."
      });
      
    } catch (error) {
      console.error('❌ Erro ao imprimir pedido:', error);
      toast({
        title: "Erro na impressão",
        description: `Não foi possível imprimir o pedido: ${error.message}`,
        variant: "destructive"
      });
    } finally {
      setLocalLoading(false);
    }
  };

  const handleDownloadOrder = async (order: any) => {
    try {
      console.log('⬇️ Iniciando download do pedido:', order.id);
      
      if (!order.pdf_gerado_url) {
        console.log('❌ PDF não encontrado para o pedido');
        toast({
          title: "PDF não encontrado",
          description: "Este pedido não possui PDF salvo.",
          variant: "destructive"
        });
        return;
      }

      // Extrair o caminho do arquivo da URL existente
      const urlParts = order.pdf_gerado_url.split('/');
      const pathIndex = urlParts.findIndex(part => part === 'pdfs');
      
      if (pathIndex === -1 || pathIndex + 1 >= urlParts.length) {
        throw new Error('URL do PDF inválida');
      }

      // Pegar o caminho completo após /pdfs/
      const filePath = urlParts.slice(pathIndex + 1).join('/');
      console.log('📂 Caminho do arquivo:', filePath);

      // Gerar nova URL assinada (válida por 1 hora)
      const { data: signedUrlData, error: signedUrlError } = await supabase.storage
        .from('pdfs')
        .createSignedUrl(filePath, 3600); // 1 hora

      if (signedUrlError) {
        console.error('❌ Erro ao gerar URL assinada:', signedUrlError);
        throw new Error(`Erro ao gerar URL: ${signedUrlError.message}`);
      }

      console.log('🔗 Nova URL assinada gerada');

      // Fazer download usando a nova URL assinada
      console.log('📥 Fazendo download do PDF...');
      const response = await fetch(signedUrlData.signedUrl, {
        method: 'GET',
        headers: {
          'Accept': 'application/pdf'
        }
      });
      
      if (!response.ok) {
        throw new Error(`Erro ${response.status}: ${response.statusText}`);
      }

      const blob = await response.blob();
      console.log('✅ PDF baixado, tamanho:', blob.size, 'bytes');

      // Criar URL para download
      const url = URL.createObjectURL(blob);
      
      // Criar link de download
      const link = document.createElement('a');
      link.href = url;
      link.download = `Pedido_${order.id}.pdf`;
      link.style.display = 'none';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Limpar URL após um breve delay
      setTimeout(() => URL.revokeObjectURL(url), 100);

      toast({
        title: "Download iniciado",
        description: `PDF do pedido ${order.id} está sendo baixado.`
      });
    } catch (error) {
      console.error('❌ Erro ao baixar PDF:', error);
      toast({
        title: "Erro no download",
        description: `Não foi possível baixar o PDF: ${error.message}`,
        variant: "destructive"
      });
    }
  };

  const handleDeleteOrder = async (orderId: string) => {
    try {
      await deleteOrder(orderId);
      toast({
        title: "Pedido excluído",
        description: "O pedido foi removido com sucesso."
      });
    } catch (error) {
      toast({
        title: "Erro ao excluir",
        description: "Ocorreu um erro ao excluir o pedido.",
        variant: "destructive"
      });
    }
  };

  const handleViewOrder = async (order: any) => {
    try {
      setLocalLoading(true);
      const orderDetails = await getOrderWithDetails(order.id);
      setSelectedOrder(orderDetails);
      setIsViewDialogOpen(true);
    } catch (error) {
      console.error('Erro ao carregar detalhes do pedido:', error);
      toast({
        title: "Erro ao carregar pedido",
        description: "Não foi possível carregar os detalhes do pedido.",
        variant: "destructive"
      });
    } finally {
      setLocalLoading(false);
    }
  };
  return <div className="space-y-6">
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
            <Input placeholder="Buscar por cliente, vendedor ou ID do pedido..." className="pl-10" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
          </div>
          
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
                  <TableHead className="font-medium text-muted-foreground">Telefone</TableHead>
                  <TableHead className="font-medium text-muted-foreground">Carro</TableHead>
                  <TableHead className="text-right font-medium text-muted-foreground">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {localLoading && orders.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      Carregando pedidos...
                    </TableCell>
                  </TableRow>
                ) : filteredOrders.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      {orders.length === 0 ? "Nenhum pedido encontrado" : "Nenhum resultado para a busca"}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredOrders.map(order => (
                    <TableRow key={order.id} className="hover:bg-muted/30 border-b">
                      <TableCell className="w-12">
                        <input type="checkbox" className="w-4 h-4 rounded border border-input bg-background" />
                      </TableCell>
                      <TableCell className="font-medium text-foreground">{order.id}</TableCell>
                      <TableCell className="text-muted-foreground">
                        {new Date(order.created_at).toLocaleDateString('pt-BR')}
                      </TableCell>
                      <TableCell className="text-foreground">{order.cliente?.nome || 'N/A'}</TableCell>
                      <TableCell className="text-muted-foreground">{order.cliente?.telefone || 'N/A'}</TableCell>
                      <TableCell className="text-muted-foreground">
                        {order.veiculo ? `${order.veiculo.marca} ${order.veiculo.modelo} ${order.veiculo.ano}` : 'N/A'}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-8 w-8 p-0" 
                            title="Visualizar pedido"
                            onClick={() => handleViewOrder(order)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          
                          {order.pdf_gerado_url ? (
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="h-8 w-8 p-0 text-green-600" 
                              title="Baixar PDF salvo"
                              onClick={() => handleDownloadOrder(order)}
                            >
                              <Download className="h-4 w-4" />
                            </Button>
                          ) : (
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="h-8 w-8 p-0" 
                              title="Imprimir pedido"
                              onClick={() => handlePrintOrder(order)}
                            >
                              <Printer className="h-4 w-4" />
                            </Button>
                          )}
                          
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
                                  Tem certeza que deseja excluir o pedido {order.id}? Esta ação não pode ser desfeita.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleDeleteOrder(order.id)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
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

      {/* Modal de Visualização do Pedido */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Detalhes do Pedido #{selectedOrder?.id}</DialogTitle>
          </DialogHeader>
          
          {selectedOrder && (
            <div className="space-y-6">
              {/* Cabeçalho do Pedido */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-muted/30 rounded-lg">
                <div>
                  <h3 className="font-semibold text-sm text-muted-foreground">Número do Pedido</h3>
                  <p className="font-mono">{selectedOrder.id}</p>
                </div>
                <div>
                  <h3 className="font-semibold text-sm text-muted-foreground">Data</h3>
                  <p>{new Date(selectedOrder.created_at).toLocaleDateString('pt-BR')}</p>
                </div>
                <div>
                  <h3 className="font-semibold text-sm text-muted-foreground">Status</h3>
                  <Badge className={getStatusColor(selectedOrder.status)}>
                    {selectedOrder.status}
                  </Badge>
                </div>
              </div>

              {/* Dados do Cliente */}
              <Card className="p-4">
                <h3 className="font-semibold mb-3">Dados do Cliente</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Nome</p>
                    <p className="font-medium">{selectedOrder.cliente?.nome || selectedOrder.responsavel_nome || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Telefone</p>
                    <p className="font-medium">{selectedOrder.cliente?.telefone || selectedOrder.responsavel_telefone || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">E-mail</p>
                    <p className="font-medium">{selectedOrder.cliente?.email || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">CPF/CNPJ</p>
                    <p className="font-medium">{selectedOrder.cliente?.cpf_cnpj || 'N/A'}</p>
                  </div>
                  {selectedOrder.cliente?.endereco && (
                    <div className="md:col-span-2">
                      <p className="text-sm text-muted-foreground">Endereço</p>
                      <p className="font-medium">{selectedOrder.cliente.endereco}</p>
                    </div>
                  )}
                </div>
              </Card>

              {/* Dados do Veículo */}
              <Card className="p-4">
                <h3 className="font-semibold mb-3">Veículo do Cliente</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Marca/Modelo</p>
                    <p className="font-medium">
                      {selectedOrder.veiculo ? 
                        `${selectedOrder.veiculo.marca} ${selectedOrder.veiculo.modelo}` : 
                        'N/A'
                      }
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Ano</p>
                    <p className="font-medium">{selectedOrder.veiculo?.ano || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Cor</p>
                    <p className="font-medium">{selectedOrder.veiculo?.cor || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Placa</p>
                    <p className="font-medium">{selectedOrder.veiculo?.placa || 'N/A'}</p>
                  </div>
                </div>
              </Card>

              {/* Produtos */}
              <Card className="p-4">
                <h3 className="font-semibold mb-3">Produtos</h3>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Descrição</TableHead>
                        <TableHead className="text-center">Qtd</TableHead>
                        <TableHead className="text-right">Valor Unit.</TableHead>
                        <TableHead className="text-right">Total</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {selectedOrder.produtos && selectedOrder.produtos.length > 0 ? (
                        selectedOrder.produtos.map((produto: any, index: number) => (
                          <TableRow key={index}>
                            <TableCell>{produto.descricao}</TableCell>
                            <TableCell className="text-center">{produto.quantidade}</TableCell>
                            <TableCell className="text-right">
                              R$ {(produto.valor_unitario || 0).toFixed(2).replace('.', ',')}
                            </TableCell>
                            <TableCell className="text-right">
                              R$ {(produto.valor_total || 0).toFixed(2).replace('.', ',')}
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={4} className="text-center text-muted-foreground">
                            Nenhum produto encontrado
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
                
                {selectedOrder.produtos && selectedOrder.produtos.length > 0 && (
                  <div className="mt-4 pt-4 border-t">
                    <div className="flex justify-end">
                      <div className="text-right">
                        <p className="text-sm text-muted-foreground">Valor Total</p>
                        <p className="text-lg font-semibold">
                          R$ {(selectedOrder.valor_total || 0).toFixed(2).replace('.', ',')}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </Card>

              {/* Responsáveis */}
              <Card className="p-4">
                <h3 className="font-semibold mb-3">Responsáveis</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Instalador</p>
                    <p className="font-medium">{selectedOrder.instalador?.nome || 'Não definido'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Vendedor</p>
                    <p className="font-medium">{selectedOrder.vendedor?.nome || 'Não definido'}</p>
                  </div>
                </div>
              </Card>

              {/* Observações */}
              {selectedOrder.observacoes && (
                <Card className="p-4">
                  <h3 className="font-semibold mb-3">Observações</h3>
                  <p className="text-muted-foreground">{selectedOrder.observacoes}</p>
                </Card>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>;
}