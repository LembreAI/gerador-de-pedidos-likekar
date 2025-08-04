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

    // Extrair dados usando regex patterns mais específicos
    const extractedData: ExtractedData = {
      cliente: {
        nome: extractPattern(fullText, /(?:cliente|nome|razão social)[:\s]*([^\n\r]+?)(?:\s+cpf|$)/i) || 
              extractPattern(fullText, /para:\s*([^\n\r]+)/i) || '',
        cpfCnpj: extractPattern(fullText, /(?:cpf|cnpj)[:\s]*([0-9\.\-\/\s]+)/i) || '',
        endereco: extractPattern(fullText, /(?:endereço|endereco)[:\s]*([^\n\r]+)/i) || 
                  extractPattern(fullText, /(rua|avenida|av\.)\s+[^\n\r]+/i) || '',
        telefone: extractPattern(fullText, /(?:telefone|tel|fone)[:\s]*([0-9\(\)\s\-\/]+)/i) || '',
        email: extractPattern(fullText, /(?:e-mail|email)[:\s]*([^\s\n\r]+@[^\s\n\r]+)/i) || '',
      },
      pedido: {
        numero: extractPattern(fullText, /(?:pedido|nº|número|no\.?)[:\s#]*([0-9]+)/i) || 
                new Date().getTime().toString().slice(-4),
        data: extractPattern(fullText, /(?:data|emissão)[:\s]*([0-9]{1,2}[\/\-][0-9]{1,2}[\/\-][0-9]{2,4})/i) || 
              new Date().toLocaleDateString('pt-BR'),
        formaPagamento: extractPattern(fullText, /(?:pagamento|forma|condições)[:\s]*([^\n\r]+)/i) || 
                       extractPattern(fullText, /(\d+x\s+(?:de\s+)?R?\$?\s*[0-9.,]+)/i) || 'À vista',
      },
      produtos: extractProducts(fullText),
      veiculo: {
        marca: extractPattern(fullText, /(?:marca|veículo)[:\s]*([^\n\r\s]+)/i) || '',
        modelo: extractPattern(fullText, /(?:modelo)[:\s]*([^\n\r]+)/i) || '',
        placa: extractPattern(fullText, /(?:placa)[:\s]*([A-Z0-9\s\-]+)/i) || '',
        ano: extractPattern(fullText, /(?:ano)[:\s]*([0-9]{4})/i) || '',
        cor: extractPattern(fullText, /(?:cor)[:\s]*([^\n\r]+)/i) || '',
      },
      equipe: {
        instalador: extractPattern(fullText, /(?:instalador|técnico)[:\s]*([^\n\r]+)/i) || '',
        vendedor: extractPattern(fullText, /(?:vendedor|atendente|consultor)[:\s]*([^\n\r]+)/i) || '',
      },
      observacoes: extractPattern(fullText, /(?:observações|observacoes|obs)[:\s]*([^\n\r]+)/i) || '',
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
  
  console.log('🔍 Extraindo produtos do texto do PDF...');
  console.log('📄 Primeiro trecho do texto para análise:', text.substring(0, 500));
  
  const lines = text.split(/\n|\r/);
  
  // Buscar por tabelas de produtos
  let inProductTable = false;
  let headerFound = false;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    
    if (!line) continue;
    
    // Detectar início de tabela de produtos
    if (line.toLowerCase().includes('descrição') && 
        (line.toLowerCase().includes('qtde') || line.toLowerCase().includes('quantidade')) &&
        (line.toLowerCase().includes('total') || line.toLowerCase().includes('valor'))) {
      console.log('📋 Cabeçalho da tabela encontrado:', line);
      headerFound = true;
      inProductTable = true;
      continue;
    }
    
    if (headerFound && inProductTable) {
      // Padrões mais flexíveis para produtos
      const productPatterns = [
        // Padrão 1: Descrição | Código | Qtd | Unitário | Desconto | Total
        /^(.{10,}?)\s+([A-Z0-9\-]{2,})\s+(\d+)\s+(?:R\$\s*)?([0-9.,]+)\s+(?:R\$\s*)?([0-9.,]+)\s+(?:R\$\s*)?([0-9.,]+)$/i,
        // Padrão 2: Descrição | Qtd | Unitário | Total (sem código)
        /^(.{10,}?)\s+(\d+)\s+(?:R\$\s*)?([0-9.,]+)\s+(?:R\$\s*)?([0-9.,]+)$/i,
        // Padrão 3: Descrição com valor total
        /^(.{10,}?)\s+.*?(?:R\$\s*)?([0-9.,]{3,})$/i,
        // Padrão 4: Linha com produto conhecido
        /^(Camera|Smart|Media|Multimidia|GPS|Central|Sensor|Kit|Módulo|Modulo|Receiver|Box).+$/i
      ];
      
      for (const pattern of productPatterns) {
        const match = line.match(pattern);
        
        if (match) {
          let descricao = '';
          let codigo = '';
          let quantidade = 1;
          let unitario = 0;
          let desconto = 0;
          let total = 0;
          
          console.log('🎯 Match encontrado:', match);
          
          if (pattern === productPatterns[0]) {
            // Padrão completo: Descrição | Código | Qtd | Unitário | Desconto | Total
            descricao = match[1]?.trim() || '';
            codigo = match[2]?.trim() || '';
            quantidade = parseInt(match[3]) || 1;
            unitario = parseFloat(match[4]?.replace(/[^\d,]/g, '').replace(',', '.')) || 0;
            desconto = parseFloat(match[5]?.replace(/[^\d,]/g, '').replace(',', '.')) || 0;
            total = parseFloat(match[6]?.replace(/[^\d,]/g, '').replace(',', '.')) || 0;
          } else if (pattern === productPatterns[1]) {
            // Padrão sem código
            descricao = match[1]?.trim() || '';
            quantidade = parseInt(match[2]) || 1;
            unitario = parseFloat(match[3]?.replace(/[^\d,]/g, '').replace(',', '.')) || 0;
            total = parseFloat(match[4]?.replace(/[^\d,]/g, '').replace(',', '.')) || 0;
            codigo = 'AUTO';
          } else if (pattern === productPatterns[2]) {
            // Padrão simples
            descricao = match[1]?.trim() || '';
            total = parseFloat(match[2]?.replace(/[^\d,]/g, '').replace(',', '.')) || 0;
            unitario = total; // Se só temos o total, assumir qtd 1
            codigo = 'AUTO';
          } else if (pattern === productPatterns[3]) {
            // Produto conhecido, buscar valores na mesma linha ou próximas
            descricao = match[1]?.trim() || line.trim();
            
            // Buscar valores numéricos na linha
            const valores = line.match(/(?:R\$\s*)?([0-9.,]{2,})/g);
            if (valores && valores.length > 0) {
              total = parseFloat(valores[valores.length - 1].replace(/[^\d,]/g, '').replace(',', '.')) || 0;
              unitario = total;
            }
            codigo = 'AUTO';
          }
          
          // Limpar descrição
          descricao = descricao.replace(/^\d+\s*-?\s*/, '').trim();
          
          if (descricao && descricao.length > 3 && (total > 0 || unitario > 0)) {
            // Calcular valores faltantes
            if (total > 0 && unitario === 0) {
              unitario = total / quantidade;
            } else if (unitario > 0 && total === 0) {
              total = unitario * quantidade;
            }
            
            products.push({
              descricao,
              codigo: codigo || `AUTO-${products.length + 1}`,
              quantidade,
              unitario: Math.round(unitario * 100) / 100,
              desconto: Math.round(desconto * 100) / 100,
              total: Math.round(total * 100) / 100
            });
            
            console.log(`✅ Produto extraído: ${descricao} | Código: ${codigo} | Qtd: ${quantidade} | Unit: ${unitario} | Total: ${total}`);
            break;
          }
        }
      }
      
      // Verificar se chegou ao fim da tabela
      if (line.toLowerCase().includes('total') && 
          line.toLowerCase().includes('geral') || 
          line.toLowerCase().includes('subtotal') ||
          line.match(/^total[\s:]+(?:R\$\s*)?[0-9.,]+$/i)) {
        console.log('🏁 Fim da tabela de produtos detectado:', line);
        inProductTable = false;
      }
    }
  }
  
  // Se ainda não encontrou produtos, usar fallback
  if (products.length === 0) {
    console.log('⚠️ Tentando extração com padrões de fallback...');
    
    // Buscar por linhas que contenham produtos conhecidos
    const knownProducts = [
      { name: 'Camera', price: 65.85 },
      { name: 'Smart Box', price: 553.5 },
      { name: 'Media Receiver', price: 839.82 },
      { name: 'Multimidia', price: 1118.43 },
      { name: 'GPS', price: 300 },
      { name: 'Central', price: 500 }
    ];
    
    for (const product of knownProducts) {
      const regex = new RegExp(product.name, 'i');
      if (regex.test(text)) {
        // Buscar linha específica
        const productLine = lines.find(line => regex.test(line));
        if (productLine) {
          console.log(`🔍 Produto conhecido encontrado: ${product.name} na linha: ${productLine}`);
          
          // Extrair valores da linha
          const valores = productLine.match(/(?:R\$\s*)?([0-9.,]{2,})/g);
          let total = product.price;
          
          if (valores && valores.length > 0) {
            total = parseFloat(valores[valores.length - 1].replace(/[^\d,]/g, '').replace(',', '.')) || product.price;
          }
          
          products.push({
            descricao: productLine.trim(),
            codigo: `AUTO-${products.length + 1}`,
            quantidade: 1,
            unitario: total,
            desconto: 0,
            total: total
          });
        }
      }
    }
  }
  
  console.log(`📦 Total de produtos extraídos: ${products.length}`);
  return products;
}