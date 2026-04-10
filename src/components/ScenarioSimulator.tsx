import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Users, DollarSign, Server, TrendingUp, AlertTriangle, CheckCircle2, BookOpen, Mic } from 'lucide-react';
import { ImageIcon } from 'lucide-react';

interface CostPerUnit {
  story: number;
  image: number;
  audio: number;
}

interface ScenarioSimulatorProps {
  costPerUnit: CostPerUnit;
}

const USER_PRESETS = [10, 50, 100, 500, 1000, 5000, 10000];

// Defaults based on real usage patterns
const DEFAULTS = {
  guest: {
    storiesPerSession: 2.5,   // ~2-3 stories per 20-min session
    pagesPerStory: 6,
    imagesPerPage: 1,
    audioPerPage: 1,
    sessionsPerMonth: 4,      // 3-5 avg
  },
  premium: {
    pagesPerSession: 20,      // 15-25 avg
    imagesPerPage: 1,
    audioPerPage: 1,
    sessionsPerMonth: 13,     // 12-15 avg
    storiesPerSession: 1,     // continuous story
  },
};

const CAPACITY = {
  dbConnections: { safe: 50, warn: 100, max: 150 },
  openaiRPM: { safe: 500, warn: 3000, max: 5000 },   // Tier 1-2
  runwareRPM: { safe: 100, warn: 500, max: 1000 },
  elevenLabsRPM: { safe: 50, warn: 200, max: 500 },
  concurrentEstimate: 0.05, // 5% of monthly users are concurrent at peak
};

const UPGRADE_COSTS: Record<string, { label: string; cost: string; detail: string }> = {
  pgbouncer: { label: 'PgBouncer (Supabase Pro)', cost: '$25/mo', detail: 'Connection pooling, 200+ connections' },
  openaiTier3: { label: 'OpenAI Tier 3', cost: 'Free (usage-based)', detail: 'Requires $250+ spend history → 5,000 RPM' },
  openaiTier4: { label: 'OpenAI Tier 4', cost: 'Free (usage-based)', detail: 'Requires $1,000+ spend history → 10,000 RPM' },
  imageQueue: { label: 'Generation queue (BullMQ/Redis)', cost: '$15-30/mo', detail: 'Redis instance for rate-limiting image requests' },
  ttsQueue: { label: 'TTS queue or caching layer', cost: '$10-20/mo', detail: 'Cache common narrations, queue burst requests' },
  elevenLabsScale: { label: 'ElevenLabs Scale plan', cost: '$99/mo', detail: '2,000 RPM, higher character limit' },
};

function capacityStatus(value: number, thresholds: { safe: number; warn: number; max: number }) {
  if (value <= thresholds.safe) return { color: 'bg-green-500', label: 'OK', level: 'green' };
  if (value <= thresholds.warn) return { color: 'bg-yellow-500', label: 'Monitor', level: 'yellow' };
  return { color: 'bg-red-500', label: 'At Risk', level: 'red' };
}

