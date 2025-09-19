import type { AvatarType, SkinTone } from "@/types";
import { DebugLogger } from "@/services/DebugLogger";

interface AvatarData {
  type: AvatarType;
  skinTone: SkinTone;
}

/**
 * Centralized avatar URL generation with robust fallback handling
 * Ensures consistent avatar behavior across all components
 */
export class AvatarUtils {
  private static readonly AVATAR_BASE_PATHS = {
    boy: {
      pale: "/avatar-boy-pale.jpg",
      light: "/avatar-boy-light.jpg",
      medium: "/avatar-boy-medium.jpg",
      olive: "/avatar-boy-olive.jpg",
      dark: "/avatar-boy-dark.jpg",
    },
    girl: {
      pale: "/avatar-girl-pale.jpg",
      light: "/avatar-girl-light.jpg",
      medium: "/avatar-girl-medium.jpg",
      olive: "/avatar-girl-olive.jpg",
      dark: "/avatar-girl-dark.jpg",
    },
    "prefer-not-to-answer": {
      pale: "/avatar-prefer-not-to-answer-pale.jpg",
      light: "/avatar-prefer-not-to-answer-light.jpg",
      medium: "/avatar-prefer-not-to-answer-medium.jpg",
      olive: "/avatar-prefer-not-to-answer-olive.jpg",
      dark: "/avatar-prefer-not-to-answer-dark.jpg",
    }
  };

  private static readonly DEFAULT_FALLBACK = "/avatar-boy-medium.jpg";

  /**
   * Generate avatar URL with comprehensive fallback strategy
   */
  static getAvatarUrl(avatarData: AvatarData | null | undefined): string | undefined {
    // Handle null/undefined input
    if (!avatarData || !avatarData.type || !avatarData.skinTone) {
      // Only log errors, not successful operations
      console.warn('🎭 [AvatarUtils] Invalid avatar data:', avatarData);
      return undefined;
    }

    // Get the specific avatar path
    const typeMapping = this.AVATAR_BASE_PATHS[avatarData.type as keyof typeof this.AVATAR_BASE_PATHS];
    if (!typeMapping) {
      console.warn('🎭 [AvatarUtils] Unknown avatar type, using boy fallback:', avatarData.type);
      return this.AVATAR_BASE_PATHS.boy[avatarData.skinTone] || this.DEFAULT_FALLBACK;
    }

    const avatarUrl = typeMapping[avatarData.skinTone];
    if (!avatarUrl) {
      console.warn('🎭 [AvatarUtils] Unknown skin tone, using medium fallback:', avatarData.skinTone);
      return typeMapping.medium || this.DEFAULT_FALLBACK;
    }

    // Success: Log successful avatar URL generation
    DebugLogger.log('ui', 'Avatar URL generated successfully', { 
      type: avatarData.type, 
      skinTone: avatarData.skinTone, 
      url: avatarUrl 
    });
    return avatarUrl;
  }

  /**
   * Check if avatar has valid type and skin tone data
   */
  static hasValidAvatarData(avatarData: any): avatarData is AvatarData {
    return avatarData && 
           typeof avatarData === 'object' && 
           'type' in avatarData && 
           'skinTone' in avatarData &&
           avatarData.type && 
           avatarData.skinTone;
  }

  /**
   * Get avatar URL from child profile or user info with fallback chain
   */
  static getAvatarUrlWithFallback(
    childAvatar?: any,
    userAvatar?: any
  ): string | undefined {
    // Try child avatar first
    if (this.hasValidAvatarData(childAvatar)) {
      return this.getAvatarUrl(childAvatar);
    }

    // Fallback to user avatar
    if (this.hasValidAvatarData(userAvatar)) {
      return this.getAvatarUrl(userAvatar);
    }

    // Only log when debugging is needed, not for normal operations
    return undefined;
  }

  /**
   * Generate initials from name for avatar fallback
   */
  static getInitials(name: string): string {
    return name.charAt(0).toUpperCase();
  }
}