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
  // Debug information
  debugInfo?: {
    fullText: string;
    pagesProcessed: number;
    textLength: number;
  };
}

export async function extractDataFromPDF(file: File, useAI = true): Promise<ExtractedData> {
  console.log('🚀 Iniciando extração de PDF:', file.name, useAI ? '(com IA)' : '(regex)');
  
  if (useAI) {
    return await extractWithAI(file);
  }
  
  // Fallback para extração com regex (método antigo)
  return await extractWithRegex(file);
}

async function extractWithAI(file: File): Promise<ExtractedData> {
  try {
    console.log('🤖 Convertendo PDF para base64...');
    
    // Converter arquivo para base64
    const arrayBuffer = await file.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);
    let binary = '';
    const chunkSize = 0x8000;
    
    for (let i = 0; i < uint8Array.length; i += chunkSize) {
      const chunk = uint8Array.subarray(i, Math.min(i + chunkSize, uint8Array.length));
      binary += String.fromCharCode.apply(null, Array.from(chunk));
    }
    
    const base64 = btoa(binary);
    console.log('📁 PDF convertido para base64, tamanho:', base64.length);

    // Chamada para edge function
    const response = await fetch('/functions/v1/extract-pdf-with-ai', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        pdfBase64: base64
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('❌ Erro na API:', errorData);
      throw new Error(errorData.error || 'Falha na extração via IA');
    }

    const { extractedData } = await response.json();
    console.log('✅ Dados extraídos via IA:', extractedData);

    return extractedData;

  } catch (error) {
    console.error('❌ Erro na extração via IA:', error);
    console.log('🔄 Tentando fallback com regex...');
    return await extractWithRegex(file);
  }
}

