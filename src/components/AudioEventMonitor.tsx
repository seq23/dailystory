import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Activity, Trash2, Pause, Play, Volume2, Mic } from 'lucide-react';

interface AudioEvent {
  id: string;
  timestamp: Date;
  type: string;
  source: string;
  data: any;
  category: 'audio' | 'voice' | 'highlighting' | 'coordination' | 'system';
}

export const AudioEventMonitor = () => {
  const [events, setEvents] = useState<AudioEvent[]>([]);
  const [isMonitoring, setIsMonitoring] = useState(true);
  const [autoScroll, setAutoScroll] = useState(true);
  const [filter, setFilter] = useState<string>('all');
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const eventIdCounter = useRef(0);

  // Create event listener for all audio-related events
  useEffect(() => {
    if (!isMonitoring) return;

    const audioEvents = [
      // Audio coordination events
      'charlotte:speech:request',
      'charlotte:speech:stop',
      'audio:conflict',
      'story:audio:start',
      'story:audio:stop',
      'audio:statechange',
      'audio:pause',
      'audio:resume',
      'audio:repeat',
      'audio:speed',
      
      // Voice command events
      'voice:status',
      'voice:level',
      'voice:command',
      'voice:start',
      'voice:stop',
      'voice:toggle',
      'voice:vocab',
      'voice:hover:word',
      
      // Highlighting events
      'highlighting:request',
      'highlighting:clear-all',
      'highlighting:ensure-active',
      
      // System events
      'page:change',
      'content:sync',
      'session:start',
      'session:end'
    ];

    const eventHandlers: { [key: string]: EventListener } = {};

    audioEvents.forEach(eventType => {
      const handler = (event: Event) => {
        const customEvent = event as CustomEvent;
        const newEvent: AudioEvent = {
          id: `event-${++eventIdCounter.current}`,
          timestamp: new Date(),
          type: eventType,
          source: 'window',
          data: customEvent.detail || {},
          category: getCategoryFromEventType(eventType)
        };
        
        setEvents(prev => [...prev, newEvent].slice(-100)); // Keep last 100 events
      };
      
      eventHandlers[eventType] = handler;
      window.addEventListener(eventType, handler);
    });

    // Also monitor console logs related to audio
    const originalConsoleLog = console.log;
    const originalConsoleWarn = console.warn;
    const originalConsoleError = console.error;

    const createConsoleInterceptor = (level: string, originalFn: Function) => {
      return (...args: any[]) => {
        const message = args.join(' ');
        if (isAudioRelatedLog(message)) {
          const newEvent: AudioEvent = {
            id: `console-${++eventIdCounter.current}`,
            timestamp: new Date(),
            type: `console.${level}`,
            source: 'console',
            data: { message, args },
            category: 'system'
          };
          setEvents(prev => [...prev, newEvent].slice(-100));
        }
        originalFn.apply(console, args);
      };
    };

    console.log = createConsoleInterceptor('log', originalConsoleLog);
    console.warn = createConsoleInterceptor('warn', originalConsoleWarn);
    console.error = createConsoleInterceptor('error', originalConsoleError);

    return () => {
      // Remove event listeners
      audioEvents.forEach(eventType => {
        if (eventHandlers[eventType]) {
          window.removeEventListener(eventType, eventHandlers[eventType]);
        }
      });
      
      // Restore console methods
      console.log = originalConsoleLog;
      console.warn = originalConsoleWarn;
      console.error = originalConsoleError;
    };
  }, [isMonitoring]);

  // Auto-scroll to bottom when new events arrive
  useEffect(() => {
    if (autoScroll && scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [events, autoScroll]);

  const getCategoryFromEventType = (eventType: string): AudioEvent['category'] => {
    if (eventType.startsWith('voice:')) return 'voice';
    if (eventType.startsWith('highlighting:')) return 'highlighting';
    if (eventType.startsWith('charlotte:') || eventType.startsWith('audio:') || eventType.startsWith('story:')) {
      return 'coordination';
    }
    if (eventType.startsWith('console.')) return 'system';
    return 'audio';
  };

  const isAudioRelatedLog = (message: string): boolean => {
    const audioKeywords = [
      'audio', 'charlotte', 'voice', 'tts', 'speech', 'sound', 'play', 'stop', 'pause',
      'highlighting', 'word', 'syllable', 'pronunciation', 'elevenlabs', 'microphone'
    ];
    return audioKeywords.some(keyword => message.toLowerCase().includes(keyword));
  };

  const filteredEvents = events.filter(event => {
    if (filter === 'all') return true;
    return event.category === filter;
  });

  const clearEvents = () => {
    setEvents([]);
  };

  const getCategoryIcon = (category: AudioEvent['category']) => {
    switch (category) {
      case 'audio': return <Volume2 className="w-3 h-3" />;
      case 'voice': return <Mic className="w-3 h-3" />;
      case 'highlighting': return <Activity className="w-3 h-3" />;
      case 'coordination': return <Play className="w-3 h-3" />;
      case 'system': return <Activity className="w-3 h-3" />;
      default: return <Activity className="w-3 h-3" />;
    }
  };

  const getCategoryColor = (category: AudioEvent['category']) => {
    switch (category) {
      case 'audio': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'voice': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'highlighting': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'coordination': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      case 'system': return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const formatEventData = (data: any) => {
    if (!data || Object.keys(data).length === 0) return null;
    
    try {
      return JSON.stringify(data, null, 2);
    } catch {
      return String(data);
    }
  };

  return (
    <div className="space-y-4">
      {/* Monitor Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Activity className="w-5 h-5" />
              Audio Event Monitor
            </div>
            <Badge variant={isMonitoring ? 'default' : 'secondary'}>
              {isMonitoring ? 'Active' : 'Paused'}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id="monitoring"
                  checked={isMonitoring}
                  onCheckedChange={setIsMonitoring}
                />
                <Label htmlFor="monitoring">Live Monitoring</Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch
                  id="autoscroll"
                  checked={autoScroll}
                  onCheckedChange={setAutoScroll}
                />
                <Label htmlFor="autoscroll">Auto Scroll</Label>
              </div>
            </div>
            
            <Button onClick={clearEvents} variant="outline" size="sm" className="flex items-center gap-2">
              <Trash2 className="w-4 h-4" />
              Clear Events
            </Button>
          </div>

          {/* Event Categories Filter */}
          <div className="flex items-center gap-2 flex-wrap">
            <Label className="text-sm font-medium">Filter:</Label>
            {['all', 'audio', 'voice', 'highlighting', 'coordination', 'system'].map(category => (
              <Button
                key={category}
                onClick={() => setFilter(category)}
                variant={filter === category ? 'default' : 'outline'}
                size="sm"
                className="text-xs"
              >
                {category.charAt(0).toUpperCase() + category.slice(1)}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Event Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {['audio', 'voice', 'highlighting', 'coordination', 'system'].map(category => {
          const count = events.filter(e => e.category === category).length;
          return (
            <Card key={category}>
              <CardContent className="pt-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {getCategoryIcon(category as AudioEvent['category'])}
                    <span className="text-sm font-medium capitalize">{category}</span>
                  </div>
                  <Badge variant="outline">{count}</Badge>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Event Log */}
      <Card>
        <CardHeader>
          <CardTitle>
            Event Log ({filteredEvents.length} events)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-96 w-full border rounded p-4" ref={scrollAreaRef}>
            {filteredEvents.length === 0 ? (
              <div className="text-center text-muted-foreground py-8">
                No events recorded yet. Interact with audio features to see events appear here.
              </div>
            ) : (
              <div className="space-y-2">
                {filteredEvents.map(event => (
                  <div key={event.id} className="border rounded p-3 bg-muted/50">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Badge className={`text-xs ${getCategoryColor(event.category)}`}>
                          {getCategoryIcon(event.category)}
                          {event.category}
                        </Badge>
                        <code className="text-sm font-mono bg-background px-2 py-1 rounded">
                          {event.type}
                        </code>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {event.timestamp.toLocaleTimeString()}.{event.timestamp.getMilliseconds().toString().padStart(3, '0')}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-2 text-sm">
                      <Badge variant="outline" className="text-xs">
                        {event.source}
                      </Badge>
                    </div>
                    
                    {formatEventData(event.data) && (
                      <details className="mt-2">
                        <summary className="text-sm cursor-pointer text-muted-foreground hover:text-foreground">
                          Event Data
                        </summary>
                        <pre className="text-xs bg-background p-2 rounded mt-1 overflow-x-auto">
                          {formatEventData(event.data)}
                        </pre>
                      </details>
                    )}
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Testing Instructions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Event Monitoring Instructions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            <p><strong>Audio Events:</strong> Start/stop story reading to see audio coordination events</p>
            <p><strong>Voice Events:</strong> Use voice commands to see voice status and command recognition events</p>
            <p><strong>Highlighting Events:</strong> Watch word highlighting during story playback</p>
            <p><strong>Coordination Events:</strong> See how Charlotte Buddy coordinates with story audio</p>
            <p><strong>System Events:</strong> Console logs and system-level audio events</p>
            <div className="mt-4 p-3 bg-green-50 dark:bg-green-900/20 rounded border border-green-200 dark:border-green-800">
              <strong>Pro Tip:</strong> Use the filter buttons to focus on specific event types. The monitor captures real-time events from all audio systems.
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};