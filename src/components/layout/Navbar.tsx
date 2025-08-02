import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { PlusCircle, FileText, Users, Wrench, Settings, Menu, X, LogOut } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
const menuItems = [{
  id: "novo-pedido",
  label: "Novo Pedido",
  icon: PlusCircle,
  path: "/"
}, {
  id: "pedidos",
  label: "Pedidos",
  icon: FileText,
  path: "/pedidos"
}, {
  id: "vendedores",
  label: "Vendedores",
  icon: Users,
  path: "/vendedores"
}, {
  id: "instaladores",
  label: "Instaladores",
  icon: Wrench,
  path: "/instaladores"
}, {
  id: "configuracoes",
  label: "Configurações",
  icon: Settings,
  path: "/configuracoes"
}];
export function Navbar() {
  const { user, signOut } = useAuth();

  const getUserInitials = () => {
    if (!user?.email) return "U";
    return user.email.substring(0, 2).toUpperCase();
  };
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMobileOpen(false);
  }, [location.pathname]);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (isMobileOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMobileOpen]);
  const handleNavigation = (path: string) => {
    navigate(path);
    setIsMobileOpen(false);
  };
  return <>
      {/* Desktop Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200">
        <div className="flex items-center justify-between px-4 sm:px-6 py-3 max-w-full">
          {/* Logo and Brand */}
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <div className="flex items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary/80 shadow-lg h-8 w-8 sm:h-10 sm:w-10 flex-shrink-0">
              <img src="/lovable-uploads/aaa139a5-5b84-4487-9488-0d3aed4ffcde.png" alt="Like Kar Logo" className="h-5 w-5 sm:h-6 sm:w-6 object-contain" />
            </div>
            <div className="min-w-0">
              <h1 className="text-sm sm:text-lg font-bold text-foreground tracking-tight truncate">
                Like Kar
              </h1>
              <p className="text-xs text-muted-foreground font-medium hidden sm:block truncate">
                Sistema de Pedidos
              </p>
            </div>
          </div>

          {/* Desktop Menu */}
          

          {/* Menu button for all screen sizes */}
          <Button variant="ghost" size="icon" className="h-8 w-8 sm:h-10 sm:w-10 flex-shrink-0" onClick={() => setIsMobileOpen(!isMobileOpen)}>
            {isMobileOpen ? <X className="h-4 w-4 sm:h-5 sm:w-5" /> : <Menu className="h-4 w-4 sm:h-5 sm:w-5" />}
          </Button>
        </div>
      </nav>

      {/* Mobile overlay */}
      {isMobileOpen && <div className="fixed inset-0 bg-black/60 z-40 lg:hidden backdrop-blur-sm" onClick={() => setIsMobileOpen(false)} />}

      {/* Mobile Menu */}
      <div className={cn("fixed top-[3.75rem] sm:top-[4.25rem] left-0 right-0 z-40 bg-white border-b border-gray-200 transition-all duration-300 ease-in-out shadow-lg", isMobileOpen ? "translate-y-0 opacity-100" : "-translate-y-full opacity-0")}>
        <div className="p-4 sm:p-6 space-y-3 max-h-[calc(100vh-4rem)] overflow-y-auto">
          {/* Menu Items */}
          <div className="space-y-2">
            {menuItems.map(item => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return <Button key={item.id} variant={isActive ? "default" : "ghost"} className={cn("w-full justify-start gap-3 py-4 h-14 text-base font-medium rounded-xl", isActive ? "bg-primary text-primary-foreground shadow-md" : "text-foreground hover:bg-accent hover:text-accent-foreground")} onClick={() => handleNavigation(item.path)}>
                  <Icon className="h-5 w-5 flex-shrink-0" />
                  <span className="truncate">{item.label}</span>
                </Button>;
          })}
          </div>
          
          {/* User Profile Section */}
          <div className="border-t border-border pt-4 mt-4">
            <div className="flex items-center gap-3 p-4 rounded-xl bg-muted/40 hover:bg-muted/60 transition-all duration-200">
              <Avatar className="h-10 w-10 border-2 border-primary/20 flex-shrink-0">
                <AvatarImage src="" />
                <AvatarFallback className="bg-primary text-primary-foreground text-sm font-bold">
                  {getUserInitials()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-foreground truncate">
                  {user?.email || "Usuário"}
                </p>
                <p className="text-xs text-muted-foreground truncate">
                  Administrador
                </p>
              </div>
            </div>
            
            <Button variant="ghost" size="sm" className="w-full justify-start gap-3 mt-3 h-12 text-muted-foreground hover:text-foreground rounded-xl" onClick={signOut}>
              <LogOut className="h-4 w-4" />
              <span className="text-sm font-medium">Sair da Conta</span>
            </Button>
          </div>
        </div>
      </div>
    </>;
}