export const ScenarioSimulator: React.FC<ScenarioSimulatorProps> = ({ costPerUnit }) => {
  const [totalUsers, setTotalUsers] = useState(100);
  const [guestPct, setGuestPct] = useState(80); // 80% guest, 20% premium
  const [guestSessions, setGuestSessions] = useState(DEFAULTS.guest.sessionsPerMonth);
  const [premiumSessions, setPremiumSessions] = useState(DEFAULTS.premium.sessionsPerMonth);
  const [subscriptionPrice, setSubscriptionPrice] = useState(9.99);

  const sim = useMemo(() => {
    const guestCount = Math.round(totalUsers * (guestPct / 100));
    const premiumCount = totalUsers - guestCount;

    // Guest: 2.5 stories × 6 pages = 15 pages/session → 15 images, 15 audio
    const guestPagesPerSession = DEFAULTS.guest.storiesPerSession * DEFAULTS.guest.pagesPerStory;
    const guestStoriesPerMonth = guestCount * guestSessions * DEFAULTS.guest.storiesPerSession;
    const guestImagesPerMonth = guestCount * guestSessions * guestPagesPerSession;
    const guestAudioPerMonth = guestCount * guestSessions * guestPagesPerSession;

    // Premium: 20 pages/session → 20 images, 20 audio, ~1 story call per page
    const premStoriesPerMonth = premiumCount * premiumSessions * DEFAULTS.premium.pagesPerSession;
    const premImagesPerMonth = premiumCount * premiumSessions * DEFAULTS.premium.pagesPerSession;
    const premAudioPerMonth = premiumCount * premiumSessions * DEFAULTS.premium.pagesPerSession;

    const totalStories = guestStoriesPerMonth + premStoriesPerMonth;
    const totalImages = guestImagesPerMonth + premImagesPerMonth;
    const totalAudio = guestAudioPerMonth + premAudioPerMonth;

    const storyCost = totalStories * costPerUnit.story;
    const imageCost = totalImages * costPerUnit.image;
    const audioCost = totalAudio * costPerUnit.audio;
    const totalMonthlyCost = storyCost + imageCost + audioCost;

    // Capacity: estimate peak concurrent users
    const peakConcurrent = Math.ceil(totalUsers * CAPACITY.concurrentEstimate);
    // Peak RPM: assume each concurrent user triggers ~2 API calls/min
    const peakRPM = peakConcurrent * 2;
    const peakImageRPM = peakConcurrent * 1;
    const peakAudioRPM = peakConcurrent * 1;

    const dbStatus = capacityStatus(peakConcurrent, CAPACITY.dbConnections);
    const openaiStatus = capacityStatus(peakRPM, CAPACITY.openaiRPM);
    const runwareStatus = capacityStatus(peakImageRPM, CAPACITY.runwareRPM);
    const elevenStatus = capacityStatus(peakAudioRPM, CAPACITY.elevenLabsRPM);

    // Revenue
    const monthlyRevenue = premiumCount * subscriptionPrice;
    const breakEvenPrice = premiumCount > 0 ? totalMonthlyCost / premiumCount : 0;
    const profit = monthlyRevenue - totalMonthlyCost;

    return {
      guestCount, premiumCount, peakConcurrent,
      guestStoriesPerMonth, guestImagesPerMonth, guestAudioPerMonth,
      premStoriesPerMonth, premImagesPerMonth, premAudioPerMonth,
      totalStories, totalImages, totalAudio,
      storyCost, imageCost, audioCost, totalMonthlyCost,
      dbStatus, openaiStatus, runwareStatus, elevenStatus,
      peakRPM, peakImageRPM, peakAudioRPM,
      monthlyRevenue, breakEvenPrice, profit,
    };
  }, [totalUsers, guestPct, guestSessions, premiumSessions, costPerUnit, subscriptionPrice]);

  const needsUpgrade = sim.dbStatus.level !== 'green' || sim.openaiStatus.level !== 'green';

  return (
    <div className="space-y-6">
      {/* ═══════════ CONTROLS ═══════════ */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Scenario Settings
          </CardTitle>
          <CardDescription>Adjust user count and behavior to project costs</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* User count presets */}
          <div>
            <label className="text-sm font-medium mb-2 block">Total Monthly Users: <span className="text-primary font-bold">{totalUsers.toLocaleString()}</span></label>
            <div className="flex gap-2 flex-wrap">
              {USER_PRESETS.map(n => (
                <button
                  key={n}
                  onClick={() => setTotalUsers(n)}
                  className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                    totalUsers === n
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted hover:bg-muted/80'
                  }`}
                >
                  {n.toLocaleString()}
                </button>
              ))}
            </div>
            <Slider
              value={[totalUsers]}
              onValueChange={([v]) => setTotalUsers(v)}
              min={5}
              max={10000}
              step={5}
              className="mt-3"
            />
          </div>

          {/* Guest/Premium split */}
          <div>
            <label className="text-sm font-medium mb-2 block">
              Guest/Premium Split: <span className="text-muted-foreground">{guestPct}% guest</span> / <span className="text-primary">{100 - guestPct}% premium</span>
              <span className="ml-2 text-xs text-muted-foreground">({sim.guestCount} guest, {sim.premiumCount} premium)</span>
            </label>
            <Slider value={[guestPct]} onValueChange={([v]) => setGuestPct(v)} min={0} max={100} step={5} />
          </div>

          {/* Sessions per month */}
          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <label className="text-sm font-medium block mb-1">Guest Sessions/Mo: <span className="text-primary">{guestSessions}</span></label>
              <Slider value={[guestSessions]} onValueChange={([v]) => setGuestSessions(v)} min={1} max={15} step={1} />
              <p className="text-xs text-muted-foreground mt-1">20-min sessions, ~2.5 stories each</p>
            </div>
            <div>
              <label className="text-sm font-medium block mb-1">Premium Sessions/Mo: <span className="text-primary">{premiumSessions}</span></label>
              <Slider value={[premiumSessions]} onValueChange={([v]) => setPremiumSessions(v)} min={1} max={30} step={1} />
              <p className="text-xs text-muted-foreground mt-1">~20 pages per session</p>
            </div>
            <div>
              <label className="text-sm font-medium block mb-1">Subscription Price: <span className="text-primary">${subscriptionPrice.toFixed(2)}</span></label>
              <Slider value={[subscriptionPrice]} onValueChange={([v]) => setSubscriptionPrice(v)} min={1} max={30} step={0.5} />
              <p className="text-xs text-muted-foreground mt-1">Monthly price per premium user</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ═══════════ PROJECTIONS ═══════════ */}
      <div className="grid gap-4 md:grid-cols-3">
        {/* Monthly Cost */}
        <Card className={sim.totalMonthlyCost > 100 ? 'border-destructive' : ''}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              Projected Monthly Cost
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-3xl font-bold ${sim.totalMonthlyCost > 100 ? 'text-destructive' : 'text-primary'}`}>
              ${sim.totalMonthlyCost.toFixed(2)}
            </div>
            <div className="mt-3 space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="flex items-center gap-1"><BookOpen className="h-3 w-3" /> Stories ({sim.totalStories.toLocaleString()})</span>
                <span>${sim.storyCost.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="flex items-center gap-1"><ImageIcon className="h-3 w-3" /> Images ({sim.totalImages.toLocaleString()})</span>
                <span>${sim.imageCost.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="flex items-center gap-1"><Mic className="h-3 w-3" /> Audio ({sim.totalAudio.toLocaleString()})</span>
                <span>${sim.audioCost.toFixed(2)}</span>
              </div>
            </div>
            {sim.totalMonthlyCost > 100 && (
              <p className="text-xs text-destructive mt-2 flex items-center gap-1">
                <AlertTriangle className="h-3 w-3" /> Exceeds $100 alert threshold
              </p>
            )}
          </CardContent>
        </Card>

        {/* Capacity */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Server className="h-4 w-4" />
              Infrastructure Capacity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold mb-1">Peak: ~{sim.peakConcurrent} concurrent</div>
            <p className="text-xs text-muted-foreground mb-3">Estimated 5% of monthly users online at peak</p>
            <div className="space-y-2">
              {[
                { label: 'DB Connections', status: sim.dbStatus, value: sim.peakConcurrent, max: CAPACITY.dbConnections.max },
                { label: 'OpenAI RPM', status: sim.openaiStatus, value: sim.peakRPM, max: CAPACITY.openaiRPM.max },
                { label: 'Runware RPM', status: sim.runwareStatus, value: sim.peakImageRPM, max: CAPACITY.runwareRPM.max },
                { label: 'ElevenLabs RPM', status: sim.elevenStatus, value: sim.peakAudioRPM, max: CAPACITY.elevenLabsRPM.max },
              ].map(({ label, status, value, max }) => (
                <div key={label} className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${status.color}`} />
                    {label}
                  </span>
                  <span className="text-muted-foreground">{value}/{max}</span>
                </div>
              ))}
            </div>
            {needsUpgrade && (
              <div className="mt-3 p-2 bg-muted rounded text-xs space-y-1">
                <p className="font-medium">Recommended upgrades:</p>
                {sim.dbStatus.level !== 'green' && <p>• Add PgBouncer for connection pooling</p>}
                {sim.openaiStatus.level !== 'green' && <p>• Upgrade to OpenAI Tier 3+ for higher RPM</p>}
                {sim.runwareStatus.level !== 'green' && <p>• Add generation queue for image requests</p>}
                {sim.elevenStatus.level !== 'green' && <p>• Add TTS queue or caching layer</p>}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Revenue */}
        <Card className={sim.profit >= 0 ? 'border-green-500/30' : 'border-destructive/30'}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Revenue & Break-Even
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-3xl font-bold ${sim.profit >= 0 ? 'text-green-600' : 'text-destructive'}`}>
              {sim.profit >= 0 ? '+' : ''}${sim.profit.toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground mb-3">Monthly profit/loss</p>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Revenue ({sim.premiumCount} × ${subscriptionPrice.toFixed(2)})</span>
                <span className="font-medium">${sim.monthlyRevenue.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Costs</span>
                <span className="font-medium text-destructive">-${sim.totalMonthlyCost.toFixed(2)}</span>
              </div>
              <div className="flex justify-between border-t pt-2">
                <span>Break-even price</span>
                <span className="font-bold">${sim.breakEvenPrice.toFixed(2)}/user</span>
              </div>
            </div>
            {sim.profit >= 0 ? (
              <p className="text-xs text-green-600 mt-2 flex items-center gap-1">
                <CheckCircle2 className="h-3 w-3" /> Profitable at this scale
              </p>
            ) : (
              <p className="text-xs text-destructive mt-2 flex items-center gap-1">
                <AlertTriangle className="h-3 w-3" /> Need ${Math.abs(sim.profit).toFixed(2)} more revenue or lower costs
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* ═══════════ USAGE BREAKDOWN TABLE ═══════════ */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Usage Breakdown: Guest vs Premium</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-muted-foreground">
                  <th className="text-left py-2">Metric</th>
                  <th className="text-right py-2">Guest ({sim.guestCount})</th>
                  <th className="text-right py-2">Premium ({sim.premiumCount})</th>
                  <th className="text-right py-2 font-bold">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                <tr>
                  <td className="py-2">Sessions/month</td>
                  <td className="text-right">{(sim.guestCount * guestSessions).toLocaleString()}</td>
                  <td className="text-right">{(sim.premiumCount * premiumSessions).toLocaleString()}</td>
                  <td className="text-right font-medium">{(sim.guestCount * guestSessions + sim.premiumCount * premiumSessions).toLocaleString()}</td>
                </tr>
                <tr>
                  <td className="py-2">Story API calls</td>
                  <td className="text-right">{sim.guestStoriesPerMonth.toLocaleString()}</td>
                  <td className="text-right">{sim.premStoriesPerMonth.toLocaleString()}</td>
                  <td className="text-right font-medium">{sim.totalStories.toLocaleString()}</td>
                </tr>
                <tr>
                  <td className="py-2">Images generated</td>
                  <td className="text-right">{sim.guestImagesPerMonth.toLocaleString()}</td>
                  <td className="text-right">{sim.premImagesPerMonth.toLocaleString()}</td>
                  <td className="text-right font-medium">{sim.totalImages.toLocaleString()}</td>
                </tr>
                <tr>
                  <td className="py-2">Audio generated</td>
                  <td className="text-right">{sim.guestAudioPerMonth.toLocaleString()}</td>
                  <td className="text-right">{sim.premAudioPerMonth.toLocaleString()}</td>
                  <td className="text-right font-medium">{sim.totalAudio.toLocaleString()}</td>
                </tr>
                <tr className="font-bold">
                  <td className="py-2">Estimated cost</td>
                  <td className="text-right">
                    ${(sim.guestStoriesPerMonth * costPerUnit.story + sim.guestImagesPerMonth * costPerUnit.image + sim.guestAudioPerMonth * costPerUnit.audio).toFixed(2)}
                  </td>
                  <td className="text-right">
                    ${(sim.premStoriesPerMonth * costPerUnit.story + sim.premImagesPerMonth * costPerUnit.image + sim.premAudioPerMonth * costPerUnit.audio).toFixed(2)}
                  </td>
                  <td className="text-right text-primary">${sim.totalMonthlyCost.toFixed(2)}</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="text-xs text-muted-foreground mt-3">
            Unit costs from your real data: story=${costPerUnit.story.toFixed(4)}, image=${costPerUnit.image.toFixed(4)}, audio=${costPerUnit.audio.toFixed(4)}
          </p>
        </CardContent>
      </Card>
    </div>
  );
};
