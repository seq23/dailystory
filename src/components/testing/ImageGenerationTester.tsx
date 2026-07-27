/**
 * ImageGenerationTester — exercises the REAL image path.
 *
 * There is one image path in production: the client posts
 * { pageText, sessionId, pageNumber, userInfo, previousScene? } to
 * `runware-generate-image`, which distills a scene, assembles the prompt and
 * calls Runware. No tiers, no dryRun, no orchestrator. This panel posts exactly
 * that payload and renders exactly what comes back.
 */
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { supabase } from '@/integrations/supabase/client';
import { generateSessionIdWithPrefix } from '@/utils/sessionId';
import { ImageIcon, Loader2, AlertTriangle } from 'lucide-react';
import { TestRunCostReadout } from './TestRunCostReadout';

const LANGUAGES = [
  { code: 'en', label: 'English (no cultural backdrop)' },
  { code: 'ur', label: 'Urdu — Pakistani cultural signals' },
  { code: 'hi', label: 'Hindi — Indian cultural signals' },
  { code: 'ar', label: 'Arabic — Middle Eastern cultural signals' },
  { code: 'es', label: 'Spanish — Hispanic cultural signals' },
  { code: 'fr', label: 'French — French cultural signals' },
  { code: 'zh', label: 'Chinese — Chinese cultural signals' },
];

const SKIN_TONES = ['light', 'medium', 'tan', 'dark'];
const AVATARS = ['boy', 'girl', 'prefer-not-to-answer'];

interface Result {
  success: boolean;
  imageURL?: string;
  scene?: string;
  sceneSource?: string;
  seed?: number;
  prompt?: string;
  model?: string;
  error?: string;
  ms: number;
  sessionId: string;
  pageNumber: number;
}

