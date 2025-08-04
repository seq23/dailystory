import React from 'react';
import { cn } from '@/lib/utils';

interface ProgressTowerProps {
  value: number;
  maxValue: number;
  label: string;
  icon: React.ReactNode;
  color: 'blue' | 'green' | 'gold';
  className?: string;
}

const colorGradients = {
  blue: 'from-blue-400 to-blue-600',
  green: 'from-green-400 to-green-600', 
  gold: 'from-yellow-400 to-amber-500'
};

const colorBorders = {
  blue: 'border-blue-300',
  green: 'border-green-300',
  gold: 'border-yellow-300'
};

export const ProgressTower: React.FC<ProgressTowerProps> = ({
  value,
  maxValue,
  label,
  icon,
  color,
  className
}) => {
  const percentage = Math.min((value / maxValue) * 100, 100);
  const milestoneAchieved = value > 0 && value % 50 === 0;

  return (
    <div className={cn("flex flex-col items-center gap-2", className)}>
      {/* Icon and Value */}
      <div className="flex flex-col items-center gap-1">
        <div className={cn(
          "w-8 h-8 rounded-full flex items-center justify-center bg-gradient-to-br shadow-sm",
          `${colorGradients[color]} text-white`
        )}>
          {icon}
        </div>
        <span className="text-xs font-bold text-gray-700">{value}</span>
      </div>

      {/* Tower Container */}
      <div className="relative">
        {/* Tower Background */}
        <div className={cn(
          "w-12 h-32 bg-gray-100 rounded-lg border-2 relative overflow-hidden",
          colorBorders[color]
        )}>
          {/* Top Label (Max Value) */}
          <div className="absolute -top-5 left-1/2 transform -translate-x-1/2">
            <span className="text-xs text-gray-400 font-medium">{maxValue}</span>
          </div>

          {/* Tick Marks */}
          {[...Array(6)].map((_, i) => {
            const tickValue = i * 100;
            const tickPosition = (tickValue / maxValue) * 100;
            const isMajorTick = tickValue % 100 === 0;
            
            return (
              <div
                key={i}
                className={cn(
                  "absolute w-full border-t border-gray-300",
                  isMajorTick ? "border-gray-400" : "border-gray-200"
                )}
                style={{ bottom: `${tickPosition}%` }}
              >
                {isMajorTick && tickValue > 0 && tickValue < maxValue && (
                  <span className="absolute -right-8 -top-2 text-xs text-gray-500">
                    {tickValue}
                  </span>
                )}
              </div>
            );
          })}

          {/* Progress Fill */}
          <div
            className={cn(
              "absolute bottom-0 w-full bg-gradient-to-t transition-all duration-800 ease-out rounded-b-lg",
              colorGradients[color],
              milestoneAchieved && "animate-pulse"
            )}
            style={{ height: `${percentage}%` }}
          />

          {/* Celebration Effect */}
          {milestoneAchieved && (
            <div className="absolute inset-0 pointer-events-none">
              {[...Array(8)].map((_, i) => (
                <div
                  key={i}
                  className="absolute w-1.5 h-1.5 bg-yellow-300 rounded-full animate-ping"
                  style={{
                    left: `${15 + (i * 8)}%`,
                    top: `${8 + (i * 12)}%`,
                    animationDelay: `${i * 150}ms`
                  }}
                />
              ))}
            </div>
          )}

          {/* Bottom Label (Zero) */}
          <div className="absolute -bottom-5 left-1/2 transform -translate-x-1/2">
            <span className="text-xs text-gray-400 font-medium">0</span>
          </div>
        </div>
      </div>

      {/* Label */}
      <span className="text-xs text-center text-gray-600 font-medium max-w-[60px] leading-tight">
        {label}
      </span>
    </div>
  );
};