import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { voiceCommands } from "@/config/audioConfig";
import { Crown, Mic } from "lucide-react";

export function VoiceCommandsHelp() {
  return (
    <section id="voice" className="scroll-mt-24">
      <Card className="border-primary/20">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Crown className="w-4 h-4 text-yellow-500" />
            <Mic className="w-4 h-4 text-primary" />
            <CardTitle className="text-base">Voice Commands</CardTitle>
          </div>
          <CardDescription>Premium feature</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-5">
            Premium readers can go completely hands-free. While your child reads, they can
            speak simple commands to navigate pages, hear words read aloud, get definitions,
            pause or resume narration, and more — no tapping required. Just say a command
            and the app responds instantly.
          </p>

          <div className="grid gap-6 md:grid-cols-3">
            {Object.entries(voiceCommands).map(([category, cmds]) => (
              <div key={category}>
                <h3 className="font-medium capitalize mb-2 text-muted-foreground">{category}</h3>
                <ul className="space-y-1">
                  {Object.keys(cmds as Record<string, unknown>)
                    .filter((phrase) => phrase !== "resume")
                    .map((phrase) => (
                      <li key={phrase} className="text-sm">• {phrase.replace("*", "[word]")}</li>
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
