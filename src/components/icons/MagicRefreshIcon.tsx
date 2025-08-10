import * as React from "react";
import { RefreshCcw, Wand2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface MagicRefreshIconProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  className?: string;
}

// A composite icon: circular refresh arrows with a magic wand centered
export const MagicRefreshIcon: React.FC<MagicRefreshIconProps> = ({ size = 20, className, ...props }) => {
  return (
    <div className={cn("relative inline-block", className)} style={{ width: size, height: size }}>
      <RefreshCcw className="absolute inset-0" width={size} height={size} aria-hidden="true" />
      <Wand2 className="absolute inset-0 m-auto" width={Math.round(size * 0.6)} height={Math.round(size * 0.6)} aria-hidden="true" />
      <span className="sr-only">Magic refresh</span>
    </div>
  );
};

export default MagicRefreshIcon;
