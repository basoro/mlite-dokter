import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AppLayout } from "./layouts/AppLayout";
import { ProtectedRoute } from "./components/ProtectedRoute";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import RawatJalan from "./pages/RawatJalan";
import Booking from "./pages/Booking";
import Igd from "./pages/Igd";
import RawatInap from "./pages/RawatInap";
import Hemodialisa from "./pages/Hemodialisa";
import PlaceholderPage from "./pages/PlaceholderPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 30000,
    },
  },
});

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route
            element={
              <ProtectedRoute>
                <AppLayout />
              </ProtectedRoute>
            }
          >
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/pasien/rawat-jalan" element={<RawatJalan />} />
            <Route path="/pasien/booking" element={<Booking />} />
            <Route path="/pasien/igd" element={<Igd />} />
            <Route path="/pasien/rawat-inap" element={<RawatInap />} />
            <Route path="/pasien/hemodialisa" element={<Hemodialisa />} />
            <Route path="/rekam-medis/berkas" element={<PlaceholderPage />} />
            <Route path="/presensi" element={<PlaceholderPage />} />
            <Route path="/booking-operasi" element={<PlaceholderPage />} />
            <Route path="/tarif-inacbgs" element={<PlaceholderPage />} />
            <Route path="/master-icd" element={<PlaceholderPage />} />
            <Route path="/statistik" element={<PlaceholderPage />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
