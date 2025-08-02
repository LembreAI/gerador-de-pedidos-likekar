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
import Index from "./pages/Index";
import Orders from "./pages/Orders";
import Vendors from "./pages/Vendors";
import Installers from "./pages/Installers";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <VendedoresProvider>
        <InstalladoresProvider>
          <OrdersProvider>
            <TooltipProvider>
              <Toaster />
              <Sonner />
              <BrowserRouter>
                <Layout>
                <Routes>
                  <Route path="/" element={<Index />} />
                  <Route path="/pedidos" element={<Orders />} />
                  <Route path="/vendedores" element={<Vendors />} />
                  <Route path="/instaladores" element={<Installers />} />
                  <Route path="/configuracoes" element={<Settings />} />
                  {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </Layout>
            </BrowserRouter>
          </TooltipProvider>
          </OrdersProvider>
        </InstalladoresProvider>
      </VendedoresProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
