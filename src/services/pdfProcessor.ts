import * as pdfjsLib from 'pdfjs-dist';

export interface ExtractedData {
  cliente: {
    nome: string;
    cpfCnpj: string;
    endereco: string;
    telefone: string;
    email: string;
  };
  pedido: {
    numero: string;
    data: string;
    formaPagamento: string;
  };
  produtos: Array<{
    descricao: string;
    codigo: string;
    quantidade: number;
    unitario: number;
    desconto: number;
    total: number;
  }>;
  veiculo: {
    marca: string;
    modelo: string;
    placa: string;
    ano: string;
    cor: string;
  };
  equipe: {
    instalador: string;
    vendedor: string;
  };
  observacoes: string;
}

export async function extractDataFromPDF(file: File): Promise<ExtractedData> {
  try {
    console.log('Iniciando processamento do PDF:', file.name, 'Tamanho:', file.size);
    
    // Configure PDF.js worker - use local path instead of CDN
    pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
      'pdfjs-dist/build/pdf.worker.mjs',
      import.meta.url
    ).toString();
    
    const arrayBuffer = await file.arrayBuffer();
    console.log('ArrayBuffer criado, tamanho:', arrayBuffer.byteLength);
    
    const pdf = await pdfjsLib.getDocument({ 
      data: arrayBuffer,
      verbosity: 0 // Reduzir logs do PDF.js
    }).promise;
    
    console.log('PDF carregado, número de páginas:', pdf.numPages);
    
    let fullText = '';
    
    // Extract text from all pages
    for (let i = 1; i <= pdf.numPages; i++) {
      console.log(`Processando página ${i}/${pdf.numPages}`);
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      const pageText = textContent.items
        .map((item: any) => item.str)
        .join(' ');
      fullText += pageText + '\n';
    }
    
    console.log('Texto extraído, comprimento:', fullText.length);
    console.log('Primeiro trecho do texto:', fullText.substring(0, 200));

    // Extrair dados usando regex patterns
    const extractedData: ExtractedData = {
      cliente: {
        nome: extractPattern(fullText, /nome[:\s]+([^\n\r]+)/i) || '',
        cpfCnpj: extractPattern(fullText, /(?:cpf|cnpj)[:\s]+([0-9\.\-\/]+)/i) || '',
        endereco: extractPattern(fullText, /endere[çc]o[:\s]+([^\n\r]+)/i) || '',
        telefone: extractPattern(fullText, /telefone[:\s]+([0-9\(\)\s\-]+)/i) || '',
        email: extractPattern(fullText, /e?-?mail[:\s]+([^\s\n\r]+@[^\s\n\r]+)/i) || '',
      },
      pedido: {
        numero: extractPattern(fullText, /(?:pedido|n[úu]mero)[:\s]+([0-9]+)/i) || '',
        data: extractPattern(fullText, /data[:\s]+([0-9]{1,2}[\/\-][0-9]{1,2}[\/\-][0-9]{2,4})/i) || '',
        formaPagamento: extractPattern(fullText, /(?:pagamento|forma)[:\s]+([^\n\r]+)/i) || '',
      },
      produtos: extractProducts(fullText),
      veiculo: {
        marca: extractPattern(fullText, /marca[:\s]+([^\n\r]+)/i) || '',
        modelo: extractPattern(fullText, /modelo[:\s]+([^\n\r]+)/i) || '',
        placa: extractPattern(fullText, /placa[:\s]+([A-Z0-9\s\-]+)/i) || '',
        ano: extractPattern(fullText, /ano[:\s]+([0-9]{4})/i) || '',
        cor: extractPattern(fullText, /cor[:\s]+([^\n\r]+)/i) || '',
      },
      equipe: {
        instalador: extractPattern(fullText, /instalador[:\s]+([^\n\r]+)/i) || '',
        vendedor: extractPattern(fullText, /vendedor[:\s]+([^\n\r]+)/i) || '',
      },
      observacoes: extractPattern(fullText, /observa[çc][õo]es?[:\s]+([^\n\r]+)/i) || '',
    };

    console.log('Dados extraídos:', extractedData);
    
    return extractedData;
  } catch (error) {
    console.error('Erro detalhado ao processar PDF:', error);
    
    // Verificar se é um erro específico do PDF.js
    if (error instanceof Error) {
      if (error.message.includes('Invalid PDF')) {
        throw new Error('O arquivo não é um PDF válido ou está corrompido.');
      } else if (error.message.includes('worker')) {
        throw new Error('Erro ao carregar o processador de PDF. Tente novamente.');
      } else if (error.message.includes('password')) {
        throw new Error('O PDF está protegido por senha. Remova a proteção e tente novamente.');
      }
    }
    
    throw new Error(`Erro ao processar PDF: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
  }
}

function extractPattern(text: string, pattern: RegExp): string {
  const match = text.match(pattern);
  return match ? match[1].trim() : '';
}

function extractProducts(text: string): ExtractedData['produtos'] {
  const products: ExtractedData['produtos'] = [];
  
  // Tentar extrair produtos de uma tabela
  const lines = text.split('\n');
  let inProductTable = false;
  
  for (const line of lines) {
    // Detectar início de tabela de produtos
    if (line.toLowerCase().includes('descrição') && line.toLowerCase().includes('quantidade')) {
      inProductTable = true;
      continue;
    }
    
    if (inProductTable && line.trim()) {
      // Parar se encontrar uma nova seção
      if (line.toLowerCase().includes('total') || line.toLowerCase().includes('observ')) {
        break;
      }
      
      // Tentar extrair dados do produto
      const productMatch = line.match(/(.+?)\s+([A-Z0-9]+)?\s+(\d+)\s+R?\$?\s*([0-9.,]+)\s+(\d+%?)?\s+R?\$?\s*([0-9.,]+)/i);
      
      if (productMatch) {
        products.push({
          descricao: productMatch[1]?.trim() || '',
          codigo: productMatch[2]?.trim() || '',
          quantidade: parseInt(productMatch[3]) || 1,
          unitario: parseFloat(productMatch[4]?.replace(',', '.')) || 0,
          desconto: parseInt(productMatch[5]?.replace('%', '')) || 0,
          total: parseFloat(productMatch[6]?.replace(',', '.')) || 0,
        });
      }
    }
  }
  
  return products;
}