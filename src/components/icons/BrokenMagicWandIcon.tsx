import React from 'react';

interface BrokenMagicWandIconProps {
  size?: number;
  className?: string;
}

export const BrokenMagicWandIcon: React.FC<BrokenMagicWandIconProps> = ({ 
  size = 40, 
  className = "" 
}) => {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 60 60" 
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Broken wand shaft - two pieces */}
      <path 
        d="M10 50 L25 35" 
        stroke="#9ca3af" 
        strokeWidth="3" 
        strokeLinecap="round"
      />
      <path 
        d="M30 30 L45 15" 
        stroke="#9ca3af" 
        strokeWidth="3" 
        strokeLinecap="round"
      />
      
      {/* Crack/break indication */}
      <path 
        d="M24 36 L26 34 L28 32" 
        stroke="#ef4444" 
        strokeWidth="2" 
        strokeLinecap="round"
      />
      
      {/* Dimmed refresh ring (broken) */}
      <circle 
        cx="45" 
        cy="15" 
        r="8" 
        fill="none" 
        stroke="#d1d5db" 
        strokeWidth="1.5"
        opacity="0.4"
      />
      
      {/* Cross mark on the ring */}
      <path 
        d="M40 10 L50 20 M50 10 L40 20" 
        stroke="#ef4444" 
        strokeWidth="2" 
        strokeLinecap="round"
        opacity="0.7"
      />
      
      {/* Fading sparkles/stars */}
      <circle cx="15" cy="45" r="1.5" fill="#d1d5db" opacity="0.3"/>
      <circle cx="35" cy="25" r="1" fill="#d1d5db" opacity="0.2"/>
      <circle cx="20" cy="40" r="1" fill="#d1d5db" opacity="0.25"/>
    </svg>
  );
};