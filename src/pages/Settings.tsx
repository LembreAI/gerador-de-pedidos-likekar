import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Save, Building, Users, Bell, Shield, Palette } from "lucide-react";

export default function Settings() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Configurações</h1>
        <p className="text-muted-foreground">
          Gerencie as configurações do sistema
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Settings */}
        <div className="lg:col-span-2 space-y-6">
          {/* Company Settings */}
          <Card className="p-6 bg-gradient-card shadow-elegant">
            <div className="flex items-center gap-2 mb-4">
              <Building className="h-5 w-5 text-primary" />
              <h2 className="text-xl font-semibold">Dados da Empresa</h2>
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="company-name">Nome da Empresa</Label>
                  <Input 
                    id="company-name" 
                    placeholder="ProSales Ltda" 
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="cnpj">CNPJ</Label>
                  <Input 
                    id="cnpj" 
                    placeholder="00.000.000/0000-00" 
                    className="mt-1"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="address">Endereço</Label>
                <Textarea 
                  id="address" 
                  placeholder="Rua das Flores, 123 - Centro"
                  className="mt-1"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="phone">Telefone</Label>
                  <Input 
                    id="phone" 
                    placeholder="(11) 99999-9999" 
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="email">E-mail</Label>
                  <Input 
                    id="email" 
                    placeholder="contato@prosales.com.br" 
                    className="mt-1"
                  />
                </div>
              </div>
            </div>
          </Card>

          {/* User Permissions */}
          <Card className="p-6 bg-gradient-card shadow-elegant">
            <div className="flex items-center gap-2 mb-4">
              <Shield className="h-5 w-5 text-primary" />
              <h2 className="text-xl font-semibold">Permissões</h2>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Permitir edição de pedidos finalizados</Label>
                  <p className="text-sm text-muted-foreground">
                    Vendedores podem editar pedidos já concluídos
                  </p>
                </div>
                <Switch />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <Label>Aprovação automática de pedidos</Label>
                  <p className="text-sm text-muted-foreground">
                    Pedidos são aprovados automaticamente
                  </p>
                </div>
                <Switch defaultChecked />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <Label>Permitir exclusão de pedidos</Label>
                  <p className="text-sm text-muted-foreground">
                    Usuários podem excluir pedidos do sistema
                  </p>
                </div>
                <Switch />
              </div>
            </div>
          </Card>

          {/* Notification Settings */}
          <Card className="p-6 bg-gradient-card shadow-elegant">
            <div className="flex items-center gap-2 mb-4">
              <Bell className="h-5 w-5 text-primary" />
              <h2 className="text-xl font-semibold">Notificações</h2>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>E-mail para novos pedidos</Label>
                  <p className="text-sm text-muted-foreground">
                    Receber e-mail quando um novo pedido for criado
                  </p>
                </div>
                <Switch defaultChecked />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <Label>Notificações push</Label>
                  <p className="text-sm text-muted-foreground">
                    Receber notificações no navegador
                  </p>
                </div>
                <Switch defaultChecked />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <Label>Relatórios semanais</Label>
                  <p className="text-sm text-muted-foreground">
                    Receber relatório semanal de vendas
                  </p>
                </div>
                <Switch />
              </div>
            </div>
          </Card>
        </div>

        {/* Sidebar Settings */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <Card className="p-6 bg-gradient-card shadow-elegant">
            <h3 className="font-semibold mb-4">Ações Rápidas</h3>
            <div className="space-y-3">
              <Button variant="outline" className="w-full justify-start">
                <Users className="h-4 w-4 mr-2" />
                Gerenciar Usuários
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Palette className="h-4 w-4 mr-2" />
                Personalizar Tema
              </Button>
              <Button variant="outline" className="w-full justify-start">
                Backup de Dados
              </Button>
              <Button variant="outline" className="w-full justify-start">
                Exportar Relatórios
              </Button>
            </div>
          </Card>

          {/* System Info */}
          <Card className="p-6 bg-gradient-card shadow-elegant">
            <h3 className="font-semibold mb-4">Informações do Sistema</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Versão:</span>
                <span className="font-medium">2.0.0</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Última atualização:</span>
                <span className="font-medium">15/01/2024</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Usuários ativos:</span>
                <span className="font-medium">8</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Armazenamento:</span>
                <span className="font-medium">2.3 GB</span>
              </div>
            </div>
          </Card>

          {/* Save Button */}
          <Button className="w-full bg-gradient-primary hover:opacity-90">
            <Save className="h-4 w-4 mr-2" />
            Salvar Configurações
          </Button>
        </div>
      </div>
    </div>
  );
}