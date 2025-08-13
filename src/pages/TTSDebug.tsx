import React, { useEffect, useMemo, useState } from 'react';
import { phoneticRulesEngine } from '@/services/phoneticRulesEngine';
import { SimpleAudioEngine } from '@/services/SimpleAudioEngine';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

// Simple debug user
const debugUser = { id: 'debug', name: 'QA', age: 9, nativeLanguage: 'en' } as any;

const TTSDebug: React.FC = () => {
  const [word, setWord] = useState('illuminating');
  const [syllables, setSyllables] = useState<string[]>([]);
  const [source, setSource] = useState<'override' | 'heuristic' | null>(null);
  const [pronunciations, setPronunciations] = useState<string[] | null>(null);
  const audio = SimpleAudioEngine.getInstance();

  useEffect(() => {
    // SEO basics for the page
    document.title = 'TTS Debug | Syllable & Pronunciation QA';
    const metaDesc = document.querySelector('meta[name="description"]') || document.createElement('meta');
    metaDesc.setAttribute('name', 'description');
    metaDesc.setAttribute('content', 'QA harness to test TTS syllable breakdowns and pronunciations.');
    document.head.appendChild(metaDesc);
    const canonical = document.querySelector('link[rel="canonical"]') || document.createElement('link');
    canonical.setAttribute('rel', 'canonical');
    canonical.setAttribute('href', window.location.origin + '/tts-debug');
    document.head.appendChild(canonical);
  }, []);

  const handleAnalyze = async () => {
    const chunks = await phoneticRulesEngine.breakIntoSyllablesAsync(word);
    setSyllables(chunks);
    const info = phoneticRulesEngine.getDebugInfo(word);
    setSource(info.hasKnownSyllables ? 'override' : 'heuristic');
    setPronunciations(info.pronunciations);
  };

  const handlePlay = async () => {
    await audio.playPhoneticBreakdown({ word, userInfo: debugUser, showSyllables: true });
  };

  const samples = ['what', 'green', 'chase', 'good', 'bounce', 'smiles', 'illuminate', 'illumination', 'illuminating'];

  return (
    <main className="mx-auto max-w-3xl px-6 py-8">
      <header className="mb-6">
        <h1 className="text-2xl font-semibold">TTS Debug and Syllable QA</h1>
        <p className="text-muted-foreground">Test syllable splits and phonetic playback quickly.</p>
      </header>

      <section className="space-y-4">
        <div className="flex gap-2">
          <Input value={word} onChange={(e) => setWord(e.target.value)} placeholder="Enter a word" />
          <Button onClick={handleAnalyze}>Analyze</Button>
          <Button variant="secondary" onClick={handlePlay}>Play Syllables</Button>
        </div>

        {syllables.length > 0 && (
          <article className="rounded-md border p-4">
            <h2 className="mb-2 text-lg font-medium">Syllables</h2>
            <div className="flex flex-wrap gap-2">
              {syllables.map((s, i) => (
                <span key={i} className="inline-flex items-center rounded-md border px-2 py-1 text-sm">{s}</span>
              ))}
            </div>
            <div className="mt-3 text-sm text-muted-foreground">
              <span className="mr-2">Source:</span>
              <span className="font-medium">{source === 'override' ? 'Override (mini-dict)' : 'Heuristic'}</span>
            </div>
            {pronunciations && (
              <div className="mt-2 text-sm">
                <div className="mb-1 font-medium">Speech-friendly:</div>
                <div className="flex flex-wrap gap-2">
                  {pronunciations.map((p, idx) => (
                    <span key={idx} className="inline-flex items-center rounded-md bg-muted px-2 py-0.5">{p}</span>
                  ))}
                </div>
              </div>
            )}
          </article>
        )}

        <aside className="rounded-md border p-4">
          <h3 className="mb-2 font-medium">Samples</h3>
          <div className="flex flex-wrap gap-2">
            {samples.map((s) => (
              <Button key={s} size="sm" variant="outline" onClick={() => { setWord(s); }}>
                {s}
              </Button>
            ))}
          </div>
        </aside>
      </section>
    </main>
  );
};

export default TTSDebug;
