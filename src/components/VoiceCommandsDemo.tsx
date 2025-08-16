import React from 'react';
import { UnifiedVoiceCommands } from './UnifiedVoiceCommands';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export const VoiceCommandsDemo: React.FC = () => {
  return (
    <div className="w-full max-w-2xl mx-auto p-4">
      <Card>
        <CardHeader>
          <CardTitle>Voice Commands</CardTitle>
          <CardDescription>
            Intelligent voice control with automatic ElevenLabs/OpenAI fallback
          </CardDescription>
        </CardHeader>
        <CardContent>
          <UnifiedVoiceCommands />
        </CardContent>
      </Card>
    </div>
  );
};