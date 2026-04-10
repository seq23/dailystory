import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Users, DollarSign, Server, TrendingUp, AlertTriangle, CheckCircle2, BookOpen, Mic, Info } from 'lucide-react';
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
  ttsQueue: { label: 'TTS persistent cache (Supabase Storage)', cost: '$0/mo (included)', detail: 'Persistent audio cache — repeat reads cost $0 in API fees' },
  elevenLabsPro: { label: 'ElevenLabs Pro plan', cost: '$99/mo', detail: '500K chars included, $0.12/1K overage (vs $0.30 pay-as-you-go)' },
  elevenLabsScale: { label: 'ElevenLabs Scale plan', cost: '$330/mo', detail: '2M chars included, 2,000 RPM, $0.12/1K overage' },
};

// Cache hit rate increases with scale (more shared content among users)
function estimateCacheHitRate(totalUsers: number): number {
  if (totalUsers <= 50) return 0.30;
  if (totalUsers <= 100) return 0.40;
  if (totalUsers <= 500) return 0.55;
  if (totalUsers <= 1000) return 0.65;
  if (totalUsers <= 2500) return 0.72;
  if (totalUsers <= 5000) return 0.78;
  return 0.82;
}

function capacityStatus(value: number, thresholds: { safe: number; warn: number; max: number }) {
  if (value <= thresholds.safe) return { color: 'bg-green-500', label: 'OK', level: 'green' };
  if (value <= thresholds.warn) return { color: 'bg-yellow-500', label: 'Monitor', level: 'yellow' };
  return { color: 'bg-red-500', label: 'At Risk', level: 'red' };
}

