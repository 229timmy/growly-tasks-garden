import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AppProviders } from '@/providers/app';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import LoginPage from '@/pages/auth/login';
import { SignUpForm } from '@/components/auth/SignUpForm';
import { ResetPasswordForm } from '@/components/auth/ResetPasswordForm';
import Layout from '@/components/layout/Layout';
import LandingPage from '@/pages/landing';
import PrivacyPolicy from '@/pages/legal/privacy';
import TermsOfService from '@/pages/legal/terms';
import CookiePolicy from '@/pages/legal/cookies';
import Disclaimer from '@/pages/legal/disclaimer';
import { useEffect } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/sonner';
import { ThemeProvider } from '@/hooks/use-theme';
import { AuthProvider, useAuth } from '@/contexts/auth/AuthContext';
import { NotificationChecker } from '@/lib/services/notification-checker';
import { HelmetProvider } from 'react-helmet-async';

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
import BlogPage from '@/pages/blog';
import BlogPostPage from '@/pages/blog/[slug]';

const queryClient = new QueryClient();
const notificationChecker = new NotificationChecker();

function AppContent() {
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      notificationChecker.start();
      return () => notificationChecker.stop();
    }
  }, [user]);

  return (
    <Router basename="/">
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignUpForm />} />
        <Route path="/reset-password" element={<ResetPasswordForm />} />
        
        {/* Legal Pages */}
        <Route path="/privacy" element={<PrivacyPolicy />} />
        <Route path="/terms" element={<TermsOfService />} />
        <Route path="/cookies" element={<CookiePolicy />} />
        <Route path="/disclaimer" element={<Disclaimer />} />
        
        {/* Blog Routes */}
        <Route path="/blog" element={<BlogPage />} />
        <Route path="/blog/:slug" element={<BlogPostPage />} />

        {/* Protected Routes */}
        <Route element={<ProtectedRoute />}>
          <Route element={<Layout />}>
            <Route path="/app/dashboard" element={<Dashboard />} />
            <Route path="/app/grows" element={<Grows />} />
            <Route path="/app/grows/:id" element={<GrowDetails />} />
            <Route path="/app/tasks" element={<Tasks />} />
            <Route path="/app/tasks/new" element={<NewTask />} />
            <Route path="/app/plants" element={<Plants />} />
            <Route path="/app/plants/:id" element={<PlantDetail />} />
            <Route path="/app/plants/new" element={<NewPlant />} />
            <Route path="/app/plants/edit/:id" element={<EditPlant />} />
            <Route path="/app/analytics" element={<Analytics />} />
            <Route path="/app/settings" element={<Settings />} />
            <Route path="/app/help" element={<Help />} />
            <Route path="/app/harvests" element={<Harvests />} />
          </Route>
        </Route>

        {/* Catch-all redirect */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
      <Toaster />
    </Router>
  );
}

function App() {
  return (
    <HelmetProvider>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <AuthProvider>
            <AppContent />
          </AuthProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </HelmetProvider>
  );
}

export default App;
