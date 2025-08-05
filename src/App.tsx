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
import Contact from "./pages/Contact";
import Renew from "./pages/Renew";
import RenewalSuccess from "./pages/RenewalSuccess";
import Report from "./pages/Report";
import AllPages from "./pages/AllPages";


import AdminDashboard from "./pages/AdminDashboard";
import AdminLogin from "./pages/AdminLogin";
import OfflineRenewalPayment from "./pages/OfflineRenewalPayment";

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
          <Route path="/contact" element={<Contact />} />
          <Route path="/renew" element={<Renew />} />
          <Route path="/renewal-success" element={<RenewalSuccess />} />
          <Route path="/report" element={<Report />} />
          <Route path="/all-pages" element={<AllPages />} />
          
          <Route path="/offline-payment" element={<OfflinePayment />} />
          <Route path="/payment-success" element={<PaymentSuccess />} />
          
          <Route path="/admin-login" element={<AdminLogin />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/offline-renewal-payment" element={<OfflineRenewalPayment />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
