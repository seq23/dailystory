import React, { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
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

type AccessState = 'checking' | 'signed_out' | 'forbidden' | 'ready' | 'error';

async function getFunctionErrorDetails(error: any) {
  const status = error?.context?.status as number | undefined;
  let message = error?.message || 'Request failed';
  let code: string | undefined;

  if (error?.context && typeof error.context.text === 'function') {
    try {
      const text = await error.context.text();
      if (text) {
        try {
          const parsed = JSON.parse(text);
          message = parsed?.error || parsed?.message || message;
          code = parsed?.code;
        } catch {
          message = text;
        }
      }
    } catch {
      // Keep the Supabase client error message when the response body is unavailable.
    }
  }

  return { status, message, code };
}

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
  const [accessState, setAccessState] = useState<AccessState>('checking');
  const [lastError, setLastError] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<{ id: string; email?: string } | null>(null);

  const handleFunctionError = useCallback(async (error: any, title: string) => {
    const details = await getFunctionErrorDetails(error);
    const message = details.message || error?.message || 'Request failed';
    setLastError(message);

    if (details.status === 401 || details.code === 'sign_in_required') {
      setAccessState('signed_out');
      toast({ title: 'Sign in required', description: 'Please sign in before opening voice administration.', variant: 'destructive' });
      return details;
    }

    if (details.status === 403 || details.code === 'admin_required' || details.code === 'admin_not_configured') {
      setAccessState('forbidden');
      toast({ title: 'Admin access required', description: message, variant: 'destructive' });
      return details;
    }

    setAccessState('error');
    toast({ title, description: message, variant: 'destructive' });
    return details;
  }, [toast]);

  const load = useCallback(async () => {
    setLoading(true);
    setAccessState('checking');
    setLastError(null);

    try {
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      if (sessionError) throw sessionError;

      const session = sessionData.session;
      if (!session?.user) {
        setCurrentUser(null);
        setAccessState('signed_out');
        setLastError('Please sign in with an admin account to manage voice overrides.');
        return;
      }

      setCurrentUser({ id: session.user.id, email: session.user.email || undefined });

      const { data, error } = await supabase.functions.invoke('voice-overrides-admin', {
        body: { action: 'list' },
      });
      if (error) {
        await handleFunctionError(error, 'Load failed');
        return;
      }

      const map: Record<string, Override> = {};
      (data?.overrides || []).forEach((o: Override) => { map[o.language_code] = o; });
      setOverrides(map);
      setAccessState('ready');
    } catch (e: any) {
      setAccessState('error');
      setLastError(e?.message || 'Unable to check admin access.');
      toast({ title: 'Load failed', description: e?.message || 'Unable to check admin access.', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  }, [handleFunctionError, toast]);

  useEffect(() => { load(); }, [load]);

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
    if (error) { await handleFunctionError(error, 'Save failed'); return; }
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
    if (error) { await handleFunctionError(error, 'Delete failed'); return; }
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
      {loading && <p>Checking admin access…</p>}

      {!loading && accessState !== 'ready' && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              {accessState === 'signed_out' ? 'Sign in required' : 'Admin access required'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            {accessState === 'signed_out' ? (
              <p>Please sign in with an admin account before managing language voices.</p>
            ) : (
              <div className="space-y-2">
                <p>This page is restricted to accounts listed in the ADMIN_USER_IDS setting.</p>
                {currentUser && (
                  <p>
                    Current account: {currentUser.email || 'unknown email'} ({currentUser.id})
                  </p>
                )}
              </div>
            )}
            {lastError && <p>{lastError}</p>}
            <div className="flex flex-wrap gap-2">
              {accessState === 'signed_out' && (
                <Button asChild>
                  <Link to="/auth">Sign in</Link>
                </Button>
              )}
              <Button variant="secondary" onClick={load}>Try again</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {accessState === 'ready' && (
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
      )}
      <p className="text-xs text-muted-foreground">
        Find voice IDs in the ElevenLabs Voice Library. All rendering is cached per
        (text, voice, model) hash, so once a language's voice is chosen, repeat reads
        cost $0.
      </p>
    </div>
  );
};

export default VoiceAdmin;