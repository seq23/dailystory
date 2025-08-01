import React from 'react'
import type { AvatarType, SkinTone, HairStyle, HairColor } from "@/types"

interface DynamicAvatarProps {
  type: AvatarType
  skinTone: SkinTone
  hairStyle: HairStyle
  hairColor: HairColor
  hasFreckles: boolean
  size?: number
  className?: string
}

const skinToneColors = {
  pale: "#fde2e7",
  light: "#f7d7a3", 
  medium: "#d4a574",
  olive: "#c19a6b",
  dark: "#8b5a3c"
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
  const faceColor = skinToneColors[skinTone]
  const hairHex = hairColors[hairColor]
  
  // Calculate darker shades for shadows and depth
  const shadowColor = `${faceColor}99`
  const hairShadow = `${hairHex}CC`
  
  // Hair path definitions with better styling
  const getHairPath = () => {
    switch (hairStyle) {
      case 'short':
        return {
          main: "M20 35 C15 20, 25 12, 40 15 C55 12, 65 20, 60 35 C58 40, 55 42, 50 40 L30 40 C25 42, 22 40, 20 35 Z",
          highlights: "M25 25 C30 20, 35 22, 40 25 M45 25 C50 22, 55 20, 50 25"
        }
      case 'long':
        return {
          main: "M18 35 C12 15, 28 8, 40 12 C52 8, 68 15, 62 35 L65 65 C62 75, 55 78, 45 75 L35 75 C25 78, 18 75, 15 65 Z",
          highlights: "M25 25 C35 18, 45 18, 55 25 M20 50 C30 45, 50 45, 60 50"
        }
      case 'braids':
        return {
          main: "M20 35 C15 20, 25 12, 40 15 C55 12, 65 20, 60 35 C58 40, 55 42, 50 40 L30 40 C25 42, 22 40, 20 35 Z",
          braids: "M12 45 C8 50, 12 60, 16 55 C12 65, 16 75, 20 70 M68 45 C72 50, 68 60, 64 55 C68 65, 64 75, 60 70"
        }
      case 'dreadlocks':
        return {
          main: "M20 35 C15 20, 25 12, 40 15 C55 12, 65 20, 60 35 C58 40, 55 42, 50 40 L30 40 C25 42, 22 40, 20 35 Z",
          dreads: "M18 42 L20 72 M26 40 L28 75 M34 40 L36 78 M46 40 L48 78 M54 40 L56 75 M62 42 L64 72"
        }
      case 'curly':
        return {
          main: "M18 35 C10 15, 30 8, 40 18 C50 8, 70 15, 62 35 C65 45, 55 50, 45 45 C35 50, 25 45, 28 35 C15 45, 25 55, 35 50 C45 55, 55 50, 50 40 C60 50, 50 60, 40 55 C30 60, 20 50, 30 45 C20 55, 30 65, 40 60 C50 65, 60 55, 50 50",
          curls: "M25 30 C20 25, 30 20, 35 30 M45 30 C50 20, 60 25, 55 30 M30 45 C25 40, 35 35, 40 45"
        }
      case 'straight':
        return {
          main: "M18 35 C12 15, 28 8, 40 12 C52 8, 68 15, 62 35 L64 55 C60 58, 55 56, 50 55 L30 55 C25 56, 20 58, 16 55 Z",
          highlights: "M25 25 C35 18, 45 18, 55 25 M22 45 C32 42, 48 42, 58 45"
        }
      default:
        return {
          main: "M20 35 C15 20, 25 12, 40 15 C55 12, 65 20, 60 35 C58 40, 55 42, 50 40 L30 40 C25 42, 22 40, 20 35 Z",
          highlights: "M25 25 C30 20, 35 22, 40 25"
        }
    }
  }

  const hairPaths = getHairPath()

  // Enhanced freckles with better positioning
  const Freckles = () => {
    if (!hasFreckles) return null
    return (
      <g>
        <circle cx="32" cy="48" r="0.7" fill="#D2691E" opacity="0.6" />
        <circle cx="36" cy="52" r="0.5" fill="#CD853F" opacity="0.5" />
        <circle cx="41" cy="49" r="0.6" fill="#D2691E" opacity="0.6" />
        <circle cx="46" cy="53" r="0.4" fill="#CD853F" opacity="0.5" />
        <circle cx="49" cy="48" r="0.7" fill="#D2691E" opacity="0.6" />
        <circle cx="38" cy="46" r="0.4" fill="#DEB887" opacity="0.4" />
        <circle cx="43" cy="51" r="0.5" fill="#CD853F" opacity="0.5" />
      </g>
    )
  }

  return (
    <div className={`inline-block ${className}`}>
      <svg 
        width={size} 
        height={size} 
        viewBox="0 0 80 80" 
        className="drop-shadow-xl"
      >
        {/* Gradient definitions */}
        <defs>
          <radialGradient id="faceGradient" cx="0.3" cy="0.3" r="0.8">
            <stop offset="0%" stopColor={faceColor} />
            <stop offset="100%" stopColor={shadowColor} />
          </radialGradient>
          <linearGradient id="hairGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={hairHex} />
            <stop offset="100%" stopColor={hairShadow} />
          </linearGradient>
          <radialGradient id="eyeGradient" cx="0.3" cy="0.3" r="0.8">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="100%" stopColor="#f8f9fa" />
          </radialGradient>
        </defs>

        {/* Background circle with subtle gradient */}
        <circle cx="40" cy="40" r="36" fill="url(#faceGradient)" opacity="0.1" />
        
        {/* Hair back layer */}
        <path 
          d={hairPaths.main} 
          fill="url(#hairGradient)" 
          stroke={hairShadow} 
          strokeWidth="0.5"
        />
        
        {/* Hair highlights */}
        {hairPaths.highlights && (
          <path 
            d={hairPaths.highlights} 
            stroke="#ffffff" 
            strokeWidth="1" 
            fill="none" 
            opacity="0.3"
            strokeLinecap="round"
          />
        )}
        
        {/* Face with gradient */}
        <ellipse cx="40" cy="47" rx="16" ry="18" fill="url(#faceGradient)" />
        
        {/* Face shadow for depth */}
        <ellipse cx="42" cy="49" rx="14" ry="16" fill={shadowColor} opacity="0.1" />
        
        {/* Eyes with improved styling */}
        <ellipse cx="34" cy="44" rx="3.5" ry="4" fill="url(#eyeGradient)" />
        <ellipse cx="46" cy="44" rx="3.5" ry="4" fill="url(#eyeGradient)" />
        
        {/* Iris */}
        <circle cx="34" cy="44" r="2.5" fill="#4a90a4" />
        <circle cx="46" cy="44" r="2.5" fill="#4a90a4" />
        
        {/* Pupils */}
        <circle cx="34" cy="44" r="1.8" fill="#2d3748" />
        <circle cx="46" cy="44" r="1.8" fill="#2d3748" />
        
        {/* Eye highlights */}
        <circle cx="34.8" cy="43.2" r="0.8" fill="#ffffff" opacity="0.9" />
        <circle cx="46.8" cy="43.2" r="0.8" fill="#ffffff" opacity="0.9" />
        <circle cx="33.5" cy="44.5" r="0.3" fill="#ffffff" opacity="0.6" />
        <circle cx="45.5" cy="44.5" r="0.3" fill="#ffffff" opacity="0.6" />
        
        {/* Eyelashes and eyebrows */}
        {type === 'girl' ? (
          <g stroke="#2d3748" strokeWidth="0.8" fill="none" strokeLinecap="round">
            {/* Longer eyelashes for girls */}
            <path d="M31 42 L30 40" />
            <path d="M34 41.5 L34 39.5" />
            <path d="M37 42 L38 40" />
            <path d="M43 42 L42 40" />
            <path d="M46 41.5 L46 39.5" />
            <path d="M49 42 L50 40" />
            {/* Eyebrows */}
            <path d="M30 38 Q34 36 38 38" strokeWidth="1.2" />
            <path d="M42 38 Q46 36 50 38" strokeWidth="1.2" />
          </g>
        ) : (
          <g stroke="#2d3748" strokeWidth="1" fill="none" strokeLinecap="round">
            {/* Simpler eyebrows for boys */}
            <path d="M30 39 Q34 37 38 39" strokeWidth="1.5" />
            <path d="M42 39 Q46 37 50 39" strokeWidth="1.5" />
          </g>
        )}
        
        {/* Nose with subtle shading */}
        <ellipse cx="40" cy="50" rx="1.2" ry="2" fill={shadowColor} opacity="0.3" />
        <ellipse cx="39.5" cy="49.5" rx="0.8" ry="1.5" fill="#ffffff" opacity="0.2" />
        
        {/* Enhanced mouth */}
        <path 
          d="M36 54 Q40 57 44 54" 
          stroke="#d53f8c" 
          strokeWidth="1.8" 
          fill="none" 
          strokeLinecap="round" 
        />
        <path 
          d="M37 54.5 Q40 56 43 54.5" 
          stroke="#f687b3" 
          strokeWidth="1" 
          fill="none" 
          strokeLinecap="round" 
          opacity="0.7"
        />
        
        {/* Freckles */}
        <Freckles />
        
        {/* Hair style specific details */}
        {hairStyle === 'braids' && hairPaths.braids && (
          <g>
            <path 
              d={hairPaths.braids} 
              stroke={hairHex} 
              strokeWidth="2.5" 
              fill="none"
              strokeLinecap="round"
            />
            {/* Braid texture */}
            <g stroke="#ffffff" strokeWidth="0.5" opacity="0.4">
              <path d="M14 50 L18 48" />
              <path d="M14 60 L18 58" />
              <path d="M66 50 L62 48" />
              <path d="M66 60 L62 58" />
            </g>
          </g>
        )}
        
        {hairStyle === 'dreadlocks' && hairPaths.dreads && (
          <g>
            <path 
              d={hairPaths.dreads} 
              stroke={hairHex} 
              strokeWidth="2.2" 
              fill="none"
              strokeLinecap="round"
            />
            {/* Dread texture */}
            <g fill={hairHex} opacity="0.8">
              <circle cx="19" cy="57" r="1" />
              <circle cx="27" cy="62" r="0.8" />
              <circle cx="35" cy="65" r="0.9" />
              <circle cx="45" cy="65" r="0.9" />
              <circle cx="53" cy="62" r="0.8" />
              <circle cx="61" cy="57" r="1" />
            </g>
          </g>
        )}
        
        {hairStyle === 'curly' && hairPaths.curls && (
          <path 
            d={hairPaths.curls} 
            stroke={hairShadow} 
            strokeWidth="1.5" 
            fill="none"
            strokeLinecap="round"
            opacity="0.6"
          />
        )}
      </svg>
    </div>
  )
}