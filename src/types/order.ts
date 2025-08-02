export interface Order {
  id: string;
  numero: string;
  data: string;
  cliente: string;
  carro: string;
  valor: string;
  status: 'Pendente' | 'Em andamento' | 'Concluído';
  extractedData: any;
  vehicleData: any;
  pdfBlob?: Blob;
  createdAt: string;
  updatedAt: string;
}