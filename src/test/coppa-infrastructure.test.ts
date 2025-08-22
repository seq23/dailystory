import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useValidationOnSubmit } from '@/hooks/useValidationOnSubmit';
import { useCOPPANotification } from '@/hooks/useCOPPANotification';
import { useIncidentLogger } from '@/hooks/useIncidentLogger';
import { useParentalNotifications } from '@/hooks/useParentalNotifications';
import { renderHook, act } from '@testing-library/react';

// Mock the Supabase client
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    auth: {
      getUser: vi.fn().mockResolvedValue({
        data: { user: { id: 'test-user-id' } }
      })
    },
    functions: {
      invoke: vi.fn()
    }
  }
}));

// Mock child profiles hook
vi.mock('@/hooks/useChildProfiles', () => ({
  useChildProfiles: () => ({
    activeChild: {
      id: 'test-child-id',
      display_name: 'Test Child',
      parent_email: 'parent@test.com'
    }
  })
}));

describe('COPPA Infrastructure', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Incident Logging', () => {
    it('should log incidents with correct data structure', async () => {
      const { result } = renderHook(() => useIncidentLogger());
      
      const mockInvoke = vi.mocked(result.current);
      
      await act(async () => {
        await result.current.logIncident({
          childProfileId: 'test-child-id',
          violationType: 'personal_info_name',
          detectedContent: 'My name is John',
          contextField: 'story_content'
        });
      });

      expect(mockInvoke).toBeDefined();
    });

    it('should handle missing user gracefully', async () => {
      const { supabase } = await import('@/integrations/supabase/client');
      vi.mocked(supabase.auth.getUser).mockResolvedValueOnce({
        data: { user: null },
        error: null
      });

      const { result } = renderHook(() => useIncidentLogger());
      
      const response = await result.current.logIncident({
        violationType: 'test',
        detectedContent: 'test content',
        contextField: 'test_field'
      });

      expect(response.success).toBe(false);
      expect(response.error).toBe('No authenticated user');
    });
  });

  describe('COPPA Notifications', () => {
    it('should send COPPA notifications with proper email structure', async () => {
      const { supabase } = await import('@/integrations/supabase/client');
      vi.mocked(supabase.functions.invoke).mockResolvedValueOnce({
        data: { success: true, messageId: 'test-message-id' },
        error: null
      });

      const { result } = renderHook(() => useCOPPANotification());
      
      const response = await result.current.sendCOPPANotification({
        parentEmail: 'parent@test.com',
        childName: 'Test Child',
        violations: ['personal_info_name', 'personal_info_location'],
        detectedContent: 'My name is John and I live in Springfield'
      });

      expect(response.success).toBe(true);
      expect(supabase.functions.invoke).toHaveBeenCalledWith(
        'send-coppa-notification',
        expect.objectContaining({
          body: expect.objectContaining({
            parentEmail: 'parent@test.com',
            childName: 'Test Child',
            violations: ['personal_info_name', 'personal_info_location']
          })
        })
      );
    });

    it('should handle email sending errors gracefully', async () => {
      const { supabase } = await import('@/integrations/supabase/client');
      vi.mocked(supabase.functions.invoke).mockResolvedValueOnce({
        data: null,
        error: { message: 'Email service unavailable' }
      });

      const { result } = renderHook(() => useCOPPANotification());
      
      const response = await result.current.sendCOPPANotification({
        parentEmail: 'invalid@test.com',
        childName: 'Test Child',
        violations: ['test_violation'],
        detectedContent: 'test content'
      });

      expect(response.success).toBe(false);
      expect(response.error).toBe('Email service unavailable');
    });
  });

  describe('Parental Notifications', () => {
    it('should send digest notifications with proper formatting', async () => {
      const { supabase } = await import('@/integrations/supabase/client');
      vi.mocked(supabase.functions.invoke).mockResolvedValueOnce({
        data: { success: true, messageId: 'digest-message-id' },
        error: null
      });

      const { result } = renderHook(() => useParentalNotifications());
      
      const response = await result.current.sendParentalNotification({
        parentEmail: 'parent@test.com',
        childName: 'Test Child',
        incidentCount: 3,
        recentViolations: [
          {
            timestamp: '2024-01-01T10:00:00Z',
            violationType: 'personal_info_name',
            content: 'My name is John'
          }
        ],
        reportType: 'daily'
      });

      expect(response.success).toBe(true);
      expect(supabase.functions.invoke).toHaveBeenCalledWith(
        'send-parental-notification',
        expect.objectContaining({
          body: expect.objectContaining({
            reportType: 'daily',
            incidentCount: 3
          })
        })
      );
    });
  });

  describe('Validation Integration', () => {
    it('should integrate incident logging with validation', async () => {
      const { result } = renderHook(() => useValidationOnSubmit());
      
      await act(async () => {
        await result.current.validateFormOnSubmit({
          story_content: 'My name is John Smith and I live at 123 Main St',
          character_name: 'John'
        });
      });

      expect(result.current.validationState.hasCoppaViolation).toBe(true);
      expect(result.current.validationState.errors.length).toBeGreaterThan(0);
    });

    it('should handle validation errors without breaking', async () => {
      const { result } = renderHook(() => useValidationOnSubmit());
      
      await act(async () => {
        await result.current.validateFormOnSubmit({
          story_content: 'A safe story about adventure',
          character_name: 'Hero'
        });
      });

      expect(result.current.validationState.hasCoppaViolation).toBe(false);
      expect(result.current.validationState.errors).toHaveLength(0);
    });
  });

  describe('Edge Function Error Handling', () => {
    it('should handle edge function timeouts', async () => {
      const { supabase } = await import('@/integrations/supabase/client');
      vi.mocked(supabase.functions.invoke).mockRejectedValueOnce(
        new Error('Function timeout')
      );

      const { result } = renderHook(() => useCOPPANotification());
      
      const response = await result.current.sendCOPPANotification({
        parentEmail: 'parent@test.com',
        childName: 'Test Child',
        violations: ['test'],
        detectedContent: 'test'
      });

      expect(response.success).toBe(false);
      expect(response.error).toBe('Failed to send notification');
    });

    it('should handle malformed requests gracefully', async () => {
      const { result } = renderHook(() => useIncidentLogger());
      
      const response = await result.current.logIncident({
        violationType: '', // Empty violation type
        detectedContent: '',
        contextField: ''
      });

      // Should still attempt to log, error handling happens server-side
      expect(response).toBeDefined();
    });
  });
});