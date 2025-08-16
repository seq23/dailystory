import React from 'react';
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
            Choose between OpenAI Realtime API or ElevenLabs for voice commands
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="openai" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="openai">OpenAI Realtime</TabsTrigger>
              <TabsTrigger value="elevenlabs">ElevenLabs</TabsTrigger>
            </TabsList>
            
            <TabsContent value="openai" className="space-y-4">
              <div className="space-y-2">
                <h3 className="text-lg font-semibold">OpenAI Realtime API</h3>
                <p className="text-sm text-muted-foreground">
                  Direct WebSocket connection with better command recognition and reliability.
                </p>
                <div className="space-y-2">
                  <h4 className="font-medium">Commands:</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• "read" or "start reading" - Start audio</li>
                    <li>• "stop" or "pause" - Stop audio</li>
                    <li>• "next" or "next page" - Go forward</li>
                    <li>• "back" or "previous" - Go back</li>
                    <li>• "what is this word" - Get word help</li>
                  </ul>
                </div>
                <OpenAIVoiceCommands />
              </div>
            </TabsContent>
            
            <TabsContent value="elevenlabs" className="space-y-4">
              <div className="space-y-2">
                <h3 className="text-lg font-semibold">ElevenLabs Agent</h3>
                <p className="text-sm text-muted-foreground">
                  Requires agent configuration in ElevenLabs dashboard.
                </p>
                <VoiceCommands />
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};