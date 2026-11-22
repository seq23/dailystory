import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Mic } from "lucide-react";
import { STORY_VOICE_COMMANDS } from "@/lib/voice/storyVoiceCommands";

/**
 * The /pricing voice card. Built from STORY_VOICE_COMMANDS, the list the story page's
 * microphone acts on, so it cannot promise a command that does not exist.
 * Who gets it: any signed-in account, free or Premium; never a signed-out guest
 * (StoryVoiceCommands renders nothing without a session). Guard:
 * src/test/guards/pricing-voice-truth.test.tsx.
 */
export function VoiceCommandsHelp() {
  const { t } = useTranslation();
  return (
    <section id="voice" className="scroll-mt-24">
      <Card className="border-primary/20">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Mic className="w-4 h-4 text-primary" aria-hidden="true" />
            <CardTitle className="text-base">{t("pricingVoice.title")}</CardTitle>
          </div>
          <CardDescription data-testid="voice-plans">{t("pricingVoice.who")}</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">{t("pricingVoice.intro")}</p>
          <ul className="grid gap-x-6 gap-y-2 sm:grid-cols-2" data-testid="voice-command-list">
            {STORY_VOICE_COMMANDS.map((command) => (
              <li key={command} data-command={command} className="text-sm">
                <span className="font-medium" data-testid="voice-say">{t(`pricingVoice.say.${command}`)}</span>
                <span className="text-muted-foreground"> · {t(`pricingVoice.command.${command}`)}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </section>
  );
}
