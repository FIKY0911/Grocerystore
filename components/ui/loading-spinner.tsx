import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg";
  text?: string;
  className?: string;
}

const sizeClasses = {
  sm: "w-4 h-4",
  md: "w-6 h-6",
  lg: "w-8 h-8",
};

export const LoadingSpinner = ({
  size = "md",
  text,
  className,
}: LoadingSpinnerProps) => {
  return (
    <div className={cn("flex items-center justify-center gap-2", className)}>
      <Loader2 className={cn("animate-spin text-shop_dark_green", sizeClasses[size])} />
      {text && <span className="text-gray-600">{text}</span>}
    </div>
  );
};

interface FullPageLoaderProps {
  text?: string;
}

export const FullPageLoader = ({ text = "Memuat..." }: FullPageLoaderProps) => {
  return (
    <div className="fixed inset-0 bg-white/80 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="w-12 h-12 animate-spin text-shop_dark_green" />
        <p className="text-gray-600 font-medium">{text}</p>
      </div>
    </div>
  );
};

export default LoadingSpinner;
