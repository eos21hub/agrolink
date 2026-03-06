import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from '@/hooks/useAuth';
import { ProtectedRoute } from '@/components/ui/ProtectedRoute';
import { AppLayout } from '@/components/layout/AppLayout';
import { LoginPage } from '@/pages/LoginPage';
import { DashboardPage } from '@/pages/DashboardPage';
import { UploadCropPage } from '@/pages/UploadCropPage';
import { MarketPricesPage } from '@/pages/MarketPricesPage';
import { PredictionsPage } from '@/pages/PredictionsPage';
import { AIAssistantPage } from '@/pages/AIAssistantPage';

export function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <AppLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<DashboardPage />} />
            <Route path="upload-crop" element={<UploadCropPage />} />
            <Route path="market-prices" element={<MarketPricesPage />} />
            <Route path="predictions" element={<PredictionsPage />} />
            <Route path="ai-assistant" element={<AIAssistantPage />} />
          </Route>
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
