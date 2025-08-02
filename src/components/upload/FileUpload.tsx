import React, { useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Upload, FileText, X } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";

interface FileUploadProps {
  onFileSelect: (file: File) => void;
  onDataExtracted: (data: any) => void;
  acceptedFiles?: string[];
  maxSize?: number;
  title?: string;
  description?: string;
}

export const FileUpload: React.FC<FileUploadProps> = ({
  onFileSelect,
  onDataExtracted,
  acceptedFiles = ['.pdf'],
  maxSize = 10 * 1024 * 1024, // 10MB
  title = "Upload do Recibo PDF",
  description = "Arraste e solte o arquivo PDF aqui ou clique para selecionar"
}) => {
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [extractedData, setExtractedData] = useState<any>(null);
  const { toast } = useToast();

  const processFile = async (file: File) => {
    setIsProcessing(true);
    
    try {
      toast({
        title: "Processando PDF...",
        description: "Extraindo informações do recibo"
      });

      // Simular delay de processamento
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Dados simulados extraídos do PDF
      const mockExtractedData = {
        cliente: {
          nome: "Leia Carolina Alves Costa Pinheiro dos Santos",
          empresa: "LIKE CAR SOUND",
          cnpj: "35.508.891/0001-76",
          endereco: "Avenida Bartholomeu de Carlos, Nº 333 - Jardim Flor da Montanha - Guarulhos/SP - CEP 07097-420",
          telefone: "(11) 4574-0701 / (11) 96571-8757",
          email: "leyaraphaella@gmail.com"
        },
        pedido: {
          numero: "1496",
          data: "15/07/2025",
          formaPagamento: "3x de R$ 707,00 (vencimentos: 14/08/2025, 13/09/2025, 13/10/2025)"
        },
        produtos: [
          {
            descricao: "Camera Re 160° Dinamic",
            codigo: "CR531",
            quantidade: 3,
            unitario: 65.85,
            desconto: 2.81,
            total: 192.00
          },
          {
            descricao: "Smart Box 2Gb+32Gb",
            codigo: "SB-232",
            quantidade: 1,
            unitario: 553.50,
            desconto: 4.43,
            total: 529.00
          },
          {
            descricao: "Media Receiver MVH-X3000",
            codigo: "MVH-X3000Br",
            quantidade: 1,
            unitario: 839.82,
            desconto: 28.56,
            total: 600.00
          },
          {
            descricao: "Multimidia 6,2\" DMH-G225BT",
            codigo: "DMH-G225BT",
            quantidade: 1,
            unitario: 1118.43,
            desconto: 28.47,
            total: 800.00
          }
        ],
        totalPedido: "R$ 2.121,00"
      };

      setExtractedData(mockExtractedData);
      onDataExtracted(mockExtractedData);

      toast({
        title: "Dados extraídos com sucesso!",
        description: "Agora adicione as informações do veículo"
      });

    } catch (error) {
      toast({
        title: "Erro ao processar arquivo",
        description: "Não foi possível extrair os dados do PDF",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const onDrop = async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;

    const file = acceptedFiles[0];
    
    if (file.size > maxSize) {
      toast({
        title: "Arquivo muito grande",
        description: `O arquivo deve ter no máximo ${maxSize / (1024 * 1024)}MB`,
        variant: "destructive"
      });
      return;
    }

    setUploadedFile(file);
    onFileSelect(file);

    // Simular upload
    for (let i = 0; i <= 100; i += 10) {
      setUploadProgress(i);
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    // Processar arquivo
    await processFile(file);
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'application/pdf': ['.pdf'] },
    multiple: false
  });

  const removeFile = () => {
    setUploadedFile(null);
    setUploadProgress(0);
    setExtractedData(null);
    setIsProcessing(false);
  };

  if (uploadedFile) {
    return (
      <Card className="w-full">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <FileText className="h-8 w-8 text-primary" />
              <div>
                <p className="font-medium">{uploadedFile.name}</p>
                <p className="text-sm text-muted-foreground">
                  {(uploadedFile.size / (1024 * 1024)).toFixed(2)} MB
                </p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={removeFile}
              className="h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {isProcessing && (
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-primary border-t-transparent"></div>
                <span className="text-sm">Extraindo dados do PDF...</span>
              </div>
              <div className="w-full bg-secondary rounded-full h-2">
                <div 
                  className="bg-primary h-2 rounded-full transition-all duration-300"
                  style={{ width: '60%' }}
                ></div>
              </div>
            </div>
          )}

          {extractedData && (
            <div className="mt-4 p-4 bg-secondary rounded-lg">
              <h3 className="font-medium text-primary mb-2">Dados Extraídos:</h3>
              <div className="space-y-1 text-sm">
                <p><strong>Cliente:</strong> {extractedData.cliente.nome}</p>
                <p><strong>Pedido:</strong> #{extractedData.pedido.numero}</p>
                <p><strong>Total:</strong> {extractedData.totalPedido}</p>
                <p><strong>Produtos:</strong> {extractedData.produtos.length} itens</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardContent className="p-6">
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
            isDragActive 
              ? 'border-primary bg-primary/5' 
              : 'border-muted-foreground/25 hover:border-primary/50'
          }`}
        >
          <input {...getInputProps()} />
          <Upload className={`mx-auto h-12 w-12 mb-4 ${
            isDragActive ? 'text-primary' : 'text-muted-foreground'
          }`} />
          <h3 className="text-lg font-medium mb-2">{title}</h3>
          <p className="text-muted-foreground mb-4">{description}</p>
          <Button variant="outline">
            Selecionar Arquivo PDF
          </Button>
          <p className="text-xs text-muted-foreground mt-2">
            Máximo {maxSize / (1024 * 1024)}MB
          </p>
        </div>
      </CardContent>
    </Card>
  );
};