export const ImageGenerationTester: React.FC = () => {
  const [pageText, setPageText] = useState(
    'Amina tiptoed into the old library and found a small blue door glowing behind the tallest bookshelf.',
  );
  const [previousScene, setPreviousScene] = useState('');
  const [name, setName] = useState('Amina');
  const [age, setAge] = useState('7');
  const [language, setLanguage] = useState('ur');
  const [skinTone, setSkinTone] = useState('medium');
  const [avatarType, setAvatarType] = useState('girl');
  const [pageNumber, setPageNumber] = useState(1);
  const [sessionId, setSessionId] = useState(() => generateSessionIdWithPrefix('image-test'));
  const [results, setResults] = useState<Result[]>([]);
  const [running, setRunning] = useState(false);

  const run = async () => {
    setRunning(true);
    const startedAt = Date.now();
    try {
      const { data, error } = await supabase.functions.invoke('runware-generate-image', {
        body: {
          pageText,
          sessionId,
          pageNumber,
          previousScene: previousScene || undefined,
          userInfo: {
            name,
            age: Number(age) || undefined,
            nativeLanguage: language,
            avatar: { type: avatarType, skinTone },
          },
        },
      });

      const ms = Date.now() - startedAt;

      if (error) {
        setResults((prev) => [
          { success: false, error: error.message, ms, sessionId, pageNumber },
          ...prev,
        ]);
        return;
      }

      setResults((prev) => [
        {
          success: !!data?.success,
          imageURL: data?.imageURL,
          scene: data?.scene,
          sceneSource: data?.sceneSource,
          seed: data?.seed,
          prompt: data?.prompt,
          model: data?.model,
          error: data?.error,
          ms,
          sessionId,
          pageNumber,
        },
        ...prev,
      ]);

      // Advance the page so the next run tests continuity, like a real reader.
      if (data?.scene) setPreviousScene(data.scene);
      setPageNumber((n) => n + 1);
    } catch (err: any) {
      setResults((prev) => [
        { success: false, error: err?.message || 'Request failed', ms: Date.now() - startedAt, sessionId, pageNumber },
        ...prev,
      ]);
    } finally {
      setRunning(false);
    }
  };

  const newSession = () => {
    setSessionId(generateSessionIdWithPrefix('image-test'));
    setPageNumber(1);
    setPreviousScene('');
    setResults([]);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ImageIcon className="h-5 w-5 text-primary" />
          Image generation (real production path)
        </CardTitle>
        <CardDescription>
          Posts the exact payload <code>{'{ pageText, sessionId, pageNumber, userInfo, previousScene }'}</code>{' '}
          that <code>StoryImageService</code> sends. Each successful run costs one real Runware image
          (~$0.0013) and is logged to <code>cost_tracking</code>.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="grid gap-3 md:grid-cols-2">
          <div className="space-y-1">
            <Label>Page text</Label>
            <Textarea rows={4} value={pageText} onChange={(e) => setPageText(e.target.value)} />
          </div>
          <div className="space-y-1">
            <Label>Previous scene (continuity input)</Label>
            <Textarea
              rows={4}
              value={previousScene}
              onChange={(e) => setPreviousScene(e.target.value)}
              placeholder="Auto-filled from the last successful run"
            />
          </div>
        </div>

        <div className="grid gap-3 md:grid-cols-4">
          <div className="space-y-1">
            <Label>Child name</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="space-y-1">
            <Label>Age</Label>
            <Input value={age} onChange={(e) => setAge(e.target.value)} />
          </div>
          <div className="space-y-1">
            <Label>Avatar</Label>
            <Select value={avatarType} onValueChange={setAvatarType}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {AVATARS.map((a) => <SelectItem key={a} value={a}>{a}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <Label>Skin tone</Label>
            <Select value={skinTone} onValueChange={setSkinTone}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {SKIN_TONES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-1">
          <Label>Native language (cultural background — story text stays English)</Label>
          <Select value={language} onValueChange={setLanguage}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {LANGUAGES.map((l) => <SelectItem key={l.code} value={l.code}>{l.label}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button onClick={run} disabled={running || !pageText.trim()}>
            {running ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <ImageIcon className="h-4 w-4 mr-2" />}
            Generate page {pageNumber}
          </Button>
          <Button variant="outline" onClick={newSession} disabled={running}>
            New session
          </Button>
          <Badge variant="outline" className="font-mono text-xs">{sessionId}</Badge>
        </div>

        {results.length > 0 && (
          <div className="space-y-4">
            {results.map((r, i) => (
              <div key={i} className="border rounded-lg p-3 space-y-2">
                <div className="flex flex-wrap items-center gap-2 text-sm">
                  <Badge variant={r.success ? 'default' : 'destructive'}>
                    {r.success ? 'success' : 'failed'}
                  </Badge>
                  <Badge variant="outline">page {r.pageNumber}</Badge>
                  <Badge variant="outline">{r.ms} ms</Badge>
                  {r.sceneSource && <Badge variant="secondary">scene: {r.sceneSource}</Badge>}
                  {r.seed !== undefined && <Badge variant="outline">seed {r.seed}</Badge>}
                  {r.model && <Badge variant="outline">{r.model}</Badge>}
                </div>

                {r.error && (
                  <Alert variant="destructive">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>{r.error}</AlertDescription>
                  </Alert>
                )}

                {r.imageURL && (
                  <img
                    src={r.imageURL}
                    alt={`Generated illustration for page ${r.pageNumber}`}
                    className="rounded-lg max-w-sm w-full"
                    loading="lazy"
                  />
                )}

                {r.scene && (
                  <div className="text-sm">
                    <span className="font-medium">Distilled scene: </span>
                    {r.scene}
                  </div>
                )}

                {r.prompt && (
                  <details className="text-xs">
                    <summary className="cursor-pointer text-muted-foreground">Full positive prompt</summary>
                    <pre className="whitespace-pre-wrap bg-muted p-2 rounded mt-1">{r.prompt}</pre>
                  </details>
                )}
              </div>
            ))}

            <TestRunCostReadout sessionIds={[sessionId]} />
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ImageGenerationTester;