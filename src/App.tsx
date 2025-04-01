
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from './contexts/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';

// Dashboard Pages
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Customers from "./pages/Customers";
import Vehicles from "./pages/Vehicles";
import VehicleDetail from "./pages/VehicleDetail";
import Staff from "./pages/Staff";
import JobCards from "./pages/JobCards";
import Inventory from "./pages/Inventory";
import Billing from "./pages/Billing";
import Settings from "./pages/Settings"; // Added this import
import NotFound from "./pages/NotFound";

// Public Pages
import LandingPage from "./pages/LandingPage";
import InformationPage from "./pages/InformationPage";
import ContactPage from "./pages/ContactPage";
import CustomerPortal from "./pages/CustomerPortal";

const queryClient = new QueryClient();

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<LandingPage />} />
              <Route path="/information" element={<InformationPage />} />
              <Route path="/contact" element={<ContactPage />} />
              <Route path="/customer-portal" element={<CustomerPortal />} />
              
              {/* Auth Route */}
              <Route path="/auth" element={<Auth />} />
              
              {/* Protected Dashboard Routes */}
              <Route path="/dashboard" element={<ProtectedRoute><Index /></ProtectedRoute>} />
              <Route path="/customers" element={<ProtectedRoute><Customers /></ProtectedRoute>} />
              <Route path="/vehicles" element={<ProtectedRoute><Vehicles /></ProtectedRoute>} />
              <Route path="/vehicles/:id" element={<ProtectedRoute><VehicleDetail /></ProtectedRoute>} />
              <Route path="/staff" element={<ProtectedRoute><Staff /></ProtectedRoute>} />
              <Route path="/job-cards" element={<ProtectedRoute><JobCards /></ProtectedRoute>} />
              <Route path="/inventory" element={<ProtectedRoute><Inventory /></ProtectedRoute>} />
              <Route path="/billing" element={<ProtectedRoute><Billing /></ProtectedRoute>} />
              <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} /> 
              
              {/* 404 Route */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default App;
