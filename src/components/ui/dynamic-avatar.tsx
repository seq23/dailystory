import React from 'react'
import type { AvatarType, SkinTone, HairStyle, HairColor } from "@/types"

// Import the original beautiful avatar images
import avatarBoyPale from "@/assets/avatar-boy-pale.jpg"
import avatarBoyLight from "@/assets/avatar-boy-light.jpg"
import avatarBoyMedium from "@/assets/avatar-boy-medium.jpg"
import avatarBoyOlive from "@/assets/avatar-boy-olive.jpg"
import avatarBoyDark from "@/assets/avatar-boy-dark.jpg"
import avatarGirlPale from "@/assets/avatar-girl-pale.jpg"
import avatarGirlLight from "@/assets/avatar-girl-light.jpg"
import avatarGirlMedium from "@/assets/avatar-girl-medium.jpg"
import avatarGirlOlive from "@/assets/avatar-girl-olive.jpg"
import avatarGirlDark from "@/assets/avatar-girl-dark.jpg"

interface DynamicAvatarProps {
  type: AvatarType
  skinTone: SkinTone
  hairStyle: HairStyle
  hairColor: HairColor
  hasFreckles: boolean
  size?: number
  className?: string
}

const avatarImages = {
  boy: {
    pale: avatarBoyPale,
    light: avatarBoyLight,
    medium: avatarBoyMedium,
    olive: avatarBoyOlive,
    dark: avatarBoyDark,
  },
  girl: {
    pale: avatarGirlPale,
    light: avatarGirlLight,
    medium: avatarGirlMedium,
    olive: avatarGirlOlive,
    dark: avatarGirlDark,
  },
}

const hairColorFilters = {
  blonde: "sepia(1) saturate(2) hue-rotate(35deg) brightness(1.3)",
  brown: "sepia(1) saturate(0.8) hue-rotate(15deg) brightness(0.9)",
  black: "sepia(1) saturate(0) brightness(0.3)",
  red: "sepia(1) saturate(2) hue-rotate(320deg) brightness(1.1)",
  gray: "sepia(1) saturate(0) brightness(0.7)"
}

export const DynamicAvatar: React.FC<DynamicAvatarProps> = ({
  type,
  skinTone,
  hairStyle,
  hairColor,
  hasFreckles,
  size = 128,
  className = ""
}) => {
  // Get the base avatar image
  const displayType = type === "prefer-not-to-answer" ? "boy" : type
  const baseAvatar = avatarImages[displayType as "boy" | "girl"]?.[skinTone]
  
  if (!baseAvatar) return null

  return (
    <div className={`relative inline-block ${className}`} style={{ width: size, height: size }}>
      {/* Base avatar image */}
      <img
        src={baseAvatar}
        alt={`${type} avatar`}
        className="w-full h-full object-cover rounded-full"
        style={{ width: size, height: size }}
      />
      
      {/* Hair color overlay */}
      <div 
        className="absolute inset-0 rounded-full mix-blend-multiply pointer-events-none"
        style={{
          background: `linear-gradient(to bottom, transparent 20%, ${hairColorFilters[hairColor] ? 'rgba(139, 69, 19, 0.3)' : 'transparent'} 60%, transparent 80%)`,
          filter: hairColorFilters[hairColor],
          opacity: 0.6
        }}
      />
      
      {/* Hair style overlay */}
      <svg 
        className="absolute inset-0 w-full h-full pointer-events-none" 
        viewBox="0 0 100 100"
        style={{ width: size, height: size }}
      >
        {/* Hair style modifications */}
        {hairStyle === 'braids' && (
          <g fill="none" stroke="rgba(139, 69, 19, 0.4)" strokeWidth="2" strokeLinecap="round">
            <path d="M15 40 Q20 45 15 50 Q20 55 15 60" />
            <path d="M85 40 Q80 45 85 50 Q80 55 85 60" />
          </g>
        )}
        
        {hairStyle === 'dreadlocks' && (
          <g fill="rgba(139, 69, 19, 0.3)">
            <rect x="20" y="45" width="2" height="25" rx="1" />
            <rect x="25" y="42" width="2" height="30" rx="1" />
            <rect x="30" y="45" width="2" height="28" rx="1" />
            <rect x="68" y="45" width="2" height="28" rx="1" />
            <rect x="73" y="42" width="2" height="30" rx="1" />
            <rect x="78" y="45" width="2" height="25" rx="1" />
          </g>
        )}
        
        {hairStyle === 'curly' && (
          <g fill="none" stroke="rgba(139, 69, 19, 0.3)" strokeWidth="1.5">
            <circle cx="25" cy="35" r="3" opacity="0.5" />
            <circle cx="35" cy="30" r="2.5" opacity="0.5" />
            <circle cx="45" cy="28" r="3" opacity="0.5" />
            <circle cx="55" cy="30" r="2.5" opacity="0.5" />
            <circle cx="65" cy="35" r="3" opacity="0.5" />
            <circle cx="75" cy="40" r="2" opacity="0.5" />
          </g>
        )}
        
        {hairStyle === 'long' && (
          <g fill="none" stroke="rgba(139, 69, 19, 0.2)" strokeWidth="1">
            <path d="M20 60 Q25 80 30 85" strokeLinecap="round" />
            <path d="M30 65 Q35 85 40 90" strokeLinecap="round" />
            <path d="M60 65 Q65 85 70 90" strokeLinecap="round" />
            <path d="M70 60 Q75 80 80 85" strokeLinecap="round" />
          </g>
        )}
        
        {/* Freckles overlay */}
        {hasFreckles && (
          <g fill="#D2691E" opacity="0.6">
            <circle cx="35" cy="55" r="0.8" />
            <circle cx="42" cy="58" r="0.6" />
            <circle cx="48" cy="54" r="0.7" />
            <circle cx="52" cy="60" r="0.5" />
            <circle cx="58" cy="56" r="0.8" />
            <circle cx="45" cy="52" r="0.4" />
            <circle cx="40" cy="62" r="0.6" />
          </g>
        )}
      </svg>
    </div>
  )
}