import React, { useState, useEffect } from "react";
import { Outlet } from "react-router-dom";
import { Header } from "./Header";
import Sidebar from "./Sidebar";
import { useTheme } from "@/hooks/use-theme";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";

const Layout = ({ children }: { children?: React.ReactNode }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const { theme } = useTheme();
  const isMobile = useIsMobile();
  // Add tablet detection
  const [isTablet, setIsTablet] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  // Handle tablet detection
  useEffect(() => {
    const checkTablet = () => {
      // Define tablet range (between 768px and 1024px)
      const isTabletSize = window.innerWidth >= 768 && window.innerWidth < 1024;
      setIsTablet(isTabletSize);
    };
    
    // Check initially
    checkTablet();
    
    // Add event listener
    window.addEventListener('resize', checkTablet);
    
    // Clean up
    return () => window.removeEventListener('resize', checkTablet);
  }, []);

  // Close sidebar by default on mobile
  React.useEffect(() => {
    if (isMobile) {
      setIsSidebarOpen(false);
    }
  }, [isMobile]);

  // Close sidebar by default on tablet too
  React.useEffect(() => {
    if (isTablet) {
      setIsSidebarOpen(false);
    }
  }, [isTablet]);

  return (
    <div className="min-h-screen bg-background">
      <Header onToggleSidebar={toggleSidebar} />
      <div className="flex h-[calc(100vh-4rem)] pt-16">
        <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
        <main 
          className={cn(
            "flex-1 p-6 overflow-auto",
            isSidebarOpen ? "lg:ml-64" : "lg:ml-20",
            isTablet && isSidebarOpen ? "md:ml-64" : "md:ml-20",
            (!isTablet && !isMobile) || !isSidebarOpen ? "ml-0" : "ml-0"
          )}
        >
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;
