import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Star, RotateCcw, CheckCircle, AlertTriangle } from 'lucide-react';

interface QualityControlsProps {
  currentParameters: {
    cfgScale: number;
    steps: number;
    seed?: number | null;
  };
  onParametersChange: (params: any) => void;
  onSeedChange: (seed: number | null) => void;
}

interface SeedHistory {
  seed: number;
  parameters: any;
  quality: number;
  timestamp: Date;
  imageURL?: string;
}

export function RunwareQualityControls({ 
  currentParameters, 
  onParametersChange, 
  onSeedChange 
}: QualityControlsProps) {
  const [seedHistory, setSeedHistory] = useState<SeedHistory[]>([]);
  const [qualityRating, setQualityRating] = useState<number>(0);

  // Load seed history from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('runware-seed-history');
    if (saved) {
      setSeedHistory(JSON.parse(saved));
    }
  }, []);

  // Save seed history to localStorage
  const saveSeedHistory = (history: SeedHistory[]) => {
    setSeedHistory(history);
    localStorage.setItem('runware-seed-history', JSON.stringify(history));
  };

  const getParameterStatus = () => {
    const { cfgScale, steps } = currentParameters;
    const isOptimal = (cfgScale >= 3 && cfgScale <= 4) && (steps >= 8 && steps <= 12);
    
    if (isOptimal) {
      return { status: 'optimal', color: 'default', icon: CheckCircle };
    } else {
      return { status: 'suboptimal', color: 'destructive', icon: AlertTriangle };
    }
  };

  const applyOptimalSettings = () => {
    onParametersChange({
      cfgScale: 3.5,
      steps: 10
    });
  };

  const addToSeedHistory = (seed: number, imageURL?: string) => {
    const newEntry: SeedHistory = {
      seed,
      parameters: { ...currentParameters },
      quality: qualityRating || 3,
      timestamp: new Date(),
      imageURL
    };
    
    const updated = [newEntry, ...seedHistory.slice(0, 9)]; // Keep only last 10
    saveSeedHistory(updated);
  };

  const useGoodSeed = (entry: SeedHistory) => {
    onSeedChange(entry.seed);
    onParametersChange(entry.parameters);
  };

  const getTopSeeds = () => {
    return seedHistory
      .filter(entry => entry.quality >= 4)
      .sort((a, b) => b.quality - a.quality)
      .slice(0, 3);
  };

  const parameterStatus = getParameterStatus();
  const StatusIcon = parameterStatus.icon;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <StatusIcon className="w-5 h-5" />
          Quality Controls
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Parameter Status */}
        <div className="flex items-center justify-between">
          <Label>Parameter Status</Label>
          <Badge variant={parameterStatus.color as any}>
            {parameterStatus.status === 'optimal' ? 'Optimal' : 'Needs Optimization'}
          </Badge>
        </div>

        {parameterStatus.status === 'suboptimal' && (
          <div className="p-3 bg-muted rounded-lg">
            <p className="text-sm text-muted-foreground mb-2">
              For best children's book quality, use CFG Scale 3-4 and Steps 8-12
            </p>
            <Button
              onClick={applyOptimalSettings}
              size="sm"
              className="w-full"
            >
              Apply Optimal Settings
            </Button>
          </div>
        )}

        {/* Quality Rating */}
        <div>
          <Label>Rate Last Generation</Label>
          <div className="flex gap-1 mt-1">
            {[1, 2, 3, 4, 5].map((rating) => (
              <Button
                key={rating}
                variant={qualityRating >= rating ? "default" : "outline"}
                size="sm"
                onClick={() => setQualityRating(rating)}
                className="p-1"
              >
                <Star className="w-3 h-3" />
              </Button>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="space-y-2">
          <Label>Quick Actions</Label>
          <div className="grid grid-cols-2 gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onSeedChange(null)}
            >
              <RotateCcw className="w-3 h-3 mr-1" />
              Random Seed
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                const topSeed = getTopSeeds()[0];
                if (topSeed) useGoodSeed(topSeed);
              }}
              disabled={getTopSeeds().length === 0}
            >
              Use Best Seed
            </Button>
          </div>
        </div>

        {/* Seed History */}
        {getTopSeeds().length > 0 && (
          <div>
            <Label>Top Quality Seeds</Label>
            <div className="space-y-1 mt-2">
              {getTopSeeds().map((entry, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-2 bg-muted rounded-md"
                >
                  <div className="flex items-center gap-2">
                    <div className="flex">
                      {Array.from({ length: entry.quality }).map((_, i) => (
                        <Star key={i} className="w-3 h-3 fill-current" />
                      ))}
                    </div>
                    <span className="text-xs text-muted-foreground">
                      Seed: {entry.seed.toString().slice(-6)}...
                    </span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => useGoodSeed(entry)}
                    className="text-xs"
                  >
                    Use
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Success Rate Display */}
        <div className="text-center p-2 bg-muted rounded-lg">
          <p className="text-xs text-muted-foreground">
            Quality Generations: {seedHistory.filter(s => s.quality >= 4).length} / {seedHistory.length}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}