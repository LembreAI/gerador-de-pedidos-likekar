import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import { ExtractedData } from './pdfProcessor';

export async function generateLikeKarPDF(data: ExtractedData): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([595.28, 841.89]); // A4 size
  
  // Fontes
  const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const regularFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
  
  // Cores
  const primaryYellow = rgb(1, 0.84, 0); // Amarelo
  const black = rgb(0, 0, 0);
  const gray = rgb(0.5, 0.5, 0.5);
  
  let yPosition = 800;
  
  // CABEÇALHO
  // Logo placeholder (seria substituída por logo real)
  page.drawRectangle({
    x: 50,
    y: yPosition - 40,
    width: 80,
    height: 40,
    color: primaryYellow,
  });
  page.drawText('LOGO', {
    x: 70,
    y: yPosition - 25,
    size: 12,
    font: boldFont,
    color: black,
  });
  
  // Dados da empresa
  page.drawText('Like Kar – Som e Acessórios | Estética Automotiva', {
    x: 150,
    y: yPosition - 10,
    size: 14,
    font: boldFont,
    color: black,
  });
  
  page.drawText('Avenida Bartolomeu de Carlos, 333 - Guarulhos/SP - CEP: 07097-420', {
    x: 150,
    y: yPosition - 25,
    size: 10,
    font: regularFont,
    color: black,
  });
  
  page.drawText('Tel: (11) 4574-0701 | E-mail: likekarsuporte@gmail.com', {
    x: 150,
    y: yPosition - 40,
    size: 10,
    font: regularFont,
    color: black,
  });
  
  yPosition -= 70;
  
  // Linha separadora
  page.drawLine({
    start: { x: 50, y: yPosition },
    end: { x: 545, y: yPosition },
    thickness: 2,
    color: primaryYellow,
  });
  
  yPosition -= 30;
  
  // DADOS DO CLIENTE
  page.drawText('DADOS DO CLIENTE', {
    x: 50,
    y: yPosition,
    size: 12,
    font: boldFont,
    color: black,
  });
  
  yPosition -= 20;
  
  const clienteInfo = [
    `Nome: ${data.cliente.nome}`,
    `CPF/CNPJ: ${data.cliente.cpfCnpj}`,
    `Endereço: ${data.cliente.endereco}`,
    `Telefone: ${data.cliente.telefone}`,
    `E-mail: ${data.cliente.email}`,
  ];
  
  clienteInfo.forEach((info) => {
    page.drawText(info, {
      x: 50,
      y: yPosition,
      size: 10,
      font: regularFont,
      color: black,
    });
    yPosition -= 15;
  });
  
  yPosition -= 10;
  
  // DETALHES DO PEDIDO
  page.drawText('DETALHES DO PEDIDO', {
    x: 50,
    y: yPosition,
    size: 12,
    font: boldFont,
    color: black,
  });
  
  yPosition -= 20;
  
  const pedidoInfo = [
    `Número do Pedido: ${data.pedido.numero}`,
    `Data do Pedido: ${data.pedido.data}`,
    `Forma de Pagamento: ${data.pedido.formaPagamento}`,
  ];
  
  pedidoInfo.forEach((info) => {
    page.drawText(info, {
      x: 50,
      y: yPosition,
      size: 10,
      font: regularFont,
      color: black,
    });
    yPosition -= 15;
  });
  
  yPosition -= 20;
  
  // TABELA DE PRODUTOS
  page.drawText('PRODUTOS', {
    x: 50,
    y: yPosition,
    size: 12,
    font: boldFont,
    color: black,
  });
  
  yPosition -= 25;
  
  // Cabeçalho da tabela
  const tableHeaders = ['Descrição', 'Código', 'Qtde', 'Unitário', 'Desc.', 'Total'];
  const columnWidths = [180, 80, 50, 70, 50, 70];
  let xPosition = 50;
  
  // Desenhar cabeçalho
  tableHeaders.forEach((header, index) => {
    page.drawRectangle({
      x: xPosition,
      y: yPosition - 15,
      width: columnWidths[index],
      height: 20,
      color: primaryYellow,
    });
    
    page.drawText(header, {
      x: xPosition + 5,
      y: yPosition - 8,
      size: 9,
      font: boldFont,
      color: black,
    });
    
    xPosition += columnWidths[index];
  });
  
  yPosition -= 20;
  
  // Produtos
  data.produtos.forEach((produto) => {
    xPosition = 50;
    const rowData = [
      produto.descricao.substring(0, 25),
      produto.codigo,
      produto.quantidade.toString(),
      `R$ ${produto.unitario.toFixed(2)}`,
      `${produto.desconto}%`,
      `R$ ${produto.total.toFixed(2)}`,
    ];
    
    rowData.forEach((cell, index) => {
      page.drawText(cell, {
        x: xPosition + 5,
        y: yPosition,
        size: 8,
        font: regularFont,
        color: black,
      });
      xPosition += columnWidths[index];
    });
    
    yPosition -= 15;
  });
  
  yPosition -= 20;
  
  // OBSERVAÇÕES
  if (data.observacoes) {
    page.drawText('OBSERVAÇÕES', {
      x: 50,
      y: yPosition,
      size: 12,
      font: boldFont,
      color: black,
    });
    
    yPosition -= 20;
    
    page.drawText(data.observacoes, {
      x: 50,
      y: yPosition,
      size: 10,
      font: regularFont,
      color: black,
    });
    
    yPosition -= 30;
  }
  
  // INFORMAÇÕES DO VEÍCULO E EQUIPE
  page.drawText('INFORMAÇÕES ADICIONAIS', {
    x: 50,
    y: yPosition,
    size: 12,
    font: boldFont,
    color: black,
  });
  
  yPosition -= 25;
  
  const additionalInfo = [
    ['Veículo', `${data.veiculo.marca} ${data.veiculo.modelo}`],
    ['Placa', data.veiculo.placa],
    ['Instalador', data.equipe.instalador],
    ['Vendedor', data.equipe.vendedor],
  ];
  
  additionalInfo.forEach(([label, value]) => {
    page.drawText(`${label}:`, {
      x: 50,
      y: yPosition,
      size: 10,
      font: boldFont,
      color: black,
    });
    
    page.drawText(value, {
      x: 150,
      y: yPosition,
      size: 10,
      font: regularFont,
      color: black,
    });
    
    yPosition -= 15;
  });
  
  return await pdfDoc.save();
}