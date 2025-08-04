import React, { useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Upload, FileText, X, Bug } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { extractDataFromPDF } from '@/services/pdfProcessor';

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
  const [debugMode, setDebugMode] = useState(false);
  const { toast } = useToast();

  const processFile = async (file: File) => {
    setIsProcessing(true);
    
    try {
      toast({
        title: "Processando PDF...",
        description: "Extraindo informações reais do recibo"
      });

      console.log('🚀 Iniciando extração real do PDF:', file.name);
      
      // Usar extração real de PDF
      const extractedData = await extractDataFromPDF(file, debugMode);
      
      setExtractedData(extractedData);
      onDataExtracted(extractedData);

      toast({
        title: "Dados extraídos com sucesso!",
        description: `Extraídos: ${extractedData.produtos.length} produtos, cliente: ${extractedData.cliente.nome || 'Não encontrado'}`,
      });

    } catch (error) {
      console.error('❌ Erro ao processar PDF:', error);
      toast({
        title: "Erro ao processar arquivo",
        description: error instanceof Error ? error.message : "Não foi possível extrair os dados do PDF",
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

  const toggleDebugMode = () => {
    setDebugMode(!debugMode);
    toast({
      title: debugMode ? "Modo Debug Desabilitado" : "Modo Debug Habilitado",
      description: debugMode ? "Logs reduzidos" : "Logs detalhados ativados",
    });
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
            <div className="mt-4 space-y-4">
              <div className="p-4 bg-secondary rounded-lg">
                <h3 className="font-medium text-primary mb-2">Dados Extraídos:</h3>
                <div className="space-y-1 text-sm">
                  <p><strong>Cliente:</strong> {extractedData.cliente.nome || 'Não encontrado'}</p>
                  <p><strong>CPF/CNPJ:</strong> {extractedData.cliente.cpfCnpj || 'Não encontrado'}</p>
                  <p><strong>Pedido:</strong> #{extractedData.pedido.numero || 'Não encontrado'}</p>
                  <p><strong>Data:</strong> {extractedData.pedido.data || 'Não encontrada'}</p>
                  <p><strong>Produtos:</strong> {extractedData.produtos.length} itens</p>
                  {extractedData.produtos.length > 0 && (
                    <p><strong>Total dos produtos:</strong> R$ {extractedData.produtos.reduce((sum, p) => sum + p.total, 0).toFixed(2)}</p>
                  )}
                </div>
              </div>
              
              {debugMode && extractedData.debugInfo && (
                <div className="p-4 bg-muted rounded-lg">
                  <h4 className="font-medium text-destructive mb-2">🔍 Debug Info:</h4>
                  <div className="space-y-2 text-xs">
                    <p><strong>Páginas processadas:</strong> {extractedData.debugInfo.pagesProcessed}</p>
                    <p><strong>Tamanho do texto:</strong> {extractedData.debugInfo.textLength} caracteres</p>
                    <details>
                      <summary className="cursor-pointer font-medium">Texto completo extraído</summary>
                      <pre className="mt-2 p-2 bg-background rounded text-xs overflow-auto max-h-40">
                        {extractedData.debugInfo.fullText}
                      </pre>
                    </details>
                  </div>
                </div>
              )}
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
          <div className="space-y-4">
            <Button variant="outline">
              Selecionar Arquivo PDF
            </Button>
            
            <div className="flex items-center justify-center space-x-2">
              <Button
                variant={debugMode ? "default" : "outline"}
                size="sm"
                onClick={toggleDebugMode}
                className="text-xs"
              >
                <Bug className="h-3 w-3 mr-1" />
                {debugMode ? "Debug ON" : "Debug OFF"}
              </Button>
            </div>
            
            <p className="text-xs text-muted-foreground">
              Máximo {maxSize / (1024 * 1024)}MB • Debug: {debugMode ? "Habilitado" : "Desabilitado"}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};