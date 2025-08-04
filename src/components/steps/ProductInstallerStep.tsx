import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
import { Package, User, DollarSign } from "lucide-react";
import { useInstaladores } from "@/contexts/InstalladoresContext";
interface ProductWithInstaller {
  id: string;
  descricao: string;
  quantidade: number;
  valor_unitario: number;
  valor_total: number;
  instalador_id?: string;
  instalador_nome?: string;
  comissao_calculada?: number;
}
interface ProductInstallerStepProps {
  products: any[];
  onProductInstallersChange: (products: ProductWithInstaller[]) => void;
}
export function ProductInstallerStep({
  products,
  onProductInstallersChange
}: ProductInstallerStepProps) {
  const {
    instaladores
  } = useInstaladores();
  const [productsWithInstallers, setProductsWithInstallers] = useState<ProductWithInstaller[]>([]);
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  // Inicializar produtos quando a prop mudar
  useEffect(() => {
    if (products && products.length > 0) {
      const formattedProducts = products.map((produto, index) => {
        let valorUnitario = 0;
        let valorTotal = 0;

        // Calcular valores baseado nos dados do PDF
        if (produto.unitario !== undefined) {
          valorUnitario = parseFloat(produto.unitario) || 0;
        } else if (produto.total && produto.quantidade) {
          valorUnitario = parseFloat(produto.total) / (produto.quantidade || 1);
        }
        valorTotal = valorUnitario * (produto.quantidade || 1);
        return {
          id: `produto-${index}`,
          descricao: produto.descricao || 'Produto',
          quantidade: produto.quantidade || 1,
          valor_unitario: valorUnitario,
          valor_total: valorTotal,
          instalador_id: undefined,
          instalador_nome: undefined,
          comissao_calculada: 0
        };
      });
      setProductsWithInstallers(formattedProducts);
      onProductInstallersChange(formattedProducts);
    }
  }, [products]);
  const updateProductInstaller = (productId: string, installerId: string | undefined) => {
    const updatedProducts = productsWithInstallers.map(product => {
      if (product.id === productId) {
        const installer = instaladores.find(i => i.id === installerId);
        const comissaoCalculada = installer ? product.valor_total * (installer.comissao / 100) : 0;
        return {
          ...product,
          instalador_id: installerId,
          instalador_nome: installer?.nome,
          comissao_calculada: comissaoCalculada
        };
      }
      return product;
    });
    setProductsWithInstallers(updatedProducts);
    onProductInstallersChange(updatedProducts);
  };
  const totalCommissions = productsWithInstallers.reduce((sum, product) => sum + (product.comissao_calculada || 0), 0);
  const productsWithInstaller = productsWithInstallers.filter(p => p.instalador_id).length;
  return <div className="space-y-6">
      {/* Resumo */}
      

      {/* Lista de Produtos */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Atribuir Instaladores por Produto
          </CardTitle>
          <CardDescription>
            Selecione o instalador responsável por cada produto para calcular as comissões individuais
          </CardDescription>
        </CardHeader>
        <CardContent>
          {productsWithInstallers.length === 0 ? <div className="text-center py-8 text-muted-foreground">
              Nenhum produto encontrado
            </div> : <div className="space-y-4">
              {productsWithInstallers.map(product => <div key={product.id} className="flex flex-col lg:flex-row lg:items-center gap-4 p-4 border rounded-lg hover:bg-accent/50 transition-colors">
                  {/* Informações do Produto */}
                  <div className="flex-1 space-y-2">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                      <h3 className="font-semibold text-base">{product.descricao}</h3>
                      <Badge variant="outline">Qtd: {product.quantidade}</Badge>
                    </div>
                    
                    <div className="text-sm text-muted-foreground space-y-1">
                      <div>Valor unitário: {formatCurrency(product.valor_unitario)}</div>
                      <div className="font-medium text-foreground">
                        Valor total: {formatCurrency(product.valor_total)}
                      </div>
                    </div>
                  </div>

                  <Separator orientation="vertical" className="hidden lg:block h-16" />

                  {/* Seleção de Instalador */}
                  <div className="flex flex-col sm:flex-row sm:items-center gap-3 lg:w-80">
                    <div className="flex-1">
                      <Label className="text-sm font-medium mb-1 block">Instalador</Label>
                      <Select value={product.instalador_id || "none"} onValueChange={value => updateProductInstaller(product.id, value === "none" ? undefined : value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecionar instalador" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">Nenhum instalador</SelectItem>
                          {instaladores.map(installer => <SelectItem key={installer.id} value={installer.id}>
                              {installer.nome} ({installer.comissao}%)
                            </SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Comissão Calculada */}
                    <div className="text-center sm:text-right">
                      <div className="text-sm text-muted-foreground">Comissão</div>
                      <div className="text-lg font-bold text-green-600">
                        {formatCurrency(product.comissao_calculada || 0)}
                      </div>
                      {product.instalador_id && <div className="text-xs text-muted-foreground">
                          {instaladores.find(i => i.id === product.instalador_id)?.comissao || 0}%
                        </div>}
                    </div>
                  </div>
                </div>)}
            </div>}
        </CardContent>
      </Card>
    </div>;
}