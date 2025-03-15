
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "@/hooks/use-theme";
import Layout from "@/components/layout/Layout";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Dashboard from "./pages/Dashboard";
import Grows from "./pages/Grows";

// Create placeholder pages for routes that don't exist yet
const PlaceholderPage = ({ title }: { title: string }) => (
  <div className="container py-10">
    <h1 className="text-3xl font-bold mb-6">{title}</h1>
    <p className="text-muted-foreground">This page is under construction.</p>
  </div>
);

const Tasks = () => <PlaceholderPage title="Tasks" />;
const Plants = () => <PlaceholderPage title="Plants" />;
const Analytics = () => <PlaceholderPage title="Analytics" />;
const Settings = () => <PlaceholderPage title="Settings" />;
const Help = () => <PlaceholderPage title="Help" />;

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route element={<Layout />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/grows" element={<Grows />} />
              <Route path="/tasks" element={<Tasks />} />
              <Route path="/plants" element={<Plants />} />
              <Route path="/analytics" element={<Analytics />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/help" element={<Help />} />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
