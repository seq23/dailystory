import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { LANGUAGE_VOICE_MAP, SUPPORTED_LANGUAGE_CODES, type SupportedLanguage } from '@/services/tts/languageVoiceMap';

type Override = {
  language_code: string;
  voice_id: string;
  display_name: string | null;
  accent_note: string | null;
  model_id: string | null;
  updated_at?: string;
};

/**
 * Admin-only page to manage per-language ElevenLabs voice overrides.
 * Access is gated at the edge function by ADMIN_USER_IDS — non-admins get 403.
 */
const VoiceAdmin: React.FC = () => {
  const { toast } = useToast();
  const [overrides, setOverrides] = useState<Record<string, Override>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [previewing, setPreviewing] = useState<string | null>(null);
  const [edits, setEdits] = useState<Record<string, Partial<Override>>>({});

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase.functions.invoke('voice-overrides-admin', {
      body: { action: 'list' },
    });
    setLoading(false);
    if (error) { toast({ title: 'Load failed', description: error.message, variant: 'destructive' }); return; }
    const map: Record<string, Override> = {};
    (data?.overrides || []).forEach((o: Override) => { map[o.language_code] = o; });
    setOverrides(map);
  };

  useEffect(() => { load(); }, []);

  const save = async (lang: SupportedLanguage) => {
    const patch = edits[lang] || {};
    const existing = overrides[lang];
    const voice_id = patch.voice_id ?? existing?.voice_id;
    if (!voice_id) { toast({ title: 'Voice ID required', variant: 'destructive' }); return; }
    setSaving(lang);
    const { data, error } = await supabase.functions.invoke('voice-overrides-admin', {
      body: {
        action: 'upsert',
        language_code: lang,
        voice_id,
        display_name: patch.display_name ?? existing?.display_name ?? LANGUAGE_VOICE_MAP[lang].displayName,
        accent_note: patch.accent_note ?? existing?.accent_note ?? LANGUAGE_VOICE_MAP[lang].accentNote,
        model_id: patch.model_id ?? existing?.model_id ?? LANGUAGE_VOICE_MAP[lang].modelId,
      },
    });
    setSaving(null);
    if (error) { toast({ title: 'Save failed', description: error.message, variant: 'destructive' }); return; }
    toast({ title: `Saved ${lang}` });
    setEdits((e) => { const n = { ...e }; delete n[lang]; return n; });
    load();
  };

  const removeOverride = async (lang: SupportedLanguage) => {
    setSaving(lang);
    const { error } = await supabase.functions.invoke('voice-overrides-admin', {
      body: { action: 'delete', language_code: lang },
    });
    setSaving(null);
    if (error) { toast({ title: 'Delete failed', description: error.message, variant: 'destructive' }); return; }
    toast({ title: `Reset ${lang} to default` });
    load();
  };

  const preview = async (lang: SupportedLanguage) => {
    setPreviewing(lang);
    try {
      const { data, error } = await supabase.functions.invoke('elevenlabs-tts', {
        body: {
          text: 'Once upon a time, a small owl learned to read and share stories.',
          language: lang,
        },
      });
      if (error) throw error;
      const audio = data?.audio;
      if (!audio) throw new Error('No audio returned');
      const url = `data:audio/mpeg;base64,${audio}`;
      const a = new Audio(url);
      await a.play();
    } catch (e: any) {
      toast({ title: 'Preview failed', description: e.message, variant: 'destructive' });
    } finally {
      setPreviewing(null);
    }
  };

  const setField = (lang: string, field: keyof Override, value: string) => {
    setEdits((e) => ({ ...e, [lang]: { ...e[lang], [field]: value } }));
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-4">
      <h1 className="text-2xl font-semibold">Language → Voice Overrides</h1>
      <p className="text-sm text-muted-foreground">
        Map each supported UI language to an ElevenLabs voice. Leaving a language
        without an override falls back to the compiled defaults (currently Charlotte).
      </p>
      {loading && <p>Loading…</p>}
      <div className="grid gap-3">
        {SUPPORTED_LANGUAGE_CODES.map((lang) => {
          const current = overrides[lang];
          const def = LANGUAGE_VOICE_MAP[lang];
          const patch = edits[lang] || {};
          const voice_id = patch.voice_id ?? current?.voice_id ?? '';
          const display_name = patch.display_name ?? current?.display_name ?? def.displayName;
          const model_id = patch.model_id ?? current?.model_id ?? def.modelId;
          return (
            <Card key={lang}>
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center justify-between">
                  <span>{lang.toUpperCase()} — {def.accentNote}</span>
                  <span className="text-xs text-muted-foreground">
                    {current ? 'DB override' : 'default map'}
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-4 gap-2 items-end">
                <label className="text-xs md:col-span-2">
                  Voice ID
                  <Input
                    value={voice_id}
                    placeholder={def.voiceId}
                    onChange={(e) => setField(lang, 'voice_id', e.target.value)}
                  />
                </label>
                <label className="text-xs">
                  Display name
                  <Input value={display_name || ''} onChange={(e) => setField(lang, 'display_name', e.target.value)} />
                </label>
                <label className="text-xs">
                  Model
                  <Input value={model_id || ''} onChange={(e) => setField(lang, 'model_id', e.target.value)} />
                </label>
                <div className="md:col-span-4 flex gap-2">
                  <Button size="sm" disabled={saving === lang} onClick={() => save(lang)}>
                    {saving === lang ? 'Saving…' : 'Save'}
                  </Button>
                  <Button size="sm" variant="secondary" disabled={previewing === lang} onClick={() => preview(lang)}>
                    {previewing === lang ? 'Playing…' : 'Preview'}
                  </Button>
                  {current && (
                    <Button size="sm" variant="ghost" onClick={() => removeOverride(lang)}>
                      Reset to default
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
      <p className="text-xs text-muted-foreground">
        Find voice IDs in the ElevenLabs Voice Library. All rendering is cached per
        (text, voice, model) hash, so once a language's voice is chosen, repeat reads
        cost $0.
      </p>
    </div>
  );
};

export default VoiceAdmin;