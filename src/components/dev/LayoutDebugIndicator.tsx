import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Monitor, Smartphone, Tablet, Settings, Eye } from "lucide-react";
import { useState } from "react";
import type { ReaderLayout } from "@/hooks/useReaderLayout";

interface LayoutDebugIndicatorProps {
  layout: ReaderLayout;
  lowEnd: boolean;
  reason?: string;
  onLayoutOverride: (layout: ReaderLayout | null) => void;
}

export const LayoutDebugIndicator = ({
  layout,
  lowEnd,
  reason,
  onLayoutOverride
}: LayoutDebugIndicatorProps) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const getLayoutIcon = (layout: ReaderLayout) => {
    switch (layout) {
      case "classic": return <Smartphone className="w-3 h-3" />;
      case "modern": return <Tablet className="w-3 h-3" />;
      case "split": return <Monitor className="w-3 h-3" />;
    }
  };

  const getLayoutColor = (layout: ReaderLayout) => {
    switch (layout) {
      case "classic": return "bg-orange-100 text-orange-800 border-orange-200";
      case "modern": return "bg-blue-100 text-blue-800 border-blue-200";
      case "split": return "bg-green-100 text-green-800 border-green-200";
    }
  };

  const getDeviceInfo = () => {
    const deviceMemory = (navigator as any).deviceMemory ?? "Unknown";
    const cores = navigator.hardwareConcurrency ?? "Unknown";
    const reduceMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    const isWide = window.matchMedia?.("(min-width: 1280px)").matches;
    
    return {
      memory: deviceMemory,
      cores,
      reduceMotion,
      isWide,
      lowEnd
    };
  };

  if (!isExpanded) {
    return (
      <div className="fixed top-4 right-4 z-50 flex items-center gap-2">
        <Badge 
          className={`${getLayoutColor(layout)} flex items-center gap-1 cursor-pointer`}
          onClick={() => setIsExpanded(true)}
        >
          {getLayoutIcon(layout)}
          {layout}
          {lowEnd && <span className="text-xs">(low-end)</span>}
        </Badge>
      </div>
    );
  }

  const deviceInfo = getDeviceInfo();

  return (
    <div className="fixed top-4 right-4 z-50">
      <Card className="w-80 shadow-lg border-2">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Settings className="w-4 h-4" />
              <span className="font-semibold text-sm">Layout Debug</span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0"
              onClick={() => setIsExpanded(false)}
            >
              <Eye className="w-3 h-3" />
            </Button>
          </div>

          <div className="space-y-3">
            <div>
              <div className="text-xs text-muted-foreground mb-1">Current Layout</div>
              <Badge className={`${getLayoutColor(layout)} flex items-center gap-1 w-fit`}>
                {getLayoutIcon(layout)}
                {layout}
              </Badge>
              {reason && (
                <div className="text-xs text-muted-foreground mt-1">
                  Reason: {reason}
                </div>
              )}
            </div>

            <div>
              <div className="text-xs text-muted-foreground mb-1">Device Info</div>
              <div className="text-xs space-y-1">
                <div>Memory: {deviceInfo.memory}GB</div>
                <div>Cores: {deviceInfo.cores}</div>
                <div>Wide Screen: {deviceInfo.isWide ? "Yes" : "No"}</div>
                <div>Reduced Motion: {deviceInfo.reduceMotion ? "Yes" : "No"}</div>
                <div>Low-End Device: {deviceInfo.lowEnd ? "Yes" : "No"}</div>
              </div>
            </div>

            <div>
              <div className="text-xs text-muted-foreground mb-2">Override Layout</div>
              <div className="flex flex-wrap gap-1">
                <Button
                  variant="outline"
                  size="sm"
                  className="h-6 text-xs"
                  onClick={() => onLayoutOverride("classic")}
                >
                  Classic
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-6 text-xs"
                  onClick={() => onLayoutOverride("modern")}
                >
                  Modern
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-6 text-xs"
                  onClick={() => onLayoutOverride("split")}
                >
                  Split
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 text-xs"
                  onClick={() => onLayoutOverride(null)}
                >
                  Auto
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};