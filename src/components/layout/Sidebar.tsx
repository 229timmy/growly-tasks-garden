
import React from "react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { 
  LayoutDashboard, 
  Sprout, 
  CheckSquare, 
  BarChart3, 
  Settings,
  Users,
  HelpCircle
} from "lucide-react";

interface SidebarProps {
  isOpen: boolean;
}

interface NavItem {
  label: string;
  icon: React.ReactNode;
  href: string;
}

export function Sidebar({ isOpen }: SidebarProps) {
  const location = useLocation();
  
  const mainNavItems: NavItem[] = [
    {
      label: "Dashboard",
      icon: <LayoutDashboard className="h-5 w-5" />,
      href: "/dashboard"
    },
    {
      label: "Grows",
      icon: <Sprout className="h-5 w-5" />,
      href: "/grows"
    },
    {
      label: "Tasks",
      icon: <CheckSquare className="h-5 w-5" />,
      href: "/tasks"
    },
    {
      label: "Plants",
      icon: <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M6 9L11.9922 4L18 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M12 4V13.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        <path d="M8.38965 19.5C7.04588 17.5293 6 15.5293 6 13C6 12.1182 6.19582 11.257 6.57664 10.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        <path d="M15.61 19.5C16.9538 17.5293 18 15.5293 18 13C18 12.1182 17.8042 11.257 17.4234 10.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        <path d="M8.5 19.5H15.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      </svg>,
      href: "/plants"
    },
    {
      label: "Analytics",
      icon: <BarChart3 className="h-5 w-5" />,
      href: "/analytics"
    },
  ];
  
  const secondaryNavItems: NavItem[] = [
    {
      label: "Settings",
      icon: <Settings className="h-5 w-5" />,
      href: "/settings"
    },
    {
      label: "Team",
      icon: <Users className="h-5 w-5" />,
      href: "/team"
    },
    {
      label: "Help",
      icon: <HelpCircle className="h-5 w-5" />,
      href: "/help"
    }
  ];

  return (
    <aside
      className={cn(
        "fixed inset-y-0 left-0 z-50 flex flex-col border-r bg-background transition-all duration-300 ease-in-out",
        isOpen ? "w-64" : "w-20"
      )}
    >
      <div className="flex h-16 items-center justify-center border-b px-4">
        <Link to="/" className="flex items-center gap-2">
          <div className="flex items-center justify-center w-10 h-10 rounded-md bg-primary/10">
            <svg className="h-6 w-6 text-primary" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M12 2L4 6V12C4 15.31 7.58 20 12 22C16.42 20 20 15.31 20 12V6L12 2Z"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path d="M8 11.8C8 14.1478 9.75 16.2404 12 17.2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              <path d="M12 18C13.6569 18 15 14.4183 15 10C15 5.58172 13.6569 2 12 2" stroke="currentColor" strokeWidth="2" />
            </svg>
          </div>
          {isOpen && (
            <div className="transition-opacity animate-fade-in">
              <span className="font-semibold text-lg">Grow</span>
              <span className="font-medium text-primary text-lg">Manager</span>
            </div>
          )}
        </Link>
      </div>
      
      <div className="flex-1 overflow-auto py-4">
        <nav className="grid items-start px-2 gap-2">
          {mainNavItems.map((item, index) => (
            <Link
              key={item.href}
              to={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 transition-all",
                "hover:bg-accent",
                location.pathname === item.href
                  ? "bg-accent text-accent-foreground font-medium"
                  : "text-muted-foreground",
                !isOpen && "justify-center px-0"
              )}
              style={{
                animationDelay: `${index * 50}ms`,
              }}
            >
              {item.icon}
              {isOpen && <div className="animate-fade-in">{item.label}</div>}
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
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 transition-all",
                "hover:bg-accent",
                location.pathname === item.href
                  ? "bg-accent text-accent-foreground font-medium"
                  : "text-muted-foreground",
                !isOpen && "justify-center px-0"
              )}
            >
              {item.icon}
              {isOpen && <div className="animate-fade-in">{item.label}</div>}
            </Link>
          ))}
        </nav>
      </div>
      
      <div className="border-t p-4">
        {isOpen ? (
          <div className="animate-fade-in rounded-lg bg-accent p-4">
            <div className="mb-2 flex items-center gap-2">
              <span className="tag bg-primary/20 text-primary">Free Plan</span>
              <span className="text-xs text-muted-foreground">3/3 Grows</span>
            </div>
            <p className="text-xs text-muted-foreground mb-3">
              Upgrade to Pro for more grows and features
            </p>
            <Link to="/upgrade">
              <button className="w-full bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 rounded-md text-sm font-medium transition-colors">
                Upgrade
              </button>
            </Link>
          </div>
        ) : (
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
      </div>
    </aside>
  );
}

export default Sidebar;
