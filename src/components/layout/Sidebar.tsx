import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/contexts/AuthContext";
import {
  PlusCircle,
  FileText,
  Users,
  Wrench,
  Settings,
  Menu,
  X,
  ChevronLeft,
  ChevronRight,
  LogOut,
  DollarSign,
  Package,
  Shield,
} from "lucide-react";

const allMenuItems = [
  {
    id: "novo-pedido",
    label: "Novo Pedido",
    icon: PlusCircle,
    path: "/",
    requiredRole: null, // Available to all
  },
  {
    id: "pedidos",
    label: "Pedidos",
    icon: FileText,
    path: "/pedidos",
    requiredRole: null, // Available to all
  },
  {
    id: "clientes",
    label: "Clientes",
    icon: Users,
    path: "/clientes",
    requiredRole: null, // Available to all
  },
  {
    id: "vendedores",
    label: "Vendedores",
    icon: Users,
    path: "/vendedores",
    requiredRole: "admin", // Admin only
  },
  {
    id: "instaladores",
    label: "Instaladores",
    icon: Wrench,
    path: "/instaladores",
    requiredRole: "admin", // Admin only
  },
  {
    id: "comissoes",
    label: "Comissões",
    icon: DollarSign,
    path: "/comissoes",
    requiredRole: "admin", // Admin only
  },
  {
    id: "usuarios",
    label: "Central de Usuários",
    icon: Shield,
    path: "/usuarios",
    requiredRole: "admin", // Admin only
  },
];

interface SidebarProps {
  isCollapsed: boolean;
  setIsCollapsed: (collapsed: boolean) => void;
}

