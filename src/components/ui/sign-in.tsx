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
  return <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[hsl(var(--muted))] to-[hsl(var(--background))] p-4">
      <div className="w-full max-w-md bg-card rounded-2xl shadow-xl overflow-hidden border border-border relative">
        <div className="absolute top-0 left-0 right-0 h-48 bg-gradient-to-b from-[hsl(var(--primary))/0.15] via-[hsl(var(--primary))/0.08] to-transparent opacity-60 blur-3xl -mt-20 pointer-events-none" />
        <div className="p-8">
          <div className="flex flex-col items-center mb-8">
            <div className="bg-background p-4 rounded-2xl shadow-lg mb-6 text-primary">
              <svg width="48" height="48" viewBox="0 0 110 106" fill="currentColor" xmlns="http://www.w3.org/2000/svg" aria-hidden>
                <path d="M100.83 28.63L66.86 3.95c-7.25-5.26-17.07-5.26-24.35 0L8.54 28.63C1.29 33.89-1.76 43.23 1.01 51.77l12.98 39.93c2.77 8.53 10.72 14.3 19.7 14.3h41.97c8.98 0 16.93-5.76 19.7-14.3l12.98-39.93c2.77-8.53-.28-17.88-7.53-23.14ZM64.81 63.13l-10.13 18.55-10.13-18.55-18.55-10.13 18.55-10.13 10.13-18.55 10.13 18.55 18.55 10.13-18.55 10.13Z" />
              </svg>
            </div>
            <div className="p-0">
              <h2 className="text-2xl font-bold text-foreground text-center">Bem-vindo de volta</h2>
              <p className="text-center text-muted-foreground mt-2">Entre para continuar</p>
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