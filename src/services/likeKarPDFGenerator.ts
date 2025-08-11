import { PDFDocument, rgb, StandardFonts, PDFImage, PDFPage } from 'pdf-lib';

// Dados da empresa Like Kar
const empresaDados = {
  nome: "Like Kar - Som e Acessorios | Estetica Automotiva",
  endereco: "Endereco: Avenida Bartolomeu de Carlos, 333 - Guarulhos/SP - CEP: 07097-420",
  contato: "Telefone: (11) 4574-0701  |  E-mail: likekarsuporte@gmail.com"
};

// Interface para os dados do pedido
export interface PedidoData {
  cliente: {
    nome: string;
    empresa?: string;
    cnpj?: string;
    endereco?: string;
    telefone?: string;
    email?: string;
  };
  pedido: {
    numero: string;
    data: string;
    formaPagamento: string;
  };
  veiculo: {
    marca: string;
    modelo: string;
    cor?: string;
    ano?: string;
    placa?: string;
  };
  responsaveis: {
    vendedor: string;
  };
  produtos: Array<{
    descricao: string;
    codigo: string;
    quantidade: number;
    unitario: number;
    desconto: number;
    total: number;
  }>;
  observacoes?: string;
  produtosComInstaladores?: any[];
}

export class LikeKarPDFGenerator {
  private doc!: PDFDocument;
  private boldFont: any;
  private regularFont: any;
  private page!: PDFPage;
  private yPosition: number = 800;
  private logoImage!: PDFImage;

  async initialize() {
    this.doc = await PDFDocument.create();
    this.boldFont = await this.doc.embedFont(StandardFonts.HelveticaBold);
    this.regularFont = await this.doc.embedFont(StandardFonts.Helvetica);
    
    // Carregar logo
    try {
      const logoUrl = '/lovable-uploads/9c97deab-6676-4365-af2a-fc78ae359dc5.png';
      const logoImageBytes = await fetch(logoUrl).then(res => res.arrayBuffer());
      this.logoImage = await this.doc.embedPng(logoImageBytes);
    } catch (error) {
      console.warn('Logo não encontrada, usando placeholder');
    }
  }

  private addHeader() {
    this.page = this.doc.addPage([595.28, 841.89]); // A4
    this.yPosition = 820; // Posição inicial centralizada
    
    // Logo pequena centralizada
    if (this.logoImage) {
      this.page.drawImage(this.logoImage, {
        x: 70, // Centralizado
        y: this.yPosition  -  15, // Logo mais para cima
        width:65,
        height: 65,
      });
    }

    // Posicionar texto da empresa centralizado
    this.page.drawText(empresaDados.nome, {
      x: 150, // Melhor centralizado
      y: this.yPosition - 15, // Alinhado com a logo
      size: 12,
      font: this.boldFont,
      color: rgb(0, 0, 0),
    });

    this.page.drawText(empresaDados.endereco, {
      x: 150,
      y: this.yPosition - 30,
      size: 10,
      font: this.regularFont,
      color: rgb(0, 0, 0),
    });

    this.page.drawText(empresaDados.contato, {
      x: 150,
      y: this.yPosition - 43,
      size: 10,
      font: this.regularFont,
      color: rgb(0, 0, 0),
    });

    this.yPosition -= 80; // Espaço após cabeçalho reduzido
  }

  private addDadosCliente(data: PedidoData) {
    // Título da seção centralizado
    this.page.drawText('Dados do Cliente', {
      x: 50,
      y: this.yPosition,
      size: 11,
      font: this.boldFont,
      color: rgb(0, 0, 0),
    });

    this.yPosition -= 22;

    // Criar texto do cliente como multi-line
    const clienteTexto = [
      `Nome: ${data.cliente.nome}`,
      ...(data.cliente.empresa ? [`Empresa: ${data.cliente.empresa}`] : []),
      ...(data.cliente.cnpj ? [`CNPJ: ${data.cliente.cnpj}`] : []),
      ...(data.cliente.endereco ? [`Endereço: ${data.cliente.endereco}`] : []),
      ...(data.cliente.telefone ? [`Telefone: ${data.cliente.telefone}`] : []),
      ...(data.cliente.email ? [`E-mail: ${data.cliente.email}`] : []),
    ].join('\n');

    // Desenhar texto multi-linha centralizado
    const lines = clienteTexto.split('\n');
    lines.forEach((line) => {
      this.page.drawText(line, {
        x: 50,
        y: this.yPosition,
        size: 10,
        font: this.regularFont,
        color: rgb(0, 0, 0),
      });
      this.yPosition -= 17;
    });

    this.yPosition -= 11;
  }

  private addDetalhesPedido(data: PedidoData) {
    // Título da seção centralizado
    this.page.drawText('Detalhes do Pedido', {
      x: 50,
      y: this.yPosition,
      size: 11,
      font: this.boldFont,
      color: rgb(0, 0, 0),
    });

    this.yPosition -= 22;

    // Informações do pedido centralizadas
    this.page.drawText(`Número do Pedido: ${data.pedido.numero}`, {
      x: 50,
      y: this.yPosition,
      size: 10,
      font: this.regularFont,
      color: rgb(0, 0, 0),
    });
    this.yPosition -= 17;

    this.page.drawText(`Data do Pedido: ${data.pedido.data}`, {
      x: 50,
      y: this.yPosition,
      size: 10,
      font: this.regularFont,
      color: rgb(0, 0, 0),
    });
    this.yPosition -= 17;

    // Forma de pagamento (multi-line)
    const pagamentoLines = [`Forma de Pagamento:`, data.pedido.formaPagamento];
    pagamentoLines.forEach((line) => {
      this.page.drawText(line, {
        x: 50,
        y: this.yPosition,
        size: 10,
        font: this.regularFont,
        color: rgb(0, 0, 0),
      });
      this.yPosition -= 17;
    });

    this.yPosition -= 11;
  }

