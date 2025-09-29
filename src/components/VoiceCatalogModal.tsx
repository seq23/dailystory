import React, { useState, useEffect } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { VoiceCatalogIntegration } from '@/services/voiceCatalog';
import type { ProcessedVoice } from '@/services/voiceCatalog/types';
import { Search, User, Heart, Sparkles, Book, Target } from 'lucide-react';

interface VoiceCatalogModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface VoiceWithLevel {
  voice: ProcessedVoice;
  level: string;
}

export function VoiceCatalogModal({ open, onOpenChange }: VoiceCatalogModalProps) {
  const [voices, setVoices] = useState<VoiceWithLevel[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedVoice, setSelectedVoice] = useState<VoiceWithLevel | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open && voices.length === 0) {
      loadVoices();
    }
  }, [open]);

  const loadVoices = async () => {
    setLoading(true);
    try {
      const catalogInfo = await VoiceCatalogIntegration.getCatalogInfo();
      // For now, we'll create sample voice data since we don't have direct access to all voices
      const sampleVoices: VoiceWithLevel[] = [
        {
          voice: {
            id: 'keeper_meadow_tales',
            pn: 'Keeper of Meadow Tales',
            vf: { tone: [1, 2], cad: 0.7, var: 0.6, wp: [1], fig: 0.5, hum: 0.4, warm: 0.8, nar: 0.9 },
            resolvedElements: {
              tones: ['gentle', 'warm'],
              themes: ['nature', 'friendship', 'magic'],
              hooks: ['nature discovery'],
              transitions: ['smooth'],
              pauses: ['thoughtful'],
              continuations: ['gentle'],
              twists: ['surprising'],
              endings: ['hopeful'],
              helpers: ['wise animals'],
              dialogStyles: ['natural'],
              emotions: ['wonder'],
              settings: ['meadows', 'forests'],
              sounds: ['wind', 'birds']
            }
          } as ProcessedVoice,
          level: 'easy'
        },
        {
          voice: {
            id: 'urban_adventure_guide',
            pn: 'Urban Adventure Guide',
            vf: { tone: [3, 4], cad: 0.9, var: 0.8, wp: [2], fig: 0.7, hum: 0.6, warm: 0.6, nar: 0.8 },
            resolvedElements: {
              tones: ['energetic', 'modern'],
              themes: ['city', 'friendship', 'discovery'],
              hooks: ['urban exploration'],
              transitions: ['quick'],
              pauses: ['brief'],
              continuations: ['exciting'],
              twists: ['unexpected'],
              endings: ['triumphant'],
              helpers: ['street smart friends'],
              dialogStyles: ['casual'],
              emotions: ['excitement'],
              settings: ['cities', 'neighborhoods'],
              sounds: ['traffic', 'crowds']
            }
          } as ProcessedVoice,
          level: 'medium'
        },
        {
          voice: {
            id: 'cosmic_philosopher',
            pn: 'Cosmic Philosopher',
            vf: { tone: [5, 6], cad: 0.5, var: 0.9, wp: [3], fig: 0.9, hum: 0.3, warm: 0.5, nar: 0.7 },
            resolvedElements: {
              tones: ['contemplative', 'profound'],
              themes: ['space', 'philosophy', 'existence'],
              hooks: ['deep questions'],
              transitions: ['reflective'],
              pauses: ['meaningful'],
              continuations: ['thought-provoking'],
              twists: ['mind-bending'],
              endings: ['enlightening'],
              helpers: ['wise mentors'],
              dialogStyles: ['philosophical'],
              emotions: ['awe'],
              settings: ['space', 'observatories'],
              sounds: ['silence', 'cosmic hum']
            }
          } as ProcessedVoice,
          level: 'expert'
        }
      ];
      setVoices(sampleVoices);
    } catch (error) {
      console.error('Failed to load voices:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredVoices = voices.filter(({ voice }) => 
    voice.pn.toLowerCase().includes(searchTerm.toLowerCase()) ||
    voice.resolvedElements.themes.some(theme => 
      theme.toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  const getDifficultyColor = (level: string) => {
    switch (level) {
      case 'beginner': return 'bg-green-100 text-green-800';
      case 'easy': return 'bg-blue-100 text-blue-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'hard': return 'bg-orange-100 text-orange-800';
      case 'expert': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getWarmthLevel = (warmth: number) => {
    if (warmth >= 0.8) return { label: 'Very Warm', color: 'text-red-600' };
    if (warmth >= 0.6) return { label: 'Warm', color: 'text-orange-600' };
    if (warmth >= 0.4) return { label: 'Neutral', color: 'text-yellow-600' };
    if (warmth >= 0.2) return { label: 'Cool', color: 'text-blue-600' };
    return { label: 'Very Cool', color: 'text-indigo-600' };
  };

  const getHumorLevel = (humor: number) => {
    if (humor >= 0.8) return { label: 'Very Funny', color: 'text-purple-600' };
    if (humor >= 0.6) return { label: 'Playful', color: 'text-pink-600' };
    if (humor >= 0.4) return { label: 'Light', color: 'text-green-600' };
    if (humor >= 0.2) return { label: 'Subtle', color: 'text-gray-600' };
    return { label: 'Serious', color: 'text-gray-800' };
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="w-5 h-5" />
            Voice Catalog Browser
          </DialogTitle>
          <DialogDescription>
            Explore all available narrative voices with their characteristics and themes
          </DialogDescription>
        </DialogHeader>

        <div className="flex gap-6 h-[70vh]">
          {/* Left Panel - Voice List */}
          <div className="flex-1 flex flex-col gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Search voices or themes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <ScrollArea className="flex-1">
              <div className="space-y-3">
                {loading && (
                  <div className="text-center text-muted-foreground py-8">
                    Loading voices...
                  </div>
                )}
                
                {!loading && filteredVoices.map(({ voice, level }) => (
                  <Card 
                    key={voice.id}
                    className={`cursor-pointer transition-all hover:shadow-md ${
                      selectedVoice?.voice.id === voice.id ? 'ring-2 ring-primary' : ''
                    }`}
                    onClick={() => setSelectedVoice({ voice, level })}
                  >
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-sm">{voice.pn}</CardTitle>
                        <Badge className={getDifficultyColor(level)}>
                          {level}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="flex gap-2 flex-wrap">
                        {voice.resolvedElements.themes.slice(0, 3).map(theme => (
                          <Badge key={theme} variant="outline" className="text-xs">
                            {theme}
                          </Badge>
                        ))}
                        {voice.resolvedElements.themes.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{voice.resolvedElements.themes.length - 3} more
                          </Badge>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}

                {!loading && filteredVoices.length === 0 && (
                  <div className="text-center text-muted-foreground py-8">
                    No voices found matching your search
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>

          {/* Right Panel - Voice Details */}
          <div className="w-96">
            {selectedVoice ? (
              <ScrollArea className="h-full">
                <div className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <User className="w-4 h-4" />
                        {selectedVoice.voice.pn}
                      </CardTitle>
                      <CardDescription>
                        Level: <Badge className={getDifficultyColor(selectedVoice.level)}>
                          {selectedVoice.level}
                        </Badge>
                      </CardDescription>
                    </CardHeader>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-sm">
                        <Heart className="w-4 h-4" />
                        Voice Characteristics
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Warmth:</span>
                        <span className={`text-sm font-medium ${getWarmthLevel(selectedVoice.voice.vf.warm).color}`}>
                          {getWarmthLevel(selectedVoice.voice.vf.warm).label}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Humor:</span>
                        <span className={`text-sm font-medium ${getHumorLevel(selectedVoice.voice.vf.hum).color}`}>
                          {getHumorLevel(selectedVoice.voice.vf.hum).label}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Narrative Style:</span>
                        <span className="text-sm font-medium">
                          {(selectedVoice.voice.vf.nar * 100).toFixed(0)}% narrative
                        </span>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-sm">
                        <Sparkles className="w-4 h-4" />
                        Themes
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex gap-1 flex-wrap">
                        {selectedVoice.voice.resolvedElements.themes.map(theme => (
                          <Badge key={theme} variant="secondary" className="text-xs">
                            {theme}
                          </Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-sm">
                        <Book className="w-4 h-4" />
                        Story Elements
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div>
                        <div className="text-xs text-muted-foreground mb-1">Tones:</div>
                        <div className="flex gap-1 flex-wrap">
                          {selectedVoice.voice.resolvedElements.tones.map(tone => (
                            <Badge key={tone} variant="outline" className="text-xs">
                              {tone}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <Separator />
                      <div>
                        <div className="text-xs text-muted-foreground mb-1">Settings:</div>
                        <div className="flex gap-1 flex-wrap">
                          {selectedVoice.voice.resolvedElements.settings.map(setting => (
                            <Badge key={setting} variant="outline" className="text-xs">
                              {setting}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-sm">
                        <Target className="w-4 h-4" />
                        Best For
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-sm text-muted-foreground">
                        This voice works best for {selectedVoice.level} level readers who enjoy{' '}
                        {selectedVoice.voice.resolvedElements.themes.slice(0, 2).join(' and ')}{' '}
                        themes with a {getWarmthLevel(selectedVoice.voice.vf.warm).label.toLowerCase()}{' '}
                        and {getHumorLevel(selectedVoice.voice.vf.hum).label.toLowerCase()} tone.
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </ScrollArea>
            ) : (
              <div className="flex items-center justify-center h-full text-muted-foreground">
                Select a voice to see details
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}