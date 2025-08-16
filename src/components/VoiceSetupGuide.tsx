import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, ExternalLink } from "lucide-react";

export const VoiceSetupGuide = () => {
  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <span>🎤 Voice Commands Setup Required</span>
        </CardTitle>
        <CardDescription>
          Configure your ElevenLabs agent to enable voice commands like "play story", "next page", etc.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center gap-2 p-3 bg-primary/10 rounded-lg">
          <Badge variant="secondary">Agent ID</Badge>
          <code className="text-sm">agent_5101k2cxd4tfeearyk0y6hvbj9pm</code>
        </div>

        <div className="grid gap-4">
          <h3 className="font-semibold text-lg">Step 1: Add These 6 Tools</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {[
              { name: 'play', desc: 'Start reading the story' },
              { name: 'stop', desc: 'Stop audio playback' },
              { name: 'pause', desc: 'Pause audio playback' },
              { name: 'next', desc: 'Go to next page' },
              { name: 'previous', desc: 'Go to previous page' },
              { name: 'wordHelp', desc: 'Get word help' }
            ].map((tool) => (
              <div key={tool.name} className="flex items-center gap-2 p-2 border rounded">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <code className="font-mono text-sm">{tool.name}</code>
                <span className="text-sm text-muted-foreground">- {tool.desc}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          <h3 className="font-semibold text-lg">Step 2: Test Commands</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
            <div>• "play story" → starts reading</div>
            <div>• "stop" → stops reading</div>
            <div>• "next page" → navigates forward</div>
            <div>• "go back" → navigates backward</div>
            <div>• "help with this word" → word assistance</div>
            <div>• "pause" → pauses reading</div>
          </div>
        </div>

        <div className="flex gap-3">
          <a 
            href="https://elevenlabs.io/app" 
            target="_blank" 
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
          >
            Open ElevenLabs Dashboard
            <ExternalLink className="w-4 h-4" />
          </a>
          
          <a 
            href="/AGENT_QUICK_SETUP.md" 
            target="_blank"
            className="inline-flex items-center gap-2 px-4 py-2 border border-primary text-primary rounded-md hover:bg-primary/10 transition-colors"
          >
            View Setup Guide
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>

        <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
          <p className="text-sm text-amber-800">
            <strong>💡 Tip:</strong> Watch the browser console for debug logs. 
            You should see "🔧 AGENT TOOL CALL" when ElevenLabs calls your tools.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};