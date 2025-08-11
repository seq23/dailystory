import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { voiceCommands } from "@/config/audioConfig";

export function VoiceCommandsHelp() {
  return (
    <section id="voice" className="scroll-mt-24">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Voice Commands</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-3">
            {Object.entries(voiceCommands).map(([category, cmds]) => (
              <div key={category}>
                <h3 className="font-medium capitalize mb-2 text-muted-foreground">{category}</h3>
                <ul className="space-y-1">
                  {Object.keys(cmds as Record<string, unknown>).map((phrase) => (
                    <li key={phrase} className="text-sm">• {phrase.replace('*', '[word]')}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </section>
  );
}