export const ScenarioSimulator: React.FC<ScenarioSimulatorProps> = ({ costPerUnit }) => {
  const [totalUsers, setTotalUsers] = useState(100);
  const [guestPct, setGuestPct] = useState(80);
  const [guestSessions, setGuestSessions] = useState(DEFAULTS.guest.sessionsPerMonth);
  const [premiumSessions, setPremiumSessions] = useState(DEFAULTS.premium.sessionsPerMonth);
  const [subscriptionPrice, setSubscriptionPrice] = useState(9.99);
  const [guestTTS, setGuestTTS] = useState(true);
  const [premiumTTS, setPremiumTTS] = useState(true);

  const sim = useMemo(() => {
    const guestCount = Math.round(totalUsers * (guestPct / 100));
    const premiumCount = totalUsers - guestCount;

    // Guest: 2.5 stories × 6 pages = 15 pages/session → 15 images, 15 audio
    const guestPagesPerSession = DEFAULTS.guest.storiesPerSession * DEFAULTS.guest.pagesPerStory;
    const guestStoriesPerMonth = guestCount * guestSessions * DEFAULTS.guest.storiesPerSession;
    const guestImagesPerMonth = guestCount * guestSessions * guestPagesPerSession;
    const guestAudioPerMonth = guestTTS ? guestCount * guestSessions * guestPagesPerSession : 0;
    const guestAudioSavings = guestTTS ? 0 : guestCount * guestSessions * guestPagesPerSession * costPerUnit.audio;
    // Premium: 20 pages/session → 20 images, 20 audio, ~1 story call per page
    const premStoriesPerMonth = premiumCount * premiumSessions * DEFAULTS.premium.pagesPerSession;
    const premImagesPerMonth = premiumCount * premiumSessions * DEFAULTS.premium.pagesPerSession;
    const premAudioPerMonth = premiumTTS ? premiumCount * premiumSessions * DEFAULTS.premium.pagesPerSession : 0;
    const premAudioSavings = premiumTTS ? 0 : premiumCount * premiumSessions * DEFAULTS.premium.pagesPerSession * costPerUnit.audio;

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
    const peakAudioRPM = (guestTTS || premiumTTS) ? peakConcurrent * 1 : 0;

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
      guestAudioSavings, premAudioSavings,
    };
  }, [totalUsers, guestPct, guestSessions, premiumSessions, costPerUnit, subscriptionPrice, guestTTS, premiumTTS]);

  const needsUpgrade = sim.dbStatus.level !== 'green' || sim.openaiStatus.level !== 'green' || sim.runwareStatus.level !== 'green' || sim.elevenStatus.level !== 'green';

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
            <label className="text-sm font-medium mb-2 block">
              Total Monthly Users: <span className="text-primary font-bold">{totalUsers.toLocaleString()}</span>
              <span className="ml-3 text-muted-foreground font-normal">
                (~${(sim.totalMonthlyCost / Math.max(totalUsers, 1)).toFixed(2)}/user)
              </span>
            </label>
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
              <Slider value={[guestSessions]} onValueChange={([v]) => setGuestSessions(v)} min={1} max={30} step={1} />
              <p className="text-xs text-muted-foreground mt-1">Industry avg: 4-8/mo for free ed-apps</p>
            </div>
            <div>
              <label className="text-sm font-medium block mb-1">Premium Sessions/Mo: <span className="text-primary">{premiumSessions}</span></label>
              <Slider value={[premiumSessions]} onValueChange={([v]) => setPremiumSessions(v)} min={1} max={30} step={1} />
              <p className="text-xs text-muted-foreground mt-1">Industry avg: 12-20/mo for paid ed-apps</p>
            </div>
            <div>
              <label className="text-sm font-medium block mb-1">Subscription Price: <span className="text-primary">${subscriptionPrice.toFixed(2)}</span></label>
              <Slider value={[subscriptionPrice]} onValueChange={([v]) => setSubscriptionPrice(v)} min={1} max={30} step={0.5} />
              <p className="text-xs text-muted-foreground mt-1">Industry avg: $8.13/mo for ed-apps</p>
            </div>
          </div>

          {/* Industry benchmarks */}
          <div className="p-3 rounded-lg bg-muted/50 border text-xs space-y-1">
            <p className="font-medium text-sm">📊 Industry Benchmarks (Education Apps, 2024-2025)</p>
            <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-muted-foreground">
              <p>• D30 retention: ~2% (ed-app avg)</p>
              <p>• DAU/MAU ratio: 10-20% (3-6 days/mo)</p>
              <p>• Free users: 1-2 sessions/week</p>
              <p>• Paid users: 3-5 sessions/week (2-3× more)</p>
              <p>• Top apps (Duolingo): ~50% DAU/MAU</p>
              <p>• Avg ed-app subscription: $8.13/mo</p>
            </div>
            <p className="text-muted-foreground italic">Sources: BusinessOfApps, RevenueCat, Qustodio 2024 Report</p>
          </div>

          {/* Guest TTS toggle */}
          <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50 border">
            <div>
              <label className="text-sm font-medium">ElevenLabs TTS for Guests</label>
              <p className="text-xs text-muted-foreground">Toggle off to see savings without guest audio</p>
            </div>
            <div className="flex items-center gap-3">
              {!guestTTS && sim.guestAudioSavings > 0 && (
                <Badge variant="outline" className="text-green-600 border-green-600/30">
                  Saving ${sim.guestAudioSavings.toFixed(2)}/mo
                </Badge>
              )}
              <Switch checked={guestTTS} onCheckedChange={setGuestTTS} />
            </div>
          </div>

          {/* Premium TTS toggle */}
          <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50 border">
            <div>
              <label className="text-sm font-medium">ElevenLabs TTS for Premium</label>
              <p className="text-xs text-muted-foreground">Toggle off to model enterprise contracts with browser TTS</p>
            </div>
            <div className="flex items-center gap-3">
              {!premiumTTS && sim.premAudioSavings > 0 && (
                <Badge variant="outline" className="text-green-600 border-green-600/30">
                  Saving ${sim.premAudioSavings.toFixed(2)}/mo
                </Badge>
              )}
              <Switch checked={premiumTTS} onCheckedChange={setPremiumTTS} />
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
              <div className="mt-3 p-3 bg-muted rounded text-xs space-y-2">
                <p className="font-medium">Recommended upgrades:</p>
                {sim.dbStatus.level !== 'green' && (
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium">• {UPGRADE_COSTS.pgbouncer.label}</p>
                      <p className="text-muted-foreground">{UPGRADE_COSTS.pgbouncer.detail}</p>
                    </div>
                    <span className="font-bold text-primary whitespace-nowrap ml-2">{UPGRADE_COSTS.pgbouncer.cost}</span>
                  </div>
                )}
                {sim.openaiStatus.level !== 'green' && (
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium">• {sim.peakRPM > 5000 ? UPGRADE_COSTS.openaiTier4.label : UPGRADE_COSTS.openaiTier3.label}</p>
                      <p className="text-muted-foreground">{sim.peakRPM > 5000 ? UPGRADE_COSTS.openaiTier4.detail : UPGRADE_COSTS.openaiTier3.detail}</p>
                    </div>
                    <span className="font-bold text-primary whitespace-nowrap ml-2">{sim.peakRPM > 5000 ? UPGRADE_COSTS.openaiTier4.cost : UPGRADE_COSTS.openaiTier3.cost}</span>
                  </div>
                )}
                {sim.runwareStatus.level !== 'green' && (
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium">• {UPGRADE_COSTS.imageQueue.label}</p>
                      <p className="text-muted-foreground">{UPGRADE_COSTS.imageQueue.detail}</p>
                    </div>
                    <span className="font-bold text-primary whitespace-nowrap ml-2">{UPGRADE_COSTS.imageQueue.cost}</span>
                  </div>
                )}
                {sim.elevenStatus.level !== 'green' && (
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium">• {UPGRADE_COSTS.elevenLabsScale.label}</p>
                      <p className="text-muted-foreground">{UPGRADE_COSTS.elevenLabsScale.detail}</p>
                    </div>
                    <span className="font-bold text-primary whitespace-nowrap ml-2">{UPGRADE_COSTS.elevenLabsScale.cost}</span>
                  </div>
                )}
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
