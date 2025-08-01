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
  
  // Eye positions and shapes
  const eyeY = type === 'girl' ? 42 : 45
  const eyeSize = type === 'girl' ? 3 : 2.5
  
  // Hair path definitions
  const getHairPath = () => {
    switch (hairStyle) {
      case 'short':
        return "M25 30 C20 25, 25 20, 35 22 L45 22 C55 20, 60 25, 55 30 L50 35 C45 25, 35 25, 30 35 Z"
      case 'long':
        return "M20 30 C15 25, 20 15, 30 18 L50 18 C60 15, 65 25, 60 30 L65 60 C60 65, 55 70, 50 65 L30 65 C25 70, 20 65, 15 60 Z"
      case 'braids':
        return "M25 30 C20 25, 25 20, 35 22 L45 22 C55 20, 60 25, 55 30 M15 35 C10 40, 15 50, 20 45 M65 35 C70 40, 65 50, 60 45"
      case 'dreadlocks':
        return "M25 30 C20 25, 25 15, 35 18 L45 18 C55 15, 60 25, 55 30 M18 40 L22 65 M28 38 L32 68 M48 38 L52 68 M58 40 L62 65"
      case 'curly':
        return "M25 30 C15 20, 30 15, 35 25 C40 15, 45 25, 40 30 C50 15, 65 20, 55 30 C60 35, 50 40, 45 35 C40 45, 30 40, 35 35 C25 45, 15 35, 25 30"
      case 'straight':
        return "M20 25 C15 20, 25 15, 35 20 L45 20 C55 15, 65 20, 60 25 L62 45 C60 50, 55 48, 50 45 L30 45 C25 48, 20 50, 18 45 Z"
      default:
        return "M25 30 C20 25, 25 20, 35 22 L45 22 C55 20, 60 25, 55 30 L50 35 C45 25, 35 25, 30 35 Z"
    }
  }

  // Freckles component
  const Freckles = () => {
    if (!hasFreckles) return null
    return (
      <g fill={`${faceColor}AA`}>
        <circle cx="30" cy="48" r="0.8" opacity="0.7" />
        <circle cx="35" cy="52" r="0.6" opacity="0.6" />
        <circle cx="42" cy="49" r="0.7" opacity="0.7" />
        <circle cx="45" cy="53" r="0.5" opacity="0.6" />
        <circle cx="50" cy="48" r="0.8" opacity="0.7" />
        <circle cx="38" cy="46" r="0.5" opacity="0.5" />
      </g>
    )
  }

  return (
    <div className={`inline-block ${className}`}>
      <svg 
        width={size} 
        height={size} 
        viewBox="0 0 80 80" 
        className="drop-shadow-lg"
      >
        {/* Background circle */}
        <circle cx="40" cy="40" r="35" fill="#f8fafc" stroke="#e2e8f0" strokeWidth="2" />
        
        {/* Hair (behind face) */}
        <path 
          d={getHairPath()} 
          fill={hairHex} 
          stroke={hairHex} 
          strokeWidth="1"
        />
        
        {/* Face */}
        <circle cx="40" cy="45" r="18" fill={faceColor} stroke="#00000020" strokeWidth="0.5" />
        
        {/* Eyes */}
        <circle cx="35" cy={eyeY} r={eyeSize} fill="#ffffff" />
        <circle cx="45" cy={eyeY} r={eyeSize} fill="#ffffff" />
        <circle cx="35" cy={eyeY} r={eyeSize - 0.8} fill="#4a5568" />
        <circle cx="45" cy={eyeY} r={eyeSize - 0.8} fill="#4a5568" />
        <circle cx="35.5" cy={eyeY - 0.3} r="0.8" fill="#ffffff" />
        <circle cx="45.5" cy={eyeY - 0.3} r="0.8" fill="#ffffff" />
        
        {/* Eyelashes for girl */}
        {type === 'girl' && (
          <g stroke="#2d3748" strokeWidth="0.5" fill="none">
            <path d="M32 40 L31 39" />
            <path d="M35 39.5 L35 38.5" />
            <path d="M38 40 L39 39" />
            <path d="M42 40 L41 39" />
            <path d="M45 39.5 L45 38.5" />
            <path d="M48 40 L49 39" />
          </g>
        )}
        
        {/* Nose */}
        <ellipse cx="40" cy="48" rx="1" ry="1.5" fill="#00000010" />
        
        {/* Mouth */}
        <path d="M37 52 Q40 54 43 52" stroke="#d53f8c" strokeWidth="1.5" fill="none" strokeLinecap="round" />
        
        {/* Freckles */}
        <Freckles />
        
        {/* Hair details (braids/dreadlocks specific) */}
        {hairStyle === 'braids' && (
          <g stroke={hairHex} strokeWidth="2" fill="none">
            <path d="M15 35 Q18 38 15 42 Q18 45 15 48" />
            <path d="M65 35 Q62 38 65 42 Q62 45 65 48" />
          </g>
        )}
        
        {hairStyle === 'dreadlocks' && (
          <g stroke={hairHex} strokeWidth="1.5" fill="none">
            <circle cx="20" cy="50" r="1" fill={hairHex} />
            <circle cx="30" cy="55" r="1" fill={hairHex} />
            <circle cx="50" cy="55" r="1" fill={hairHex} />
            <circle cx="60" cy="50" r="1" fill={hairHex} />
          </g>
        )}
      </svg>
    </div>
  )
}