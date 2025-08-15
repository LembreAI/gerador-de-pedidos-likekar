import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Loader2, Eye, EyeOff } from "lucide-react";
export interface LightLoginProps {
  email: string;
  password: string;
  showPassword: boolean;
  loading: boolean;
  onEmailChange: (value: string) => void;
  onPasswordChange: (value: string) => void;
  onToggleShowPassword: () => void;
  onSubmit: (e: React.FormEvent) => void;
}
export function LightLogin({
  email,
  password,
  showPassword,
  loading,
  onEmailChange,
  onPasswordChange,
  onToggleShowPassword,
  onSubmit
}: LightLoginProps) {
  return <main className="min-h-screen flex items-center justify-center bg-white p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-sm sm:max-w-md bg-card rounded-2xl shadow-xl overflow-hidden border border-border relative">
        <div className="absolute top-0 left-0 right-0 h-48 bg-gradient-to-b from-[hsl(var(--primary))/0.15] via-[hsl(var(--primary))/0.08] to-transparent opacity-60 blur-3xl -mt-20 pointer-events-none" />
        <div className="p-6 sm:p-8">
          <div className="flex flex-col items-center mb-6 sm:mb-8">
            <div className="bg-background p-3 sm:p-4 rounded-2xl shadow-lg mb-4 sm:mb-6">
              <img
                src="/lovable-uploads/3191f51b-98c4-404b-9b91-5ed9916742ba.png"
                alt="Logo LK"
                className="w-12 h-12 sm:w-16 sm:h-16 object-contain"
              />
            </div>
            <div className="p-0">
              <h2 className="text-xl sm:text-2xl font-bold text-foreground text-center">Bem-vindo de volta</h2>
              <p className="text-center text-muted-foreground mt-2 text-sm sm:text-base">Entre para continuar</p>
            </div>
          </div>

          <form onSubmit={onSubmit} className="space-y-6 p-0">
            <div className="space-y-1">
              <Label className="text-sm" htmlFor="login-email">Email</Label>
              <Input id="login-email" type="email" value={email} onChange={e => onEmailChange(e.target.value)} placeholder="Digite seu email" className="h-12 rounded-lg" required />
            </div>

            <div className="space-y-1">
              <div className="flex justify-between items-center">
                <Label className="text-sm" htmlFor="login-password">Senha</Label>
                <a href="#" className="text-xs text-primary hover:underline">Esqueceu a senha?</a>
              </div>
              <div className="relative">
                <Input id="login-password" type={showPassword ? "text" : "password"} value={password} onChange={e => onPasswordChange(e.target.value)} placeholder="••••••••" className="h-12 rounded-lg pr-12" required />
                <Button type="button" variant="ghost" size="sm" className="absolute right-1 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary hover:bg-muted" onClick={onToggleShowPassword} aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}>
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>

            <Button type="submit" className="w-full h-12 bg-gradient-to-t from-[hsl(var(--primary))] via-[hsl(var(--primary))] to-[hsl(var(--primary))/0.9] hover:from-[hsl(var(--primary))] hover:via-[hsl(var(--primary))] hover:to-[hsl(var(--primary))] text-primary-foreground font-medium rounded-lg transition-all duration-200 shadow-sm hover:shadow-md" disabled={loading}>
              {loading ? <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Entrando...
                </> : <>Entrar</>}
            </Button>

            <div className="flex items-center my-4">
              
              
              
            </div>

            <div className="grid grid-cols-2 gap-3">
              

              
            </div>
          </form>

          <div className="p-0 mt-6">
            
          </div>
        </div>
      </div>
    </main>;
}