async function extractWithRegex(file: File): Promise<ExtractedData> {
  try {
    console.log('🚀 Iniciando processamento regex do PDF:', file.name, 'Tamanho:', file.size);
    
    // Configure PDF.js worker
    pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
      'pdfjs-dist/build/pdf.worker.mjs',
      import.meta.url
    ).toString();
    
    const arrayBuffer = await file.arrayBuffer();
    console.log('📦 ArrayBuffer criado, tamanho:', arrayBuffer.byteLength);
    
    const pdf = await pdfjsLib.getDocument({ 
      data: arrayBuffer,
      verbosity: 0
    }).promise;
    
    console.log('📄 PDF carregado, número de páginas:', pdf.numPages);
    
    let fullText = '';
    
    // Extract text from all pages
    for (let i = 1; i <= pdf.numPages; i++) {
      console.log(`📃 Processando página ${i}/${pdf.numPages}`);
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      const pageText = textContent.items
        .map((item: any) => item.str)
        .join(' ');
      fullText += pageText + '\n';
    }
    
    console.log('📝 Texto extraído, comprimento:', fullText.length);
    console.log('📋 Primeiro trecho do texto:', fullText.substring(0, 300));

    // Extrair dados reais usando padrões melhorados
    const extractedData: ExtractedData = {
      cliente: extractClientData(fullText),
      pedido: extractOrderData(fullText),
      produtos: extractProducts(fullText),
      veiculo: extractVehicleData(fullText),
      equipe: extractTeamData(fullText),
      observacoes: extractObservations(fullText)
    };

    // Validar dados extraídos
    validateExtractedData(extractedData);
    
    console.log('✅ Dados extraídos com sucesso:', {
      cliente: !!extractedData.cliente.nome,
      pedido: !!extractedData.pedido.numero,
      produtos: extractedData.produtos.length,
      veiculo: !!extractedData.veiculo.marca,
      equipe: !!extractedData.equipe.vendedor
    });
    
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

function extractPattern(text: string, pattern: RegExp, label = ''): string {
  const match = text.match(pattern);
  const result = match ? match[1].trim() : '';
  
  if (label && result) {
    console.log(`🎯 ${label} extraído: "${result}"`);
  } else if (label) {
    console.log(`❌ ${label} não encontrado`);
  }
  
  return result;
}

function extractClientData(text: string) {
  console.log('👤 Extraindo dados do cliente...');
  
  const clientData = {
    nome: extractPattern(text, /(?:cliente|para|destinatário|nome)[:\s]*([A-ZÁÊÃÇÕ][A-Za-zÀ-ÿ\s]{5,})(?:\s+(?:cpf|cnpj|rg|telefone|tel|fone|endereço)|\n|$)/i, 'Nome do cliente') ||
          extractPattern(text, /^([A-ZÁÊÃÇÕ][A-Za-zÀ-ÿ\s]{8,}?)(?:\s+\d|\n)/m, 'Nome alternativo') ||
          extractPattern(text, /nome[:\s]*([A-ZÁÊÃÇÕ][A-Za-zÀ-ÿ\s]{5,})/i, 'Nome simples'),
    cpfCnpj: extractPattern(text, /(?:cpf|cnpj)[:\s]*([0-9\.\-\/\s]{11,18})/i, 'CPF/CNPJ') ||
             extractPattern(text, /([0-9]{3}\.[0-9]{3}\.[0-9]{3}\-[0-9]{2})/i, 'CPF formato') ||
             extractPattern(text, /([0-9]{2}\.[0-9]{3}\.[0-9]{3}\/[0-9]{4}\-[0-9]{2})/i, 'CNPJ formato'),
    endereco: extractPattern(text, /(?:endereço|endereco|rua|av|avenida)[:\s]*([^\n\r]+)/i, 'Endereço'),
    telefone: extractPattern(text, /(?:telefone|tel|fone|celular)[:\s]*([0-9\(\)\s\-]{8,})/i, 'Telefone') ||
              extractPattern(text, /(\([0-9]{2}\)\s*[0-9]{4,5}\-[0-9]{4})/i, 'Telefone formato'),
    email: extractPattern(text, /(?:e-mail|email)[:\s]*([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/i, 'Email')
  };
  
  return clientData;
}

function extractOrderData(text: string) {
  console.log('📋 Extraindo dados do pedido...');
  
  const orderData = {
    numero: extractPattern(text, /(?:pedido|nº|número|no\.?|order|nota)[:\s#]*([0-9]{2,})/i, 'Número do pedido') ||
            extractPattern(text, /(?:^|\s)([0-9]{3,})\s*(?:pedido|order)/i, 'Número antes da palavra pedido') ||
            extractPattern(text, /(?:código|cod)[:\s]*([0-9]{3,})/i, 'Código do pedido'),
    data: extractPattern(text, /(?:data|emissão|emitido|em)[:\s]*([0-9]{1,2}[\/\-][0-9]{1,2}[\/\-][0-9]{2,4})/i, 'Data do pedido') ||
          extractPattern(text, /([0-9]{1,2}[\/\-][0-9]{1,2}[\/\-][0-9]{4})/i, 'Data formato'),
    formaPagamento: extractPattern(text, /(?:pagamento|forma|condições|condição|parcelado|parcelas)[:\s]*([^\n\r]{3,100})/i, 'Forma de pagamento') ||
                   extractPattern(text, /(\d+x?\s*(?:de\s*)?(?:R\$\s*)?[0-9.,]+)/i, 'Parcelamento') ||
                   extractPattern(text, /(?:à vista|cartão|dinheiro|pix)/i, 'Forma simples')
  };
  
  return orderData;
}

function extractVehicleData(text: string) {
  console.log('🚗 Extraindo dados do veículo...');
  
  const vehicleData = {
    marca: extractPattern(text, /(?:marca|veículo|veiculo)[:\s]*([A-Za-z]+)/i, 'Marca do veículo'),
    modelo: extractPattern(text, /(?:modelo)[:\s]*([A-Za-z0-9\s\-]+)/i, 'Modelo do veículo'),
    placa: extractPattern(text, /(?:placa)[:\s]*([A-Z0-9\s\-]{7,8})/i, 'Placa do veículo'),
    ano: extractPattern(text, /(?:ano)[:\s]*([0-9]{4})/i, 'Ano do veículo'),
    cor: extractPattern(text, /(?:cor)[:\s]*([A-Za-z\s]+)/i, 'Cor do veículo')
  };
  
  return vehicleData;
}

function extractTeamData(text: string) {
  console.log('👥 Extraindo dados da equipe...');
  
  const teamData = {
    instalador: extractPattern(text, /(?:instalador|técnico|responsável)[:\s]*([A-Za-zÀ-ÿ\s]+)/i, 'Instalador'),
    vendedor: extractPattern(text, /(?:vendedor|atendente|consultor|vendedora)[:\s]*([A-Za-zÀ-ÿ\s]+)/i, 'Vendedor')
  };
  
  return teamData;
}

function extractObservations(text: string) {
  console.log('📝 Extraindo observações...');
  
  return extractPattern(text, /(?:observações|observacoes|obs|observação)[:\s]*([^\n\r]{10,})/i, 'Observações');
}

function validateExtractedData(data: ExtractedData) {
  console.log('✔️ Validando dados extraídos...');
  
  const warnings = [];
  
  if (!data.cliente.nome) warnings.push('Nome do cliente não encontrado');
  if (!data.pedido.numero) warnings.push('Número do pedido não encontrado');
  if (data.produtos.length === 0) warnings.push('Nenhum produto encontrado');
  
  if (warnings.length > 0) {
    console.warn('⚠️ Avisos de validação:', warnings);
  } else {
    console.log('✅ Todos os dados principais foram extraídos');
  }
}

function extractProducts(text: string): ExtractedData['produtos'] {
  const products: ExtractedData['produtos'] = [];
  
  console.log('📦 Extraindo produtos do PDF...');
  
  const lines = text.split(/\n|\r/).map(line => line.trim()).filter(line => line);
  
  // Padrões melhorados para diferentes formatos de produtos
  const productPatterns = [
    // Padrão 1: Descrição completa com valores separados
    /^(.{10,}?)\s+([A-Z0-9\-]{3,})\s+(\d+)\s+(?:R\$\s*)?([0-9.,]+)\s+(?:R\$\s*)?([0-9.,]+)\s+(?:R\$\s*)?([0-9.,]+)$/i,
    
    // Padrão 2: Descrição com quantidade e valores
    /^(.{10,}?)\s+(\d+)\s+(?:R\$\s*)?([0-9.,]{3,})\s+(?:R\$\s*)?([0-9.,]{3,})$/i,
    
    // Padrão 3: Linha com produto e valor final
    /^(.{15,}?)\s+(?:R\$\s*)?([0-9.,]{4,})$/i,
    
    // Padrão 4: Produtos com códigos específicos
    /^(\d+\s*-\s*.{10,}?)\s+(?:R\$\s*)?([0-9.,]{3,})$/i
  ];
  
  let inProductSection = false;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    // Detectar início da seção de produtos
    if (!inProductSection && 
        (line.toLowerCase().includes('descrição') || line.toLowerCase().includes('produto')) &&
        (line.toLowerCase().includes('qtd') || line.toLowerCase().includes('valor') || line.toLowerCase().includes('total'))) {
      console.log('📋 Início da seção de produtos:', line);
      inProductSection = true;
      continue;
    }
    
    // Detectar fim da seção de produtos
    if (inProductSection && 
        (line.toLowerCase().includes('subtotal') || 
         line.toLowerCase().includes('total geral') ||
         line.match(/^total\s*:?\s*(?:R\$\s*)?[0-9.,]+$/i))) {
      console.log('🏁 Fim da seção de produtos:', line);
      break;
    }
    
    if (inProductSection) {
      // Tentar cada padrão
      for (let patternIndex = 0; patternIndex < productPatterns.length; patternIndex++) {
        const pattern = productPatterns[patternIndex];
        const match = line.match(pattern);
        
        if (match) {
          console.log(`🎯 Padrão ${patternIndex + 1} encontrado:`, match);
          
          let produto = null;
          
          switch (patternIndex) {
            case 0: // Padrão completo
              produto = {
                descricao: cleanDescription(match[1]),
                codigo: match[2],
                quantidade: parseInt(match[3]) || 1,
                unitario: parseNumber(match[4]),
                desconto: parseNumber(match[5]),
                total: parseNumber(match[6])
              };
              break;
              
            case 1: // Com quantidade e valores
              produto = {
                descricao: cleanDescription(match[1]),
                codigo: `PROD-${products.length + 1}`,
                quantidade: parseInt(match[2]) || 1,
                unitario: parseNumber(match[3]),
                desconto: 0,
                total: parseNumber(match[4])
              };
              break;
              
            case 2: // Descrição e valor
              produto = {
                descricao: cleanDescription(match[1]),
                codigo: `PROD-${products.length + 1}`,
                quantidade: 1,
                unitario: parseNumber(match[2]),
                desconto: 0,
                total: parseNumber(match[2])
              };
              break;
              
            case 3: // Com código no início
              produto = {
                descricao: cleanDescription(match[1]),
                codigo: `PROD-${products.length + 1}`,
                quantidade: 1,
                unitario: parseNumber(match[2]),
                desconto: 0,
                total: parseNumber(match[2])
              };
              break;
          }
          
          if (produto && isValidProduct(produto)) {
            // Calcular valores faltantes
            if (produto.total === 0 && produto.unitario > 0) {
              produto.total = produto.unitario * produto.quantidade;
            } else if (produto.unitario === 0 && produto.total > 0) {
              produto.unitario = produto.total / produto.quantidade;
            }
            
            products.push(produto);
            console.log(`✅ Produto válido extraído: ${produto.descricao} - R$ ${produto.total.toFixed(2)}`);
            break; // Sair do loop de padrões para esta linha
          }
        }
      }
    }
  }
  
  // Fallback para extrair produtos individuais
  if (products.length === 0) {
    console.log('⚠️ Nenhum produto encontrado com padrões estruturados. Buscando produtos individuais...');
    
    // Buscar linhas que contenham palavras-chave de produtos automotivos com valores
    const automotiveKeywords = [
      'camera', 'câmera', 'sensor', 'central', 'alarme', 'trava', 
      'multimidia', 'multimídia', 'dvd', 'gps', 'som', 'auto falante',
      'módulo', 'modulo', 'chicote', 'antena', 'controle', 'pioneer',
      'kenwood', 'sony', 'jvc', 'alpine', 'positron'
    ];
    
    for (const line of lines) {
      const lowerLine = line.toLowerCase();
      
      // Verificar se a linha contém palavras-chave e valores monetários
      const hasKeyword = automotiveKeywords.some(keyword => lowerLine.includes(keyword));
      const hasValue = /(?:R\$\s*)?[0-9]{2,}[.,][0-9]{2}/.test(line);
      
      if (hasKeyword && hasValue && line.length > 10) {
        console.log(`🔍 Possível produto encontrado na linha: ${line}`);
        
        // Extrair valores da linha
        const valores = line.match(/(?:R\$\s*)?([0-9]{2,}[.,][0-9]{2})/g);
        if (valores && valores.length > 0) {
          const valor = parseNumber(valores[valores.length - 1]);
          if (valor > 0) {
            // Limpar descrição removendo números e valores
            let descricao = line.replace(/(?:R\$\s*)?[0-9.,]+/g, '').trim();
            descricao = cleanDescription(descricao);
            
            if (descricao.length > 5) {
              products.push({
                descricao: descricao,
                codigo: `PROD-${products.length + 1}`,
                quantidade: 1,
                unitario: valor,
                desconto: 0,
                total: valor
              });
              console.log(`✅ Produto individual extraído: ${descricao} - R$ ${valor.toFixed(2)}`);
            }
          }
        }
      }
    }
  }
  
  console.log(`📦 Total de produtos extraídos: ${products.length}`);
  
  if (products.length === 0) {
    console.log('❌ NENHUM produto foi encontrado no PDF. Verifique se:');
    console.log('   • O PDF contém uma tabela de produtos');
    console.log('   • Os valores estão no formato correto (R$ XX,XX)');
    console.log('   • O texto do PDF é legível (não é uma imagem)');
  }
  
  return products;
}

function cleanDescription(text: string): string {
  return text
    .replace(/^\d+\s*-?\s*/, '') // Remove números no início
    .replace(/\s+/g, ' ') // Remove espaços extras
    .trim();
}

function parseNumber(value: string): number {
  if (!value) return 0;
  
  // Remove tudo exceto números, vírgulas e pontos
  const cleanValue = value.replace(/[^\d.,]/g, '');
  
  // Se tem vírgula como decimal (formato brasileiro)
  if (cleanValue.includes(',') && !cleanValue.includes('.')) {
    return parseFloat(cleanValue.replace(',', '.')) || 0;
  }
  
  // Se tem ponto como decimal
  return parseFloat(cleanValue) || 0;
}

function isValidProduct(produto: any): boolean {
  return produto.descricao && 
         produto.descricao.length > 3 && 
         (produto.total > 0 || produto.unitario > 0) &&
         produto.quantidade > 0;
}