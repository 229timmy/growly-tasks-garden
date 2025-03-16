import React, { useState, useEffect } from "react";
import { Outlet } from "react-router-dom";
import Header from "./Header";
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
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      <div
        className={cn(
          "transition-all duration-300 ease-in-out",
          // Desktop layout (large screens)
          isSidebarOpen ? "lg:ml-64" : "lg:ml-20",
          // Tablet layout (md screens)
          isTablet && isSidebarOpen && "md:ml-64",
          isTablet && !isSidebarOpen && "md:ml-20",
          // Mobile layout (sm screens)
          (isMobile || isTablet) && !isSidebarOpen && "ml-0"
        )}
      >
        <Header isSidebarOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
        <main className="px-4 sm:px-6 lg:px-8 pt-24 pb-8 min-h-screen">
          {children || <Outlet />}
        </main>
      </div>
    </div>
  );
};

export default Layout;
