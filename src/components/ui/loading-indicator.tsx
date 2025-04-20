
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface LoadingIndicatorProps {
  fullScreen?: boolean;
  size?: "sm" | "md" | "lg";
}

export function LoadingIndicator({ fullScreen = false, size = "md" }: LoadingIndicatorProps) {
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-8 w-8",
    lg: "h-12 w-12"
  };

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center">
        <Loader2 className={cn("animate-spin", sizeClasses[size])} />
      </div>
    );
  }

  return <Loader2 className={cn("animate-spin", sizeClasses[size])} />;
}
