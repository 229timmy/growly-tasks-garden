
import { cn } from "@/lib/utils";

interface LoaderProps {
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function Loader({ size = "md", className }: LoaderProps) {
  const sizeClasses = {
    sm: "w-4 h-4 border-2",
    md: "w-6 h-6 border-2",
    lg: "w-8 h-8 border-3",
  };

  return (
    <div
      className={cn(
        "inline-block rounded-full border-t-transparent animate-spinner",
        sizeClasses[size],
        "border-primary",
        className
      )}
    />
  );
}

export function PageLoader() {
  return (
    <div className="flex justify-center items-center h-[50vh]">
      <div className="flex flex-col items-center gap-2">
        <Loader size="lg" />
        <p className="text-sm text-muted-foreground animate-pulse-opacity">Loading...</p>
      </div>
    </div>
  );
}
