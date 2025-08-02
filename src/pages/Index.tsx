import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { StepIndicator } from "@/components/steps/StepIndicator";
import { FileUpload } from "@/components/upload/FileUpload";
import { generateLikeKarPDF, PedidoData } from "@/services/likeKarPDFGenerator";
import { useToast } from "@/hooks/use-toast";
import { useOrders } from "@/contexts/OrdersContext";
import { useVendedores } from "@/contexts/VendedoresContext";
import { useInstaladores } from "@/contexts/InstalladoresContext";
import { useNavigate } from "react-router-dom";

// Definição dos passos
const steps = [
  { id: 1, title: "Upload PDF", description: "Enviar recibo em PDF" },
  { id: 2, title: "Dados do Veículo", description: "Informações do veículo" },
  { id: 3, title: "Gerar Pedido", description: "Finalizar e gerar o pedido" }
];

const Index = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [extractedData, setExtractedData] = useState<any>(null);
  const [vehicleData, setVehicleData] = useState({
    marca: "",
    modelo: "",
    ano: "",
    cor: "",
    placa: "",
    instalador: "",
    vendedor: ""
  });
  const { toast } = useToast();
  const { addOrder } = useOrders();
  const { vendedores } = useVendedores();
  const { instaladores } = useInstaladores();
  const navigate = useNavigate();

  const handleFileSelect = (file: File) => {
    setUploadedFile(file);
  };

  const handleDataExtracted = (data: any) => {
    setExtractedData(data);
    // Extrair vendedor do PDF e pré-preencher
    if (data.vendedor) {
      setVehicleData(prev => ({...prev, vendedor: data.vendedor}));
    }
    setCompletedSteps([...completedSteps, 1]);
    setCurrentStep(2);
  };

  const handleNextStep = () => {
    if (currentStep < steps.length && isStepValid()) {
      setCurrentStep(currentStep + 1);
      if (currentStep === 2) {
        setCompletedSteps([...completedSteps, 2]);
      }
    }
  };

  const handlePreviousStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleGenerateOrder = async (saveAndGoToOrders: boolean = false) => {
    if (!extractedData) return;

    try {
      // Combinar dados extraídos com dados do formulário
      const orderData: PedidoData = {
        cliente: extractedData.cliente,
        pedido: extractedData.pedido,
        produtos: extractedData.produtos,
        veiculo: {
          marca: vehicleData.marca,
          modelo: vehicleData.modelo,
          cor: vehicleData.cor,
          ano: vehicleData.ano,
          placa: vehicleData.placa
        },
        responsaveis: {
          instalador: vehicleData.instalador,
          vendedor: vehicleData.vendedor
        }
      };

      const pdfBytes = await generateLikeKarPDF(orderData);
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });

      // Salvar pedido no contexto
      const newOrder = addOrder({
        numero: extractedData.pedido.numero,
        data: extractedData.pedido.data,
        cliente: extractedData.cliente.nome,
        carro: `${vehicleData.marca} ${vehicleData.modelo} ${vehicleData.ano}`,
        valor: extractedData.totalPedido,
        status: 'Pendente',
        extractedData,
        vehicleData,
        pdfBlob: blob
      });

      // Fazer download apenas se não estiver indo para página de pedidos
      if (!saveAndGoToOrders) {
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `Pedido_LikeKar_${orderData.pedido.numero}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      }

      setCompletedSteps([...completedSteps, 3]);
      
      toast({
        title: "Pedido salvo com sucesso!",
        description: saveAndGoToOrders ? "Navegando para a lista de pedidos..." : "O arquivo PDF foi baixado automaticamente."
      });

      if (saveAndGoToOrders) {
        setTimeout(() => navigate('/pedidos'), 1000);
      }
    } catch (error) {
      console.error('Erro ao gerar pedido:', error);
      toast({
        title: "Erro ao gerar pedido",
        description: "Ocorreu um erro ao processar o pedido.",
        variant: "destructive"
      });
    }
  };

  const isStepValid = () => {
    switch (currentStep) {
      case 1:
        return !!extractedData;
      case 2:
        return vehicleData.marca && vehicleData.modelo && vehicleData.placa && vehicleData.instalador && vehicleData.vendedor;
      default:
        return true;
    }
  };

  return (
    <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold mb-3 sm:mb-4">Like Kar</h1>
          <p className="text-muted-foreground text-sm sm:text-base px-2">
            Processe recibos em PDF e gere pedidos formatados automaticamente
          </p>
        </div>


        {/* Conteúdo baseado no passo atual */}
        {currentStep === 1 && (
          <Card>
            <CardHeader className="px-4 sm:px-6 py-4 sm:py-6">
              <CardTitle className="text-lg sm:text-xl">Upload do Recibo PDF</CardTitle>
              <CardDescription className="text-sm">
                Envie o recibo em PDF para extrair automaticamente as informações
              </CardDescription>
            </CardHeader>
            <CardContent className="px-4 sm:px-6">
              <FileUpload
                onFileSelect={handleFileSelect}
                onDataExtracted={handleDataExtracted}
                title="Selecione o recibo PDF"
                description="Arraste e solte o arquivo PDF aqui ou clique para selecionar"
              />
            </CardContent>
          </Card>
        )}

        {currentStep === 2 && (
          <Card>
            <CardHeader className="px-4 sm:px-6 py-4 sm:py-6">
              <CardTitle className="text-lg sm:text-xl">Dados do Veículo</CardTitle>
              <CardDescription className="text-sm">
                Complete as informações do veículo e responsáveis
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 px-4 sm:px-6">
              {extractedData && (
                <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-secondary rounded-lg">
                  <h3 className="font-medium mb-2 text-sm sm:text-base">Dados Extraídos do PDF:</h3>
                  <div className="space-y-1 sm:grid sm:grid-cols-2 sm:gap-2 sm:space-y-0 text-xs sm:text-sm">
                    <p><strong>Cliente:</strong> {extractedData.cliente.nome}</p>
                    <p><strong>Pedido:</strong> #{extractedData.pedido.numero}</p>
                    <p><strong>Total:</strong> {extractedData.totalPedido}</p>
                    <p><strong>Data:</strong> {extractedData.pedido.data}</p>
                  </div>
                </div>
              )}
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div className="space-y-2">
                  <Label htmlFor="marca">Marca do Veículo</Label>
                  <Input
                    id="marca"
                    placeholder="Digite a marca do veículo"
                    value={vehicleData.marca}
                    onChange={(e) => setVehicleData({...vehicleData, marca: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="modelo">Modelo do Veículo</Label>
                  <Input
                    id="modelo"
                    placeholder="Digite o modelo do veículo"
                    value={vehicleData.modelo}
                    onChange={(e) => setVehicleData({...vehicleData, modelo: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="ano">Ano do Veículo</Label>
                  <Input
                    id="ano"
                    placeholder="Digite o ano do veículo"
                    value={vehicleData.ano}
                    onChange={(e) => setVehicleData({...vehicleData, ano: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cor">Cor do Veículo</Label>
                  <Input
                    id="cor"
                    placeholder="Digite a cor do veículo"
                    value={vehicleData.cor}
                    onChange={(e) => setVehicleData({...vehicleData, cor: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="placa">Placa do Veículo</Label>
                  <Input
                    id="placa"
                    placeholder="Digite a placa do veículo"
                    value={vehicleData.placa}
                    onChange={(e) => setVehicleData({...vehicleData, placa: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="instalador">Instalador</Label>
                  <Select value={vehicleData.instalador} onValueChange={(value) => setVehicleData({...vehicleData, instalador: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o instalador" />
                    </SelectTrigger>
                    <SelectContent>
                      {instaladores.map((instalador) => (
                        <SelectItem key={instalador.id} value={instalador.nome}>
                          {instalador.nome}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="vendedor">Vendedor</Label>
                  <Select value={vehicleData.vendedor} onValueChange={(value) => setVehicleData({...vehicleData, vendedor: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o vendedor" />
                    </SelectTrigger>
                    <SelectContent>
                      {vendedores.map((vendedor) => (
                        <SelectItem key={vendedor.id} value={vendedor.nome}>
                          {vendedor.nome}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {currentStep === 3 && (
          <Card>
            <CardHeader className="px-4 sm:px-6 py-4 sm:py-6">
              <CardTitle className="text-lg sm:text-xl">Resumo e Geração do Pedido</CardTitle>
              <CardDescription className="text-sm">
                Revise as informações e gere o pedido final
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 sm:space-y-4 px-4 sm:px-6">
              {extractedData && (
                <div className="bg-muted p-3 sm:p-4 rounded-lg mb-3 sm:mb-4">
                  <h3 className="font-medium mb-2 text-sm sm:text-base">Dados do Cliente (do PDF):</h3>
                  <div className="space-y-1 text-xs sm:text-sm">
                    <p><strong>Nome:</strong> {extractedData.cliente.nome}</p>
                    <p><strong>Empresa:</strong> {extractedData.cliente.empresa}</p>
                    <p><strong>CNPJ:</strong> {extractedData.cliente.cnpj}</p>
                    <p><strong>Telefone:</strong> {extractedData.cliente.telefone}</p>
                    <p><strong>E-mail:</strong> {extractedData.cliente.email}</p>
                  </div>
                </div>
              )}
              
              <div className="bg-muted p-3 sm:p-4 rounded-lg">
                <h3 className="font-medium mb-2 text-sm sm:text-base">Dados do Veículo:</h3>
                <div className="space-y-1 text-xs sm:text-sm">
                  <p><strong>Veículo:</strong> {vehicleData.marca} {vehicleData.modelo} ({vehicleData.ano})</p>
                  <p><strong>Cor:</strong> {vehicleData.cor}</p>
                  <p><strong>Placa:</strong> {vehicleData.placa}</p>
                  <p><strong>Instalador:</strong> {vehicleData.instalador}</p>
                  <p><strong>Vendedor:</strong> {vehicleData.vendedor}</p>
                </div>
              </div>
              
              {extractedData && (
                <div className="bg-muted p-3 sm:p-4 rounded-lg">
                  <h3 className="font-medium mb-2 text-sm sm:text-base">Produtos (do PDF):</h3>
                  <div className="space-y-1 text-xs sm:text-sm">
                    {extractedData.produtos.map((produto: any, index: number) => (
                      <p key={index}><strong>{produto.descricao}</strong> - {produto.total}</p>
                    ))}
                    <p className="font-medium mt-2"><strong>Total:</strong> {extractedData.totalPedido}</p>
                  </div>
                </div>
              )}
              
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                <Button onClick={() => handleGenerateOrder(false)} className="w-full sm:flex-1" size="lg">
                  Salvar PDF
                </Button>
                <Button onClick={() => handleGenerateOrder(true)} className="w-full sm:flex-1" size="lg" variant="outline">
                  Salvar e ir para Pedidos
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Navegação */}
        <div className="flex justify-between mt-4 sm:mt-6 px-2 sm:px-0">
          <Button 
            variant="outline" 
            onClick={handlePreviousStep}
            disabled={currentStep === 1}
            className="text-sm px-4 py-2"
          >
            Voltar
          </Button>
          <Button 
            onClick={handleNextStep}
            disabled={!isStepValid() || currentStep === steps.length}
            className="text-sm px-4 py-2 bg-yellow-400 hover:bg-yellow-500 text-black"
          >
            {currentStep === steps.length ? "Finalizar" : "Próximo"}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Index;