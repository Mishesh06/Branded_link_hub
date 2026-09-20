import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from '@/context/AuthContext';
import { ProtectedRoute } from '@/components/layout/ProtectedRoute';
import { DashboardLayout } from '@/components/layout/DashboardLayout';

// Public & Auth Pages
import { LandingPage } from '@/pages/LandingPage';
import { LoginPage } from '@/pages/LoginPage';
import { SignupPage } from '@/pages/SignupPage';
import { ForgotPasswordPage } from '@/pages/ForgotPasswordPage';
import { ResetPasswordPage } from '@/pages/ResetPasswordPage';
import { PublicBioPage } from '@/pages/PublicBioPage';
import { NotFoundPage } from '@/pages/NotFoundPage';

// Authenticated Dashboard Pages
import { DashboardOverviewPage } from '@/pages/DashboardOverviewPage';
import { LinksPage } from '@/pages/LinksPage';
import { AnalyticsPage } from '@/pages/AnalyticsPage';
import { BioBuilderPage } from '@/pages/BioBuilderPage';
import { QrCodesPage } from '@/pages/QrCodesPage';
import { SettingsPage } from '@/pages/SettingsPage';

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Marketing & Auth Routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />

          {/* Standalone Public Bio Route */}
          <Route path="/bio/:username" element={<PublicBioPage />} />

          {/* Authenticated Dashboard Studio */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<DashboardOverviewPage />} />
            <Route path="links" element={<LinksPage />} />
            <Route path="analytics" element={<AnalyticsPage />} />
            <Route path="bio" element={<BioBuilderPage />} />
            <Route path="qr" element={<QrCodesPage />} />
            <Route path="settings" element={<SettingsPage />} />
          </Route>

          {/* 404 Catch-All */}
          <Route path="/404" element={<NotFoundPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;
