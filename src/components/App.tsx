import React from 'react';
import { AuthWrapper } from '@/components/AuthWrapper';
import { SecurityMonitor } from '@/components/SecurityMonitor';
import { useSecurityHeaders } from '@/hooks/useSecurityHeaders';

export default function App() {
  // Initialize security headers
  useSecurityHeaders();
  
  return (
    <div className="min-h-screen bg-background">
      <AuthWrapper />
      <SecurityMonitor />
    </div>
  );
}