  private addTabelaProdutos(data: PedidoData) {
    // Cabeçalho da tabela centralizado
    const headers = ['Descrição', 'Código', 'Qtd', 'Unitário', 'Desconto', 'Total'];
    const columnWidths = [160, 70, 40, 75, 75, 75]; // Larguras reduzidas para caber na página
    let xPosition = 50; // Posição inicial centralizada

    // Desenhar cabeçalho com bordas (border=1)
    headers.forEach((header, index) => {
      // Fundo da célula do cabeçalho
      this.page.drawRectangle({
        x: xPosition,
        y: this.yPosition - 17,
        width: columnWidths[index],
        height: 17,
        color: rgb(0.95, 0.95, 0.95), // Cor de fundo clara
        borderColor: rgb(0, 0, 0),
        borderWidth: 1,
      });

      this.page.drawText(header, {
        x: xPosition + 2,
        y: this.yPosition - 12,
        size: 10,
        font: this.boldFont,
        color: rgb(0, 0, 0),
      });

      xPosition += columnWidths[index];
    });

    this.yPosition -= 17; // Altura da linha do cabeçalho

    // Produtos
    data.produtos.forEach((produto) => {
      xPosition = 50; // Centralizado
      
      // Garantir compatibilidade com estruturas antigas e novas
      const valorUnitario = produto.unitario || (produto as any).valor || 0;
      const desconto = produto.desconto || 0;
      const total = produto.total || 0;
      const quantidade = produto.quantidade || 0;
      
      const rowData = [
        produto.descricao || '',
        produto.codigo || '',
        quantidade.toString(),
        `R$ ${typeof valorUnitario === 'number' ? valorUnitario.toFixed(2).replace('.', ',') : '0,00'}`,
        `${typeof desconto === 'number' ? desconto.toFixed(2) : '0,00'}%`,
        `R$ ${typeof total === 'number' ? total.toFixed(2).replace('.', ',') : '0,00'}`,
      ];

      // Desenhar células da linha com bordas
      rowData.forEach((cell, index) => {
        this.page.drawRectangle({
          x: xPosition,
          y: this.yPosition - 17,
          width: columnWidths[index],
          height: 17,
          color: rgb(1, 1, 1), // Fundo branco
          borderColor: rgb(0, 0, 0),
          borderWidth: 1,
        });

        this.page.drawText(cell, {
          x: xPosition + 2,
          y: this.yPosition - 12,
          size: 10,
          font: this.regularFont,
          color: rgb(0, 0, 0),
        });
        xPosition += columnWidths[index];
      });

      this.yPosition -= 17; // Altura da linha
    });

    this.yPosition -= 11; // ln(4) extra space
  }

  private addRodapeVeiculo(data: PedidoData) {
    // Informações do veículo e responsáveis centralizadas
    const infos = [
      ['Veículo do Cliente', `${data.veiculo.marca} ${data.veiculo.modelo}${data.veiculo.cor ? ` | Cor: ${data.veiculo.cor}` : ''}${data.veiculo.ano ? ` | Ano: ${data.veiculo.ano}` : ''}`],
      ['Placa', data.veiculo.placa || ''],
      ['Vendedor', data.responsaveis.vendedor],
    ];

    const labelWidth = 120;
    const valueWidth = 375; // Largura ajustada para centralização

    infos.forEach(([label, value]) => {
      // Célula do label centralizada
      this.page.drawRectangle({
        x: 50, // Centralizado
        y: this.yPosition - 22,
        width: labelWidth,
        height: 22,
        color: rgb(0.95, 0.95, 0.95),
        borderColor: rgb(0, 0, 0),
        borderWidth: 1,
      });

      this.page.drawText(label, {
        x: 52,
        y: this.yPosition - 15,
        size: 10,
        font: this.boldFont,
        color: rgb(0, 0, 0),
      });

      // Célula do valor centralizada
      this.page.drawRectangle({
        x: 50 + labelWidth,
        y: this.yPosition - 22,
        width: valueWidth,
        height: 22,
        color: rgb(1, 1, 1),
        borderColor: rgb(0, 0, 0),
        borderWidth: 1,
      });

      this.page.drawText(value, {
        x: 52 + labelWidth,
        y: this.yPosition - 15,
        size: 10,
        font: this.regularFont,
        color: rgb(0, 0, 0),
      });

      this.yPosition -= 22;
    });
  }


  async generatePDF(data: PedidoData): Promise<Uint8Array> {
    await this.initialize();
    
    // Adicionar página e cabeçalho
    this.addHeader();
    
    // Seguir ordem exata do modelo Python
    this.addDadosCliente(data);
    this.addDetalhesPedido(data);
    this.addTabelaProdutos(data);
    this.addRodapeVeiculo(data);

    return await this.doc.save();
  }
}

// Função de conveniência para gerar PDF
export async function generateLikeKarPDF(data: PedidoData): Promise<Uint8Array> {
  const generator = new LikeKarPDFGenerator();
  return await generator.generatePDF(data);
}