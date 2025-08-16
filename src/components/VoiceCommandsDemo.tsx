import React from 'react';
import { HybridVoiceCommands } from './HybridVoiceCommands';
import { OpenAIVoiceCommands } from './OpenAIVoiceCommands';
import { VoiceCommands } from './VoiceCommands';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

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
          <Tabs defaultValue="hybrid" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="hybrid">Smart Mode</TabsTrigger>
              <TabsTrigger value="elevenlabs">ElevenLabs</TabsTrigger>
              <TabsTrigger value="openai">OpenAI</TabsTrigger>
            </TabsList>
            
            <TabsContent value="hybrid" className="space-y-4">
              <div className="space-y-2">
                <h3 className="text-lg font-semibold">Hybrid Voice Commands</h3>
                <p className="text-sm text-muted-foreground">
                  Automatically tries ElevenLabs first, falls back to OpenAI if needed. 
                  Includes all voice commands plus speed controls.
                </p>
                <div className="space-y-2">
                  <h4 className="font-medium">Enhanced Commands:</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• <strong>Reading:</strong> "read", "stop", "pause"</li>
                    <li>• <strong>Speed:</strong> "read faster", "read slower", "normal speed"</li>
                    <li>• <strong>Navigation:</strong> "next page", "previous", "turn page"</li>
                    <li>• <strong>Help:</strong> "what is this word", "define this"</li>
                  </ul>
                </div>
                <HybridVoiceCommands />
              </div>
            </TabsContent>
            
            <TabsContent value="elevenlabs" className="space-y-4">
              <div className="space-y-2">
                <h3 className="text-lg font-semibold">ElevenLabs Agent</h3>
                <p className="text-sm text-muted-foreground">
                  Requires agent configuration in ElevenLabs dashboard with speed control tools.
                </p>
                <VoiceCommands />
              </div>
            </TabsContent>
            
            <TabsContent value="openai" className="space-y-4">
              <div className="space-y-2">
                <h3 className="text-lg font-semibold">OpenAI Realtime API</h3>
                <p className="text-sm text-muted-foreground">
                  Direct WebSocket connection with reliable command recognition.
                </p>
                <OpenAIVoiceCommands />
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};