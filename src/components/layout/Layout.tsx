
import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import Header from "./Header";
import Sidebar from "./Sidebar";
import { useTheme } from "@/hooks/use-theme";

const Layout = ({ children }: { children?: React.ReactNode }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const { theme } = useTheme();

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className={theme}>
      <div className="min-h-screen bg-background">
        <Sidebar isOpen={isSidebarOpen} />
        <div
          className={`transition-all duration-300 ease-in-out ${
            isSidebarOpen ? "lg:ml-64" : "lg:ml-20"
          }`}
        >
          <Header isSidebarOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
          <main className="px-4 sm:px-6 lg:px-8 pt-24 pb-8 min-h-screen">
            {children || <Outlet />}
          </main>
        </div>
      </div>
    </div>
  );
};

export default Layout;