export function Sidebar({ isCollapsed, setIsCollapsed }: SidebarProps) {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { isAdmin, userRole, signOut } = useAuth();

  // Filter menu items based on user role
  const menuItems = allMenuItems.filter(item => {
    if (item.requiredRole === null) return true; // Available to all
    if (item.requiredRole === "admin") return isAdmin;
    return true;
  });

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

  const sidebarWidth = isCollapsed ? "w-16" : "w-64";
  const mobileWidth = "w-80";

  return (
    <>
      {/* Mobile menu button */}
      <Button
        variant="ghost"
        size="icon"
        className="fixed top-4 left-4 z-50 lg:hidden bg-background/80 backdrop-blur-sm border shadow-md hover:shadow-lg"
        onClick={() => setIsMobileOpen(!isMobileOpen)}
      >
        {isMobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </Button>

      {/* Desktop collapse button */}
      <Button
        variant="ghost"
        size="icon"
        className={cn(
          "hidden lg:flex fixed top-4 z-50 bg-background/80 backdrop-blur-sm border shadow-md hover:shadow-lg transition-all duration-300",
          isCollapsed ? "left-4" : "left-60"
        )}
        onClick={() => setIsCollapsed(!isCollapsed)}
      >
        {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
      </Button>

      {/* Mobile overlay */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-40 lg:hidden backdrop-blur-sm"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed left-0 top-0 z-40 h-screen bg-sidebar/95 backdrop-blur-md border-r border-sidebar-border transition-all duration-300 ease-in-out",
          // Mobile styles
          "lg:hidden",
          isMobileOpen ? `translate-x-0 ${mobileWidth}` : "-translate-x-full w-80",
          // Desktop styles
          "lg:block lg:translate-x-0",
          sidebarWidth
        )}
      >
        <div className="flex h-full flex-col">
          {/* Header */}
          <div className={cn(
            "flex items-center border-b border-sidebar-border transition-all duration-300",
            isCollapsed ? "justify-center p-4 lg:p-3" : "gap-3 p-6 lg:p-4"
          )}>
            <div className={cn(
              "flex items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary/80 shadow-lg transition-all duration-300",
              isCollapsed ? "h-10 w-10" : "h-12 w-12"
            )}>
              <img 
                src="/lovable-uploads/aaa139a5-5b84-4487-9488-0d3aed4ffcde.png" 
                alt="Like Kar Logo" 
                className={cn(
                  "object-contain transition-all duration-300",
                  isCollapsed ? "h-6 w-6" : "h-8 w-8"
                )}
              />
            </div>
            
            {!isCollapsed && (
              <div className="flex-1 min-w-0">
                <h1 className="text-xl lg:text-lg font-bold text-sidebar-foreground tracking-tight truncate">
                  Like Kar
                </h1>
                <p className="text-sm text-muted-foreground font-medium truncate">
                  Sistema de Pedidos
                </p>
              </div>
            )}
          </div>

          {/* Menu */}
          <nav className="flex-1 overflow-y-auto p-4 lg:p-3">
            {!isCollapsed && (
              <p className="mb-4 text-xs font-medium uppercase tracking-wider text-muted-foreground px-2">
                Menu Principal
              </p>
            )}
            
            <div className="space-y-1">
              {menuItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                
                return (
                  <Button
                    key={item.id}
                    variant={isActive ? "default" : "ghost"}
                    className={cn(
                      "w-full transition-all duration-200 group relative",
                      isCollapsed 
                        ? "justify-center px-2 py-3 h-12" 
                        : "justify-start gap-3 px-3 py-3 h-12",
                      isActive
                        ? "bg-primary text-primary-foreground shadow-md"
                        : "text-sidebar-foreground hover:bg-accent hover:text-accent-foreground hover:shadow-sm"
                    )}
                    onClick={() => handleNavigation(item.path)}
                  >
                    <Icon className={cn(
                      "flex-shrink-0 transition-all duration-200",
                      isCollapsed ? "h-5 w-5" : "h-4 w-4"
                    )} />
                    
                    {!isCollapsed && (
                      <span className="font-medium truncate">{item.label}</span>
                    )}
                    
                    {/* Tooltip for collapsed state */}
                    {isCollapsed && (
                      <div className="absolute left-full ml-2 px-2 py-1 bg-popover text-popover-foreground text-sm rounded-md shadow-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-50 hidden lg:block">
                        {item.label}
                      </div>
                    )}
                  </Button>
                );
              })}
            </div>
          </nav>

          {/* User Profile Footer */}
          <div className={cn(
            "border-t border-sidebar-border p-4 lg:p-3 space-y-2"
          )}>
            <div className={cn(
              "flex items-center rounded-lg bg-muted/30 hover:bg-muted/50 transition-all duration-200 cursor-pointer group",
              isCollapsed ? "justify-center p-3" : "gap-3 p-3"
            )}>
              <Avatar className={cn(
                "border-2 border-primary/20 transition-all duration-200",
                isCollapsed ? "h-8 w-8" : "h-9 w-9"
              )}>
                <AvatarImage src="" />
                <AvatarFallback className="bg-primary text-primary-foreground text-sm font-bold">
                  JS
                </AvatarFallback>
              </Avatar>
              
              {!isCollapsed && (
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-foreground truncate">
                    Usuário
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    {userRole === 'admin' ? 'Administrador' : 'Vendedor'}
                  </p>
                </div>
              )}
              
              {/* Tooltip for collapsed state */}
              {isCollapsed && (
                <div className="absolute left-full ml-2 px-3 py-2 bg-popover text-popover-foreground text-sm rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-50 hidden lg:block">
                  <p className="font-semibold">Usuário</p>
                  <p className="text-xs text-muted-foreground">{userRole === 'admin' ? 'Administrador' : 'Vendedor'}</p>
                </div>
              )}
            </div>
            
            {!isCollapsed && (
              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-start gap-2 text-muted-foreground hover:text-foreground"
                onClick={signOut}
              >
                <LogOut className="h-4 w-4" />
                <span className="text-sm">Sair</span>
              </Button>
            )}
          </div>
        </div>
      </aside>
    </>
  );
}