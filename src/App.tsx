import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import { AuthProvider } from "@/contexts/AuthContext";
import { TenantProvider } from "@/contexts/TenantContext";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { GlobalProviders } from "@/components/global";

import AuthPage from "./pages/AuthPage";
import Dashboard from "./pages/Dashboard";
import OperationalDashboardPage from "./pages/OperationalDashboardPage";
import CommandCenterPage from "./pages/CommandCenterPage";
import OperationPage from "./pages/OperationPage";
import MachinesPage from "./pages/MachinesPage";
import MachineDetailPage from "./pages/MachineDetailPage";
import AlertsPage from "./pages/AlertsPage";
import OccurrencesPage from "./pages/OccurrencesPage";
import NewOccurrencePage from "./pages/NewOccurrencePage";
import TiresPage from "./pages/TiresPage";
import TireHistoryPage from "./pages/TireHistoryPage";
import TelemetryAnalysisPage from "./pages/TelemetryAnalysisPage";
import WearAnalysisPage from "./pages/WearAnalysisPage";
import FluidBallastPage from "./pages/FluidBallastPage";
import GeolocationPage from "./pages/GeolocationPage";
import BalanceDashboardPage from "./pages/BalanceDashboardPage";
import CostManagementPage from "./pages/CostManagementPage";
import FleetManagementPage from "./pages/FleetManagementPage";
import TireCalibrationPage from "./pages/TireCalibrationPage";
import TireDeformationPage from "./pages/TireDeformationPage";
import BusinessIntelligencePage from "./pages/BusinessIntelligencePage";
import LoadAnalysisPage from "./pages/LoadAnalysisPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TenantProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <GlobalProviders>
              <Routes>
                <Route path="/auth" element={<AuthPage />} />

                <Route element={<ProtectedRoute />}>
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/operations" element={<OperationalDashboardPage />} />
                  <Route path="/command-center" element={<CommandCenterPage />} />
                  <Route path="/team-operations" element={<OperationPage />} />
                  <Route path="/machines" element={<MachinesPage />} />
                  <Route path="/machines/:id" element={<MachineDetailPage />} />
                  <Route path="/alerts" element={<AlertsPage />} />
                  <Route path="/occurrences" element={<OccurrencesPage />} />
                  <Route path="/occurrences/new" element={<NewOccurrencePage />} />
                  <Route path="/tires" element={<TiresPage />} />
                  <Route path="/tires/:id/history" element={<TireHistoryPage />} />
                  <Route path="/telemetry" element={<TelemetryAnalysisPage />} />
                  <Route path="/wear" element={<WearAnalysisPage />} />
                  <Route path="/fluid" element={<FluidBallastPage />} />
                  <Route path="/geolocation" element={<GeolocationPage />} />
                  <Route path="/balance" element={<BalanceDashboardPage />} />
                  <Route path="/costs" element={<CostManagementPage />} />
                  <Route path="/fleet" element={<FleetManagementPage />} />
                  <Route path="/calibration" element={<TireCalibrationPage />} />
                  <Route path="/deformation" element={<TireDeformationPage />} />
                  <Route path="/bi" element={<BusinessIntelligencePage />} />
                  <Route path="/load" element={<LoadAnalysisPage />} />
                  {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                  <Route path="*" element={<NotFound />} />
                </Route>
              </Routes>
            </GlobalProviders>
          </BrowserRouter>
        </TooltipProvider>
      </TenantProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
