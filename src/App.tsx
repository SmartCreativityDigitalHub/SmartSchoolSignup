import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import SignUp from "./pages/SignUp";
import OfflinePayment from "./pages/OfflinePayment";
import PaymentSuccess from "./pages/PaymentSuccess";
import NotFound from "./pages/NotFound";

import AdminDashboard from "./pages/AdminDashboard";
import AffiliateDashboard from "./pages/AffiliateDashboard";
import AdminLogin from "./pages/AdminLogin";
import AffiliateLogin from "./pages/AffiliateLogin";
import AffiliateSignup from "./pages/AffiliateSignup";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/offline-payment" element={<OfflinePayment />} />
          <Route path="/payment-success" element={<PaymentSuccess />} />
          
          <Route path="/admin-login" element={<AdminLogin />} />
          <Route path="/affiliate-login" element={<AffiliateLogin />} />
          <Route path="/affiliate-signup" element={<AffiliateSignup />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/affiliate" element={<AffiliateDashboard />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
