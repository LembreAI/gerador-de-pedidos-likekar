import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { OrdersProvider } from "@/contexts/OrdersContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { VendedoresProvider } from "@/contexts/VendedoresContext";
import { InstalladoresProvider } from "@/contexts/InstalladoresContext";
import { ClientesProvider } from "@/contexts/ClientesContext";
import Index from "./pages/Index";
import Orders from "./pages/Orders";
import Clients from "./pages/Clients";
import Vendors from "./pages/Vendors";
import Installers from "./pages/Installers";
import Settings from "./pages/Settings";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";
import ClientDetails from "./pages/ClientDetails";
import ClientEdit from "./pages/ClientEdit";
import ProtectedRoute from "./components/ProtectedRoute";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <VendedoresProvider>
        <InstalladoresProvider>
          <ClientesProvider>
            <OrdersProvider>
            <TooltipProvider>
              <Toaster />
              <Sonner />
              <BrowserRouter>
                <Layout>
                <Routes>
                  <Route path="/auth" element={<Auth />} />
                  <Route path="/" element={<ProtectedRoute><Index /></ProtectedRoute>} />
                   <Route path="/pedidos" element={<ProtectedRoute><Orders /></ProtectedRoute>} />
                   <Route path="/clientes" element={<ProtectedRoute><Clients /></ProtectedRoute>} />
                  <Route path="/cliente/:id" element={<ProtectedRoute><ClientDetails /></ProtectedRoute>} />
                  <Route path="/cliente/:id/editar" element={<ProtectedRoute><ClientEdit /></ProtectedRoute>} />
                  <Route path="/vendedores" element={<ProtectedRoute><Vendors /></ProtectedRoute>} />
                  <Route path="/instaladores" element={<ProtectedRoute><Installers /></ProtectedRoute>} />
                  <Route path="/configuracoes" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
                  {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </Layout>
            </BrowserRouter>
           </TooltipProvider>
           </OrdersProvider>
          </ClientesProvider>
         </InstalladoresProvider>
       </VendedoresProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
