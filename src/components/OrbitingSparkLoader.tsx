import { BookOpen } from "lucide-react";
import { cn } from "@/lib/utils";

interface OrbitingSparkLoaderProps {
  className?: string;
  isPremium?: boolean;
  size?: "sm" | "md" | "lg";
}

export function OrbitingSparkLoader({ className, isPremium = false, size = "md" }: OrbitingSparkLoaderProps) {
  const sizeClasses = {
    sm: "w-28 h-28",
    md: "w-40 h-40",
    lg: "w-56 h-56",
  } as const;

  const dotMain = isPremium ? "bg-accent" : "bg-primary";
  const dotAlt = isPremium ? "bg-primary" : "bg-accent";

  return (
    <div
      className={cn("relative select-none", sizeClasses[size], className)}
      role="img"
      aria-label="Loading animation"
    >
      {/* Static rings */}
      <div className="absolute inset-0 rounded-full border-2 border-primary/20" />
      <div className="absolute inset-4 rounded-full border border-primary/10" />

      {/* Outer orbit (clockwise) */}
      <div className="absolute inset-0 motion-safe:animate-[spin_12s_linear_infinite] motion-reduce:animate-none">
        <div
          className={cn(
            "absolute left-1/2 top-0 -translate-x-1/2 w-3 h-3 rounded-full shadow",
            dotMain
          )}
        />
      </div>

      {/* Inner orbit (reverse) */}
      <div className="absolute inset-4 motion-safe:animate-[spin_18s_linear_infinite] motion-reduce:animate-none [animation-direction:reverse]">
        <div
          className={cn(
            "absolute left-1/2 bottom-0 -translate-x-1/2 w-2.5 h-2.5 rounded-full opacity-90",
            dotAlt
          )}
        />
      </div>

      {/* Center icon */}
      <div className="absolute inset-0 flex items-center justify-center">
        <BookOpen className="text-primary w-12 h-12 md:w-14 md:h-14 motion-safe:animate-pulse" />
      </div>
    </div>
  );
}
