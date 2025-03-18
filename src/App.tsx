import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AppProviders } from '@/providers/app';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import LoginPage from '@/pages/auth/login';
import { SignUpForm } from '@/components/auth/SignUpForm';
import { ResetPasswordForm } from '@/components/auth/ResetPasswordForm';
import Layout from '@/components/layout/Layout';
import LandingPage from '@/pages/landing';
import { useEffect } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/sonner';
import { ThemeProvider } from '@/contexts/theme/ThemeContext';
import { AuthProvider } from '@/contexts/auth/AuthContext';
import { NotificationChecker } from '@/lib/services/notification-checker';

// Pages
import Dashboard from '@/pages/dashboard';
import Grows from '@/pages/grows';
import GrowDetails from '@/pages/grows/[id]';
import Tasks from '@/pages/tasks';
import NewTask from '@/pages/tasks/new';
import Plants from '@/pages/plants';
import PlantDetail from '@/pages/plants/[id]';
import NewPlant from '@/pages/plants/new';
import EditPlant from '@/pages/plants/edit';
import Analytics from '@/pages/analytics';
import Settings from '@/pages/settings';
import Help from '@/pages/help';
import Harvests from '@/pages/harvests';

const queryClient = new QueryClient();
const notificationChecker = new NotificationChecker();

function App() {
  useEffect(() => {
    // Start checking for notifications when the app loads
    notificationChecker.start();
    
    // Clean up when the app unmounts
    return () => {
      notificationChecker.stop();
    };
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <Router>
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/signup" element={<SignUpForm />} />
              <Route path="/reset-password" element={<ResetPasswordForm />} />
              
              {/* Protected Routes */}
              <Route path="/app" element={
                <ProtectedRoute>
                  <Layout />
                </ProtectedRoute>
              }>
                <Route index element={<Navigate to="/app/dashboard" replace />} />
                <Route path="dashboard" element={<Dashboard />} />
                <Route path="grows" element={<Grows />} />
                <Route path="grows/:id" element={<GrowDetails />} />
                <Route path="tasks" element={<Tasks />} />
                <Route path="tasks/new" element={<NewTask />} />
                <Route path="plants" element={<Plants />} />
                <Route path="plants/new" element={<NewPlant />} />
                <Route path="plants/:id" element={<PlantDetail />} />
                <Route path="plants/:id/edit" element={<EditPlant />} />
                <Route path="harvests" element={<Harvests />} />
                <Route path="analytics" element={<Analytics />} />
                <Route path="settings" element={<Settings />} />
                <Route path="help" element={<Help />} />
              </Route>
            </Routes>
            <Toaster />
          </Router>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
