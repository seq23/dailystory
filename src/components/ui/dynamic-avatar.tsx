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

const hairColors = {
  blonde: "#f4e1a6",
  brown: "#8b4513", 
  black: "#2c2c2c",
  red: "#cc6600",
  gray: "#999999"
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

  const hairHex = hairColors[hairColor]
  
  // Create hair mask based on avatar type
  const getHairMask = () => {
    if (displayType === 'girl') {
      switch (hairStyle) {
        case 'short':
          return "polygon(15% 20%, 85% 20%, 80% 45%, 20% 45%)"
        case 'long':
          return "polygon(10% 15%, 90% 15%, 95% 80%, 5% 80%)"
        case 'braids':
          return "polygon(15% 20%, 85% 20%, 80% 45%, 20% 45%), polygon(5% 40%, 15% 40%, 12% 70%, 8% 70%), polygon(85% 40%, 95% 40%, 92% 70%, 88% 70%)"
        case 'dreadlocks':
          return "polygon(15% 20%, 85% 20%, 80% 45%, 20% 45%)"
        case 'curly':
          return "polygon(10% 18%, 90% 18%, 88% 50%, 12% 50%)"
        case 'straight':
          return "polygon(12% 15%, 88% 15%, 90% 60%, 10% 60%)"
        default:
          return "polygon(15% 20%, 85% 20%, 80% 45%, 20% 45%)"
      }
    } else {
      switch (hairStyle) {
        case 'short':
          return "polygon(20% 25%, 80% 25%, 75% 40%, 25% 40%)"
        case 'long':
          return "polygon(15% 20%, 85% 20%, 90% 65%, 10% 65%)"
        case 'braids':
          return "polygon(20% 25%, 80% 25%, 75% 40%, 25% 40%), polygon(8% 35%, 18% 35%, 15% 65%, 11% 65%), polygon(82% 35%, 92% 35%, 89% 65%, 85% 65%)"
        case 'dreadlocks':
          return "polygon(20% 25%, 80% 25%, 75% 40%, 25% 40%)"
        case 'curly':
          return "polygon(18% 22%, 82% 22%, 80% 45%, 20% 45%)"
        case 'straight':
          return "polygon(18% 20%, 82% 20%, 85% 55%, 15% 55%)"
        default:
          return "polygon(20% 25%, 80% 25%, 75% 40%, 25% 40%)"
      }
    }
  }

  return (
    <div className={`relative inline-block ${className}`} style={{ width: size, height: size }}>
      {/* Base avatar image */}
      <img
        src={baseAvatar}
        alt={`${type} avatar`}
        className="w-full h-full object-cover rounded-full"
        style={{ width: size, height: size }}
      />
      
      {/* Hair color replacement layer */}
      <div 
        className="absolute inset-0 rounded-full"
        style={{
          background: `linear-gradient(135deg, ${hairHex}, ${hairHex}dd)`,
          clipPath: getHairMask(),
          mixBlendMode: 'multiply',
        }}
      />
      
      {/* Hair highlights layer */}
      <div 
        className="absolute inset-0 rounded-full"
        style={{
          background: `linear-gradient(45deg, transparent 30%, rgba(255,255,255,0.3) 50%, transparent 70%)`,
          clipPath: getHairMask(),
        }}
      />
      
      {/* Hair texture based on style */}
      <svg 
        className="absolute inset-0 w-full h-full pointer-events-none" 
        viewBox="0 0 100 100"
        style={{ width: size, height: size }}
      >
        <defs>
          <mask id="hairMask">
            <rect width="100" height="100" fill="white" />
            <g fill="black">
              {getHairMask().includes('polygon') && (
                <polygon points="15,20 85,20 80,45 20,45" />
              )}
            </g>
          </mask>
        </defs>
        
        {/* Hair style specific textures */}
        {hairStyle === 'braids' && (
          <g mask="url(#hairMask)" stroke={hairHex} strokeWidth="1.5" fill="none">
            {/* Left braid */}
            <path d="M12 40 Q15 45 12 50 Q15 55 12 60 Q15 65 12 70" strokeWidth="3" />
            <path d="M10 42 L14 42 M10 52 L14 52 M10 62 L14 62" stroke="rgba(255,255,255,0.5)" />
            {/* Right braid */}
            <path d="M88 40 Q85 45 88 50 Q85 55 88 60 Q85 65 88 70" strokeWidth="3" />
            <path d="M86 42 L90 42 M86 52 L90 52 M86 62 L90 62" stroke="rgba(255,255,255,0.5)" />
          </g>
        )}
        
        {hairStyle === 'dreadlocks' && (
          <g mask="url(#hairMask)" fill={hairHex}>
            {/* Individual dreads */}
            <rect x="22" y="40" width="3" height="30" rx="1.5" opacity="0.9" />
            <rect x="28" y="38" width="3" height="35" rx="1.5" opacity="0.8" />
            <rect x="34" y="40" width="3" height="32" rx="1.5" opacity="0.9" />
            <rect x="40" y="36" width="3" height="38" rx="1.5" opacity="0.7" />
            <rect x="46" y="40" width="3" height="32" rx="1.5" opacity="0.9" />
            <rect x="52" y="38" width="3" height="35" rx="1.5" opacity="0.8" />
            <rect x="58" y="40" width="3" height="30" rx="1.5" opacity="0.9" />
            <rect x="64" y="42" width="3" height="28" rx="1.5" opacity="0.8" />
            <rect x="70" y="40" width="3" height="30" rx="1.5" opacity="0.9" />
            
            {/* Dread texture lines */}
            <g stroke="rgba(0,0,0,0.2)" strokeWidth="0.5">
              <line x1="22" y1="45" x2="25" y2="45" />
              <line x1="22" y1="55" x2="25" y2="55" />
              <line x1="28" y1="48" x2="31" y2="48" />
              <line x1="28" y1="58" x2="31" y2="58" />
              <line x1="34" y1="45" x2="37" y2="45" />
              <line x1="34" y1="55" x2="37" y2="55" />
              <line x1="46" y1="45" x2="49" y2="45" />
              <line x1="46" y1="55" x2="49" y2="55" />
              <line x1="58" y1="45" x2="61" y2="45" />
              <line x1="58" y1="55" x2="61" y2="55" />
              <line x1="70" y1="45" x2="73" y2="45" />
              <line x1="70" y1="55" x2="73" y2="55" />
            </g>
          </g>
        )}
        
        {hairStyle === 'curly' && (
          <g mask="url(#hairMask)" fill="none" stroke={hairHex} strokeWidth="2" opacity="0.6">
            <circle cx="25" cy="30" r="3" />
            <circle cx="35" cy="25" r="2.5" />
            <circle cx="45" cy="27" r="3.5" />
            <circle cx="55" cy="25" r="2.5" />
            <circle cx="65" cy="30" r="3" />
            <circle cx="75" cy="35" r="2" />
            <circle cx="30" cy="38" r="2" />
            <circle cx="50" cy="35" r="3" />
            <circle cx="70" cy="40" r="2.5" />
          </g>
        )}
        
        {/* Realistic freckles */}
        {hasFreckles && (
          <g>
            {/* Varied freckle sizes and colors for realism */}
            <circle cx="32" cy="55" r="1.2" fill="#D2691E" opacity="0.7" />
            <circle cx="38" cy="58" r="0.8" fill="#CD853F" opacity="0.6" />
            <circle cx="45" cy="54" r="1.0" fill="#DEB887" opacity="0.5" />
            <circle cx="52" cy="60" r="0.9" fill="#D2691E" opacity="0.7" />
            <circle cx="58" cy="56" r="1.1" fill="#CD853F" opacity="0.6" />
            <circle cx="42" cy="52" r="0.7" fill="#DEB887" opacity="0.5" />
            <circle cx="48" cy="62" r="0.8" fill="#D2691E" opacity="0.6" />
            <circle cx="35" cy="52" r="0.6" fill="#CD853F" opacity="0.5" />
            <circle cx="55" cy="58" r="0.9" fill="#DEB887" opacity="0.6" />
            <circle cx="40" cy="65" r="1.0" fill="#D2691E" opacity="0.7" />
            <circle cx="50" cy="67" r="0.7" fill="#CD853F" opacity="0.5" />
            
            {/* Additional scattered freckles */}
            <circle cx="29" cy="60" r="0.5" fill="#DEB887" opacity="0.4" />
            <circle cx="61" cy="62" r="0.6" fill="#D2691E" opacity="0.5" />
            <circle cx="44" cy="69" r="0.5" fill="#CD853F" opacity="0.4" />
            <circle cx="37" cy="49" r="0.4" fill="#DEB887" opacity="0.4" />
          </g>
        )}
      </svg>
    </div>
  )
}