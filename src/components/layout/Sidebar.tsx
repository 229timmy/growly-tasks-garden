import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { 
  LayoutDashboard, 
  Sprout, 
  CheckSquare, 
  BarChart3, 
  Settings,
  HelpCircle,
  X,
  Wheat,
  Tent
} from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { Button } from "@/components/ui/button";
import { useUserTier } from "@/hooks/use-user-tier";

interface SidebarProps {
  isOpen: boolean;
  onClose?: () => void;
}

interface NavItem {
  label: string;
  icon: React.ReactNode;
  href: string;
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const location = useLocation();
  const isMobile = useIsMobile();
  const [isTablet, setIsTablet] = useState(false);
  const { tier, isLoading: isTierLoading } = useUserTier();
  
  // Check if user is on free tier
  const isFreeTier = tier === 'free';
  
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
  
  const mainNavItems: NavItem[] = [
    {
      label: "Dashboard",
      icon: <LayoutDashboard className="h-5 w-5" />,
      href: "/app/dashboard"
    },
    {
      label: "Grows",
      icon: <Tent className="h-5 w-5" />,
      href: "/app/grows"
    },
    {
      label: "Tasks",
      icon: <CheckSquare className="h-5 w-5" />,
      href: "/app/tasks"
    },
    {
      label: "Plants",
      icon: <Sprout className="h-5 w-5" />,
      href: "/app/plants"
    },
    {
      label: "Harvests",
      icon: <Wheat className="h-5 w-5" />,
      href: "/app/harvests"
    },
    {
      label: "Analytics",
      icon: <BarChart3 className="h-5 w-5" />,
      href: "/app/analytics"
    },
  ];
  
  const secondaryNavItems: NavItem[] = [
    {
      label: "Settings",
      icon: <Settings className="h-5 w-5" />,
      href: "/app/settings"
    },
    {
      label: "Help",
      icon: <HelpCircle className="h-5 w-5" />,
      href: "/app/help"
    }
  ];

  return (
    <>
      {/* Backdrop for mobile and tablet when sidebar is open */}
      {(isMobile || isTablet) && isOpen && (
        <div 
          className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40"
          onClick={onClose}
        />
      )}
      
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex flex-col border-r bg-sidebar transition-all duration-300 ease-in-out",
          // Desktop view
          isOpen ? "lg:w-64" : "lg:w-20",
          // Tablet view
          isTablet && isOpen && "md:w-64",
          isTablet && !isOpen && "md:w-20 md:-translate-x-full",
          // Mobile view 
          isMobile && "w-64",
          (isMobile || isTablet) && !isOpen && "-translate-x-full"
        )}
      >
        <div className="flex h-16 items-center justify-between border-b px-4">
          <Link to="/" className="flex items-center gap-2">
            <div className="flex items-center justify-center w-10 h-10 rounded-md bg-primary/10">
              <img src="/path23.svg" alt="Logo" className="h-6 w-6 text-primary" />
            </div>
            {(isOpen || isMobile) && (
              <div className="transition-opacity animate-fade-in">
                <span className="font-semibold text-lg">Grow</span>
                <span className="font-medium text-primary text-lg">Manager</span>
              </div>
            )}
          </Link>
          
          {/* Close button for mobile */}
          {isMobile && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="lg:hidden"
            >
              <X className="h-5 w-5" />
            </Button>
          )}
        </div>
        
        <div className="flex-1 overflow-auto py-4">
          <nav className="grid items-start px-2 gap-2">
            {mainNavItems.map((item, index) => (
              <Link
                key={item.href}
                to={item.href}
                onClick={isMobile ? onClose : undefined}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 transition-all",
                  "hover:bg-accent",
                  location.pathname === item.href
                    ? "bg-accent text-accent-foreground font-medium"
                    : "text-muted-foreground",
                  !isOpen && !isMobile && "justify-center px-0"
                )}
                style={{
                  animationDelay: `${index * 50}ms`,
                }}
              >
                {item.icon}
                {(isOpen || isMobile) && <div className="animate-fade-in">{item.label}</div>}
              </Link>
            ))}
          </nav>
        </div>
        
        <div className="border-t py-4">
          <nav className="grid items-start px-2 gap-2">
            {secondaryNavItems.map((item, index) => (
              <Link
                key={item.href}
                to={item.href}
                onClick={isMobile ? onClose : undefined}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 transition-all",
                  "hover:bg-accent",
                  location.pathname === item.href
                    ? "bg-accent text-accent-foreground font-medium"
                    : "text-muted-foreground",
                  !isOpen && !isMobile && "justify-center px-0"
                )}
              >
                {item.icon}
                {(isOpen || isMobile) && <div className="animate-fade-in">{item.label}</div>}
              </Link>
            ))}
          </nav>
        </div>
        
        <div className="border-t p-4">
          {(isOpen || isMobile) ? (
            <>
              {isFreeTier && (
                <div className="animate-fade-in rounded-lg bg-accent p-4">
                  <div className="mb-2 flex items-center gap-2">
                    <span className="tag bg-primary/20 text-primary">Free Plan</span>
                    <span className="text-xs text-muted-foreground">3/3 Grows</span>
                  </div>
                  <p className="text-xs text-muted-foreground mb-3">
                    Upgrade to Pro for more grows and features
                  </p>
                  <Link to="/upgrade" onClick={isMobile ? onClose : undefined}>
                    <button className="w-full bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 rounded-md text-sm font-medium transition-colors">
                      Upgrade
                    </button>
                  </Link>
                </div>
              )}
            </>
          ) : (
            <>
              {isFreeTier && (
                <div className="flex justify-center">
                  <Link to="/upgrade">
                    <button className="bg-primary text-primary-foreground p-2 rounded-md">
                      <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path
                          d="M7.5 2C7.77614 2 8 2.22386 8 2.5L8 11.2929L11.1464 8.14645C11.3417 7.95118 11.6583 7.95118 11.8536 8.14645C12.0488 8.34171 12.0488 8.65829 11.8536 8.85355L7.85355 12.8536C7.75979 12.9473 7.63261 13 7.5 13C7.36739 13 7.24021 12.9473 7.14645 12.8536L3.14645 8.85355C2.95118 8.65829 2.95118 8.34171 3.14645 8.14645C3.34171 7.95118 3.65829 7.95118 3.85355 8.14645L7 11.2929L7 2.5C7 2.22386 7.22386 2 7.5 2Z"
                          fill="currentColor"
                          fillRule="evenodd"
                          clipRule="evenodd"
                        />
                      </svg>
                    </button>
                  </Link>
                </div>
              )}
            </>
          )}
        </div>
      </aside>
    </>
  );
}

export default Sidebar;
