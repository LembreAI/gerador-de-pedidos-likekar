export interface Product {
  id: string;
  descricao: string;
  quantidade: number;
  valor_unitario: number;
  valor_total: number;
  instalador_id?: string;
  instalador_nome?: string;
}

export interface ProductWithInstaller extends Product {
  instalador_id?: string;
  instalador_nome?: string;
  comissao_instalador?: number;
  comissao_calculada?: number;
}