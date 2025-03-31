import React, { useState, useEffect } from "react";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "../ThemeToggle";
import { UserNav } from "./UserNav";
import { SearchCommand } from "./SearchCommand";
import { NotificationBell } from "@/components/notifications/NotificationBell";
import { cn } from "@/lib/utils";

interface HeaderProps {
  onToggleSidebar: () => void;
}

export function Header({ onToggleSidebar }: HeaderProps) {
  const [scrolled, setScrolled] = useState(false);
  const [isTablet, setIsTablet] = useState(false);
  
  // Handle tablet detection
  useEffect(() => {
    const checkTablet = () => {
      const isTabletSize = window.innerWidth >= 768 && window.innerWidth < 1024;
      setIsTablet(isTabletSize);
    };
    
    checkTablet();
    window.addEventListener('resize', checkTablet);
    return () => window.removeEventListener('resize', checkTablet);
  }, []);
  
  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header className="fixed top-0 z-40 w-full border-b bg-background h-16">
      <div className={cn(
        "grid grid-cols-3 h-16 items-center gap-4 px-4 lg:container",
      )}>
        {/* Left section with menu/logo */}
        <div className="flex items-center">
          <Button
            variant="ghost"
            size="icon"
            className="shrink-0 md:hidden"
            onClick={onToggleSidebar}
          >
            <Menu className="h-5 w-5" />
          </Button>
        </div>
        
        {/* Center section with search */}
        <div className="flex justify-center">
          <div className="w-full max-w-xs md:max-w-sm">
            <SearchCommand />
          </div>
        </div>

        {/* Right section with actions */}
        <div className="flex items-center justify-end space-x-3">
          <ThemeToggle />
          <NotificationBell />
          <UserNav />
        </div>
      </div>
    </header>
  );
}
