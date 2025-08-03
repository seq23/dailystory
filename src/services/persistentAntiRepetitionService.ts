import { supabase } from "@/integrations/supabase/client";

interface ContentSignature {
  id: string;
  user_identifier: string;
  content_signature: string;
  story_session_number: number;
  content_type: string;
  created_at: string;
}

export class PersistentAntiRepetitionService {
  private static readonly MAX_STORED_SIGNATURES = 1000; // Limit per user for performance
  
  /**
   * Generates a device fingerprint for guest users (mobile-friendly)
   */
  static generateDeviceFingerprint(): string {
    try {
      // Create a semi-stable fingerprint based on browser characteristics
      // Use a fallback approach for mobile devices where some APIs might not be available
      const canvas = document.createElement('canvas');
      let canvasFingerprint = '';
      
      try {
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.textBaseline = 'top';
          ctx.font = '14px Arial';
          ctx.fillText('Device fingerprint', 2, 2);
          canvasFingerprint = canvas.toDataURL();
        }
      } catch (e) {
        canvasFingerprint = 'canvas_not_available';
      }
      
      const fingerprint = [
        navigator.userAgent || 'unknown',
        navigator.language || 'en',
        `${screen.width}x${screen.height}` || '0x0',
        String(new Date().getTimezoneOffset()) || '0',
        canvasFingerprint,
        localStorage.getItem('time2read_device_id') || Math.random().toString(36)
      ].join('|');
      
      // Store a persistent device ID for this browser
      if (!localStorage.getItem('time2read_device_id')) {
        localStorage.setItem('time2read_device_id', Math.random().toString(36).substr(2, 9));
      }
      
      // Create a hash of the fingerprint
      return `guest_${this.simpleHash(fingerprint)}`;
    } catch (error) {
      console.error('Error generating device fingerprint:', error);
      // Fallback for environments where localStorage or other APIs aren't available
      return `guest_${Math.random().toString(36).substr(2, 9)}`;
    }
  }
  
  /**
   * Gets the user identifier (user ID for authenticated, device fingerprint for guests)
   */
  static async getUserIdentifier(): Promise<string> {
    const { data: { user } } = await supabase.auth.getUser();
    return user ? user.id : this.generateDeviceFingerprint();
  }
  
  /**
   * Loads content signatures from database for a user
   */
  static async loadContentSignatures(userIdentifier?: string): Promise<Set<string>> {
    try {
      const identifier = userIdentifier || await this.getUserIdentifier();
      
      console.log('📚 Loading content signatures for user:', identifier);
      
      const { data, error } = await supabase
        .from('user_content_signatures')
        .select('content_signature')
        .eq('user_identifier', identifier)
        .order('created_at', { ascending: false })
        .limit(this.MAX_STORED_SIGNATURES);
      
      if (error) {
        console.error('Error loading content signatures:', error);
        return new Set();
      }
      
      const signatures = new Set(data.map(item => item.content_signature));
      console.log(`✅ Loaded ${signatures.size} existing content signatures for anti-repetition`);
      return signatures;
    } catch (error) {
      console.error('Error in loadContentSignatures:', error);
      return new Set();
    }
  }
  
  /**
   * Saves a content signature to the database
   */
  static async saveContentSignature(
    contentSignature: string,
    sessionNumber: number = 1,
    contentType: string = 'story',
    userIdentifier?: string
  ): Promise<void> {
    try {
      const identifier = userIdentifier || await this.getUserIdentifier();
      
      console.log('💾 Saving content signature for anti-repetition:', { identifier, contentType, sessionNumber });
      
      // Check if signature already exists
      const { data: existing } = await supabase
        .from('user_content_signatures')
        .select('id')
        .eq('user_identifier', identifier)
        .eq('content_signature', contentSignature)
        .single();
      
      if (existing) {
        console.log('🔄 Content signature already exists, skipping save');
        return; // Already exists, no need to save again
      }
      
      const { error } = await supabase
        .from('user_content_signatures')
        .insert({
          user_identifier: identifier,
          content_signature: contentSignature,
          story_session_number: sessionNumber,
          content_type: contentType
        });
      
      if (error) {
        console.error('Error saving content signature:', error);
      } else {
        console.log('✅ Content signature saved successfully');
      }
    } catch (error) {
      console.error('Error in saveContentSignature:', error);
    }
  }
  
  /**
   * Checks if content is duplicate against persistent storage
   */
  static async isDuplicateContent(content: string, userIdentifier?: string): Promise<boolean> {
    try {
      const signature = this.generateContentSignature(content);
      const identifier = userIdentifier || await this.getUserIdentifier();
      
      const { data, error } = await supabase
        .from('user_content_signatures')
        .select('id')
        .eq('user_identifier', identifier)
        .eq('content_signature', signature)
        .single();
      
      if (error && error.code !== 'PGRST116') {
        console.error('Error checking duplicate content:', error);
        return false;
      }
      
      return !!data;
    } catch (error) {
      console.error('Error in isDuplicateContent:', error);
      return false;
    }
  }
  
  /**
   * Gets the current session number for a user
   */
  static async getCurrentSessionNumber(userIdentifier?: string): Promise<number> {
    try {
      const identifier = userIdentifier || await this.getUserIdentifier();
      
      const { data, error } = await supabase
        .from('user_content_signatures')
        .select('story_session_number')
        .eq('user_identifier', identifier)
        .order('story_session_number', { ascending: false })
        .limit(1)
        .single();
      
      if (error && error.code !== 'PGRST116') {
        console.error('Error getting session number:', error);
        return 1;
      }
      
      return data ? data.story_session_number + 1 : 1;
    } catch (error) {
      console.error('Error in getCurrentSessionNumber:', error);
      return 1;
    }
  }
  
  /**
   * Cleans up old signatures to maintain performance
   */
  static async cleanupOldSignatures(userIdentifier?: string): Promise<void> {
    try {
      const identifier = userIdentifier || await this.getUserIdentifier();
      
      const { data, error } = await supabase
        .from('user_content_signatures')
        .select('id')
        .eq('user_identifier', identifier)
        .order('created_at', { ascending: false })
        .range(this.MAX_STORED_SIGNATURES, -1);
      
      if (error || !data || data.length === 0) {
        return;
      }
      
      const idsToDelete = data.map(item => item.id);
      
      await supabase
        .from('user_content_signatures')
        .delete()
        .in('id', idsToDelete);
    } catch (error) {
      console.error('Error in cleanupOldSignatures:', error);
    }
  }
  
  /**
   * Generates a content signature (hash) for duplicate detection
   */
  static generateContentSignature(content: string): string {
    const normalized = content
      .toLowerCase()
      .replace(/[^\w\s]/g, '')
      .replace(/\s+/g, ' ')
      .trim();
    
    return this.simpleHash(normalized);
  }
  
  /**
   * Simple hash function for content signatures
   */
  private static simpleHash(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(36);
  }
  
  /**
   * Calculates similarity between two content signatures
   */
  static calculateContentSimilarity(content1: string, content2: string): number {
    const words1 = new Set(content1.toLowerCase().split(/\s+/));
    const words2 = new Set(content2.toLowerCase().split(/\s+/));
    
    const intersection = new Set([...words1].filter(x => words2.has(x)));
    const union = new Set([...words1, ...words2]);
    
    return intersection.size / union.size;
  }
}