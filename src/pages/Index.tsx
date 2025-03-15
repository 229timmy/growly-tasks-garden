
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Loader } from "@/components/ui/loader";

const Index = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Auto-redirect to dashboard after a short delay
    const timer = setTimeout(() => {
      navigate("/dashboard");
    }, 1500);
    
    return () => clearTimeout(timer);
  }, [navigate]);

  const handleGetStarted = () => {
    navigate("/dashboard");
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-accent to-background p-4">
      <div className="text-center max-w-2xl glass-panel p-8 rounded-xl">
        <h1 className="text-4xl font-bold mb-4">Welcome to Growly</h1>
        <p className="text-xl text-muted-foreground mb-8">Your personal plant management dashboard</p>
        
        <div className="flex flex-col items-center gap-4">
          <Button size="lg" onClick={handleGetStarted} className="px-8">
            Get Started
          </Button>
          <div className="mt-4 flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Redirecting to dashboard</span>
            <Loader size="sm" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
