import * as React from "react";

export interface FriendlyUpArrowIconProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
}

// A kid-friendly, filled up arrow icon using the design system's destructive color
// Uses currentColor so you can control color via Tailwind, e.g., className="text-destructive"
export const FriendlyUpArrowIcon: React.FC<FriendlyUpArrowIconProps> = ({ size = 28, className, ...props }) => {
  return (
    <svg
      viewBox="0 0 64 64"
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      className={className}
      aria-hidden="true"
      {...props}
    >
      {/* Soft rounded background halo for a playful look */}
      <circle cx="32" cy="32" r="30" fill="currentColor" opacity="0.08" />

      {/* Filled, rounded up arrow */}
      <path
        fill="currentColor"
        d="M45.2 30.8c1.56 1.56 1.56 4.09 0 5.66a4 4 0 0 1-5.66 0L36 32.92V48a4 4 0 0 1-4 4h0a4 4 0 0 1-4-4V32.92l-3.54 3.54a4 4 0 0 1-5.66-5.66l12-12a4 4 0 0 1 5.66 0l12 12Z"
      />

      {/* Subtle highlight near the top for a friendly, bubbly feel */}
      <path
        d="M32 10c7 0 12 3 14 5"
        stroke="currentColor"
        strokeOpacity="0.25"
        strokeWidth="6"
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  );
};

export default FriendlyUpArrowIcon;
