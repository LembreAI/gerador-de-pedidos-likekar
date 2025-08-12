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
  onSubmit,
}: LightLoginProps) {
  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[hsl(var(--muted))] to-[hsl(var(--background))] p-4">
      <div className="w-full max-w-md bg-card rounded-2xl shadow-xl overflow-hidden border border-border relative">
        <div className="absolute top-0 left-0 right-0 h-48 bg-gradient-to-b from-[hsl(var(--primary))/0.15] via-[hsl(var(--primary))/0.08] to-transparent opacity-60 blur-3xl -mt-20 pointer-events-none" />
        <div className="p-8">
          <div className="flex flex-col items-center mb-8">
            <div className="bg-background p-4 rounded-2xl shadow-lg mb-6 text-primary">
              <svg
                width="48"
                height="48"
                viewBox="0 0 110 106"
                fill="currentColor"
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden
              >
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
              <Input
                id="login-email"
                type="email"
                value={email}
                onChange={(e) => onEmailChange(e.target.value)}
                placeholder="Digite seu email"
                className="h-12 rounded-lg"
                required
              />
            </div>

            <div className="space-y-1">
              <div className="flex justify-between items-center">
                <Label className="text-sm" htmlFor="login-password">Senha</Label>
                <a href="#" className="text-xs text-primary hover:underline">Esqueceu a senha?</a>
              </div>
              <div className="relative">
                <Input
                  id="login-password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => onPasswordChange(e.target.value)}
                  placeholder="••••••••"
                  className="h-12 rounded-lg pr-12"
                  required
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-1 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary hover:bg-muted"
                  onClick={onToggleShowPassword}
                  aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full h-12 bg-gradient-to-t from-[hsl(var(--primary))] via-[hsl(var(--primary))] to-[hsl(var(--primary))/0.9] hover:from-[hsl(var(--primary))] hover:via-[hsl(var(--primary))] hover:to-[hsl(var(--primary))] text-primary-foreground font-medium rounded-lg transition-all duration-200 shadow-sm hover:shadow-md"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Entrando...
                </>
              ) : (
                <>Entrar</>
              )}
            </Button>

            <div className="flex items-center my-4">
              <div className="flex-1 h-px bg-border" />
              <span className="px-4 text-sm text-muted-foreground">ou continue com</span>
              <div className="flex-1 h-px bg-border" />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                className="h-12 bg-background border border-border text-foreground hover:bg-muted hover:text-primary rounded-lg flex items-center justify-center gap-2 text-sm font-medium transition-colors"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                </svg>
                <span className="whitespace-nowrap">Google</span>
              </button>

              <button
                type="button"
                className="h-12 bg-background border border-border text-foreground hover:bg-muted hover:text-foreground rounded-lg flex items-center justify-center gap-2 text-sm font-medium transition-colors"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
                  <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.6.113.82-.26.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61-.546-1.386-1.332-1.755-1.332-1.755-1.087-.744.084-.729.084-.729 1.205.085 1.84 1.236 1.84 1.236 1.07 1.835 2.809 1.305 3.493.997.108-.776.42-1.305.763-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 21.795 24 17.295 24 12c0-6.627-5.373-12-12-12z" fill="#24292F" />
                </svg>
                <span className="whitespace-nowrap">GitHub</span>
              </button>
            </div>
          </form>

          <div className="p-0 mt-6">
            <p className="text-sm text-center text-muted-foreground w-full">
              Não tem uma conta? {" "}
              <a href="#" className="text-primary hover:underline font-medium">
                Cadastre-se
              </a>
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
