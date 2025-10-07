import React, { useState, useEffect } from 'react';
import { DebugLogger, DebugLogEntry, DebugCategory } from '@/services/DebugLogger';
import { performanceManager } from '@/services/PerformanceManager';
import { productionHardening } from '@/services/ProductionHardening';
import { NetflixRetryService } from '@/services/NetflixRetryService';
import { NetworkDebugger, NetworkRequest } from '@/services/NetworkDebugger';
import { DebugGateway } from '@/services/DebugGateway';
import { DebugDataViewer } from '@/components/DebugDataViewer';
import phonicsMiniDict from '@/data/phonicsMiniDict';
import { charlotteVoiceService } from '@/services/CharlotteVoiceService';
import { unifiedSystemValidator } from '@/services/UnifiedSystemValidator';
import type { ValidationResult } from '@/services/UnifiedSystemValidator';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { X, Download, Trash2, Search, Play, Square, RotateCcw, MoreHorizontal, ChevronDown, Volume2, Loader2, TestTube } from 'lucide-react';
import { BackendTierChecker } from '@/components/BackendTierChecker';
import { useToast } from '@/hooks/use-toast';
import { ReadingStateManager } from '@/utils/ReadingStateManager';

interface NetflixDebugLog {
  timestamp: number;
  level: 'info' | 'warn' | 'error';
  message: string;
  context?: string;
  source: string;
}

// Enhanced Unified Debug Monitor - Consolidates all debugging functionality
export const UnifiedDebugMonitor: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [logs, setLogs] = useState<DebugLogEntry[]>([]);
  const [netflixLogs, setNetflixLogs] = useState<NetflixDebugLog[]>([]);
  const [networkRequests, setNetworkRequests] = useState<NetworkRequest[]>([]);
  const [activeTab, setActiveTab] = useState('console');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<DebugCategory | 'all'>('all');
  const [isRecording, setIsRecording] = useState(false);
  const [circuitBreakerStatus, setCircuitBreakerStatus] = useState<any>({});
  const [currentSessionId, setCurrentSessionId] = useState('');
  
  // System validation states
  const [systemValidationReport, setSystemValidationReport] = useState<any>(null);
  const [isValidating, setIsValidating] = useState(false);
  
  // Audio testing states (integrated from AudioPlaybackTester)
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  const [testText, setTestText] = useState('Hello, this is Charlotte speaking. How are you today?');
  const [testWord, setTestWord] = useState('cat');
  const [audioLoading, setAudioLoading] = useState(false);
  const [lastTest, setLastTest] = useState<string | null>(null);
  
  // TTS debug states (integrated from TTSDebugOverlay)
  const [ttsStatus, setTtsStatus] = useState({ isPlaying: false, currentWordIndex: -1, totalWords: 0, contentHash: '' });
  
  const { toast } = useToast();

  // TTS Status polling (integrated from TTSDebugOverlay)
  useEffect(() => {
    if (!DebugLogger.isDebugEnabled()) return; // Only run in debug mode
    
    const interval = setInterval(() => {
      // Pause polling during active reading to prevent interruptions
      if (ReadingStateManager.isReading() && document.visibilityState === 'visible') {
        return; // Skip this iteration
      }
      
      try {
        const charlotte = (window as any).__CharlotteVoiceService;
        const status = charlotte ? charlotte.getStatus() : { isPlaying: false, currentWordIndex: -1, totalWords: 0, contentHash: '' };
        setTtsStatus(status as any);
      } catch {}
    }, 2000); // Reduced frequency to 2 seconds
    
    return () => clearInterval(interval);
  }, []);

  // Auto-detect current session ID for live monitoring
  useEffect(() => {
    const detectCurrentSession = () => {
      const sessionId = sessionStorage.getItem('currentSessionId') || 
                        sessionStorage.getItem('sessionId') ||
                        localStorage.getItem('currentSessionId');
      if (sessionId && sessionId !== currentSessionId) {
        setCurrentSessionId(sessionId);
        DebugLogger.log('ui', 'Auto-detected current session for live monitoring', { sessionId });
      }
    };
    
    // Check immediately and every 10 seconds
    detectCurrentSession();
    const interval = setInterval(() => {
      // Only detect session if not actively reading OR in debug mode
      if (!ReadingStateManager.isReading() || DebugLogger.isDebugEnabled()) {
        detectCurrentSession();
      }
    }, 10000); // Increased to 10 seconds
    
    return () => clearInterval(interval);
  }, [currentSessionId]);

  // Netflix monitoring setup with proper state management
  useEffect(() => {
    if (!DebugLogger.isDebugEnabled()) return;

    let originalConsole: any = {};
    
    if (isRecording) {
      // Batch log updates to prevent setState during render
      const pendingLogs: NetflixDebugLog[] = [];
      let flushTimer: NodeJS.Timeout;

      const flushLogs = () => {
        if (pendingLogs.length > 0) {
          setNetflixLogs(prev => [...prev.slice(-(100 - pendingLogs.length)), ...pendingLogs]);
          pendingLogs.length = 0;
        }
      };

      // Intercept console methods for Netflix-specific logging
      ['log', 'warn', 'error'].forEach(method => {
        originalConsole[method] = console[method as keyof Console];
        (console as any)[method] = (...args: any[]) => {
          originalConsole[method](...args);
          
          const message = args.map(arg => 
            typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
          ).join(' ');
          
          // Filter non-core errors (third-party services that don't impact UX)
          const isNonCore = message.includes('firestore.googleapis.com') || 
                           message.includes('api.zilliqa.com') ||
                           message.includes('QUIC_PROTOCOL_ERROR') ||
                           message.includes('ERR_NETWORK_IO_SUSPENDED');
          
          // Capture debug-related messages (excluding non-core third-party noise)
          if (!isNonCore && (message.includes('Netflix') || message.includes('netflix') || 
              message.includes('circuit') || message.includes('retry') ||
              message.includes('🎬') || message.includes('🔄') || message.includes('❌') ||
              message.includes('Failed to fetch') || message.includes('TypeError: Failed to fetch') ||
              message.includes('504') || message.includes('sync-subscription-status') ||
              message.includes('check-subscription'))) {
            
            const logEntry: NetflixDebugLog = {
              timestamp: Date.now(),
              level: method as 'info' | 'warn' | 'error',
              message,
              source: 'Debug Capture'
            };
            
            pendingLogs.push(logEntry);
            
            // Batch updates using requestAnimationFrame
            clearTimeout(flushTimer);
            flushTimer = setTimeout(() => {
              requestAnimationFrame(flushLogs);
            }, 16);
          }
        };
      });

      return () => {
        // Restore original console methods and flush remaining logs
        Object.keys(originalConsole).forEach(method => {
          (console as any)[method] = originalConsole[method];
        });
        clearTimeout(flushTimer);
        if (pendingLogs.length > 0) {
          requestAnimationFrame(flushLogs);
        }
      };
    }
  }, [isRecording]);

  // Subscribe to general debug logger
  useEffect(() => {
    if (!DebugLogger.isDebugEnabled()) return;

    const unsubscribe = DebugLogger.subscribe((newLogs) => {
      setLogs(newLogs);
    });

    setLogs(DebugLogger.getLogs());
    return unsubscribe;
  }, []);

  // Network request monitoring
  useEffect(() => {
    if (!DebugLogger.isDebugEnabled()) return;

    const updateNetworkRequests = () => {
      const requests = NetworkDebugger.getRequests(50); // Get last 50 requests
      setNetworkRequests(requests);
    };

    // EMERGENCY: Manual refresh only to prevent quota burn
    updateNetworkRequests();
    // Auto-polling disabled - use manual refresh buttons instead
  }, []);

  // Circuit breaker monitoring
  useEffect(() => {
    if (!DebugLogger.isDebugEnabled()) return;

    const updateCircuitBreakerStatus = () => {
      try {
        const status = NetflixRetryService.getCircuitBreakerStatus();
        setCircuitBreakerStatus(status);
      } catch (error) {
        DebugLogger.warn('ui', 'Failed to get circuit breaker status', { error });
      }
    };

    // EMERGENCY: Manual refresh only to prevent quota burn  
    updateCircuitBreakerStatus();
    // Auto-polling disabled - use manual refresh buttons instead
  }, []);

  const startRecording = () => setIsRecording(true);
  const stopRecording = () => setIsRecording(false);
  const clearLogs = () => {
    DebugLogger.clearLogs();
    setNetflixLogs([]);
    NetworkDebugger.clearRequests();
    setNetworkRequests([]);
  };

  // Audio testing functions (integrated from AudioPlaybackTester)
  const testCharlotteVoice = async () => {
    setAudioLoading(true);
    setLastTest('Charlotte TTS (Primary)');
    DebugLogger.log('audio', '✅ Testing Charlotte voice service', { text: testText });

    try {
      if (typeof window !== 'undefined' && window.__CharlotteVoiceService) {
        const charlotteService = window.__CharlotteVoiceService;
        
        setIsAudioPlaying(true);
        await charlotteService.charlotteInteractiveAudio({
          text: testText,
          context: 'conversation'
        });
        
        toast({
          title: "🎙️ Charlotte Voice Test Success",
          description: "ElevenLabs Charlotte audio completed successfully",
        });
      } else {
        throw new Error('CharlotteVoiceService not available');
      }
    } catch (error: any) {
      DebugLogger.error('audio', 'Charlotte voice test failed', error);
      
      toast({
        title: "Charlotte Voice Test Failed",
        description: error.message || 'Charlotte service not available',
        variant: "destructive",
      });
    } finally {
      setAudioLoading(false);
      setIsAudioPlaying(false);
    }
  };

  const testInteractiveWord = async () => {
    setAudioLoading(true);
    setLastTest('Interactive Word');
    DebugLogger.log('audio', 'Testing interactive word audio', { word: testWord });

    try {
      if (typeof window !== 'undefined' && window.__CharlotteVoiceService) {
        const charlotteService = window.__CharlotteVoiceService;
        
        setIsAudioPlaying(true);
        await charlotteService.charlotteHearWord(testWord);
        
        toast({
          title: "Charlotte Word Test",
          description: `Charlotte successfully pronounced "${testWord}"`,
        });
      } else {
        throw new Error('CharlotteVoiceService not available');
      }
    } catch (error: any) {
      DebugLogger.error('audio', 'Charlotte word test failed', error);
      
      toast({
        title: "Charlotte Word Test Failed",
        description: error.message || 'Charlotte service not available',
        variant: "destructive",
      });
    } finally {
      setAudioLoading(false);
      setIsAudioPlaying(false);
    }
  };

  const testAudioCoordination = async () => {
    setAudioLoading(true);
    setLastTest('Audio Coordination');
    DebugLogger.log('audio', 'Testing audio coordination system');

    try {
      const events = ['story:audio:start', 'charlotte:speech:request', 'audio:conflict'];
      
      events.forEach(eventType => {
        const event = new CustomEvent(eventType, { detail: { source: 'UnifiedDebugMonitor' } });
        window.dispatchEvent(event);
        DebugLogger.log('audio', `Dispatched ${eventType} event`);
      });
      
      toast({
        title: "Audio Coordination Test",
        description: "Audio system events dispatched successfully",
      });
    } catch (error: any) {
      DebugLogger.error('audio', 'Audio coordination test failed', error);
      
      toast({
        title: "Audio Coordination Test Failed",
        description: error.message || 'Event system not available',
        variant: "destructive",
      });
    } finally {
      setAudioLoading(false);
    }
  };

  const stopAllAudio = () => {
    try {
      if (typeof window !== 'undefined' && window.__CharlotteVoiceService) {
        const charlotteService = window.__CharlotteVoiceService;
        charlotteService.stop();
      }

      const stopEvent = new CustomEvent('charlotte:stop', { detail: { source: 'UnifiedDebugMonitor' } });
      window.dispatchEvent(stopEvent);

      setIsAudioPlaying(false);
      DebugLogger.log('audio', 'All audio stopped via UnifiedDebugMonitor');
      
      toast({
        title: "Audio Stopped",
        description: "All Charlotte audio systems stopped",
      });
    } catch (error) {
      DebugLogger.error('audio', 'Failed to stop audio', error);
    }
  };

  const resetCircuitBreakers = () => {
    try {
      NetflixRetryService.resetAllCircuitBreakers();
      DebugLogger.log('performance', 'All circuit breakers reset');
    } catch (error) {
      DebugLogger.error('performance', 'Failed to reset circuit breakers', error);
    }
  };

  // System validation functions
  const runSystemValidation = async () => {
    setIsValidating(true);
    try {
      const report = await unifiedSystemValidator.validateSystem();
      setSystemValidationReport(report);
      
      toast({
        title: "System Validation Complete",
        description: `Status: ${report.overall.status} (Score: ${report.overall.score})`,
        variant: report.overall.status === 'healthy' ? 'default' : 'destructive',
      });
    } catch (error) {
      DebugLogger.error('performance', 'System validation failed', error);
      toast({
        title: "System Validation Failed",
        description: (error as Error).message,
        variant: "destructive",
      });
    } finally {
      setIsValidating(false);
    }
  };

  const validateComponent = async (component: string) => {
    setIsValidating(true);
    try {
      const result = await unifiedSystemValidator.validateComponent(component as any);
      
      toast({
        title: `${component} Validation Complete`,
        description: `${result.isValid ? 'Passed' : 'Failed'} - ${result.issues.length} issues, ${result.warnings.length} warnings`,
        variant: result.isValid ? 'default' : 'destructive',
      });
    } catch (error) {
      toast({
        title: `${component} Validation Failed`,
        description: (error as Error).message,
        variant: "destructive",
      });
    } finally {
      setIsValidating(false);
    }
  };

  const filteredLogs = logs.filter(log => {
    const matchesSearch = log.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         log.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || log.category === selectedCategory;
    return matchesSearch && matchesCategory;
  }).slice(-100);

  const filteredNetflixLogs = netflixLogs.filter(log => 
    log.message.toLowerCase().includes(searchTerm.toLowerCase())
  ).slice(-100);

  const getLogCount = (category: DebugCategory) => {
    return logs.filter(log => log.category === category).length;
  };

  const exportLogs = () => {
    const data = {
      timestamp: new Date().toISOString(),
      generalLogs: logs,
      netflixLogs: netflixLogs,
      circuitBreakerStatus: circuitBreakerStatus,
      performance: {
        memory: (performance as any).memory ? {
          used: Math.round(((performance as any).memory.usedJSHeapSize / 1024 / 1024)),
          total: Math.round(((performance as any).memory.totalJSHeapSize / 1024 / 1024)),
          limit: Math.round(((performance as any).memory.jsHeapSizeLimit / 1024 / 1024))
        } : null
      }
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `debug-logs-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString('en-US', { 
      hour12: false, 
      hour: '2-digit', 
      minute: '2-digit', 
      second: '2-digit'
    }) + '.' + String(timestamp % 1000).padStart(3, '0');
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'error': return 'text-red-400';
      case 'warn': return 'text-yellow-400';
      default: return 'text-foreground';
    }
  };

  const getCategoryColor = (category: DebugCategory) => {
    const colors = {
      auth: 'bg-blue-500/20 text-blue-300',
      story: 'bg-green-500/20 text-green-300',
      audio: 'bg-purple-500/20 text-purple-300',
      image: 'bg-pink-500/20 text-pink-300',
      performance: 'bg-orange-500/20 text-orange-300',
      network: 'bg-cyan-500/20 text-cyan-300',
      ui: 'bg-indigo-500/20 text-indigo-300',
      error: 'bg-red-500/20 text-red-300'
    };
    return colors[category];
  };

  const getCircuitBreakerColor = (state: string) => {
    switch (state) {
      case 'OPEN': return 'bg-red-500/20 text-red-300';
      case 'HALF_OPEN': return 'bg-yellow-500/20 text-yellow-300';
      case 'CLOSED': return 'bg-green-500/20 text-green-300';
      default: return 'bg-gray-500/20 text-gray-300';
    }
  };

  // Compact label for current tab
  const tabLabel = (t: string) => ({
    console: 'Console',
    network: 'Network',
    netflix: 'Netflix',
    'live-gen': 'Live Generation',
    'image-analysis': 'Image Analysis',
    'audio-test': 'Audio Test',
    'system-validation': 'System Validation',
    'system-events': 'System Events',
    'debug-data': 'Data'
  } as Record<string, string>)[t] || 'Console';

  if (!DebugLogger.isDebugEnabled() || !isVisible) {
    return DebugLogger.isDebugEnabled() ? (
      <button
        onClick={() => setIsVisible(true)}
        className="fixed bottom-2 right-2 z-[9999] bg-background/90 border border-muted rounded px-2 py-1 text-xs font-medium shadow-lg hover:bg-accent backdrop-blur-sm"
      >
        🐛 ({logs.length + netflixLogs.length + networkRequests.length})
      </button>
    ) : null;
  }

  return (
    <div className="fixed top-2 right-2 bottom-2 left-1/2 lg:left-2/3 z-[9999] bg-background/95 backdrop-blur-sm border border-muted rounded shadow-2xl flex flex-col">
      {/* Compact Header */}
      <div className="flex items-center justify-between p-1 border-b border-muted bg-background/90 backdrop-blur-sm min-h-0">
        <div className="flex items-center gap-1 min-w-0">
          <h2 className="text-xs font-semibold truncate">🐛 Debug</h2>
          
          {/* Tab Selector Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="h-5 px-2 text-xs">
                {tabLabel(activeTab)} <ChevronDown className="h-3 w-3 ml-1" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="z-[10000]">
              <DropdownMenuItem onSelect={() => setActiveTab('console')}>Console</DropdownMenuItem>
              <DropdownMenuItem onSelect={() => setActiveTab('network')}>Network</DropdownMenuItem>
              <DropdownMenuItem onSelect={() => setActiveTab('netflix')}>Netflix</DropdownMenuItem>
              <DropdownMenuItem onSelect={() => setActiveTab('live-gen')}>Live Generation</DropdownMenuItem>
              <DropdownMenuItem onSelect={() => setActiveTab('image-analysis')}>Image Analysis</DropdownMenuItem>
              <DropdownMenuItem onSelect={() => setActiveTab('audio-test')}>Audio Test</DropdownMenuItem>
              <DropdownMenuItem onSelect={() => setActiveTab('system-validation')}>System Validation</DropdownMenuItem>
              <DropdownMenuItem onSelect={() => setActiveTab('system-events')}>System Events</DropdownMenuItem>
              <DropdownMenuItem onSelect={() => setActiveTab('debug-data')}>Data</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Badge variant="outline" className="bg-green-500/20 text-green-300 h-4 text-xs px-1 hidden sm:inline-flex">
            P1
          </Badge>
        </div>
        
        <div className="flex items-center gap-1 flex-shrink-0">
          {/* More Actions Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="h-5 w-5 p-0" title="More Actions">
                <MoreHorizontal className="h-3 w-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="z-[10000]">
              <DropdownMenuItem onSelect={isRecording ? stopRecording : startRecording}>
                {isRecording ? 'Stop Recording' : 'Start Recording'}
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={resetCircuitBreakers}>Reset Circuit Breakers</DropdownMenuItem>
              <DropdownMenuItem onSelect={async () => {
                try {
                  const result = await DebugGateway.getLastGeneratedImage();
                  const imageData = result.data?.imagePrompts?.[0];
                  if (imageData) {
                    toast({
                      title: "Last Generated Image",
                      description: `Session: ${imageData.sessionId || 'Unknown'} | Status: ${imageData.success ? 'Success' : 'Failed'}`
                    });
                    DebugLogger.log('image', 'Last image debug data', imageData);
                  } else {
                    toast({
                      title: "No Image Data",
                      description: "No recent image generation found",
                      variant: "destructive"
                    });
                  }
                } catch (error) {
                  toast({
                    title: "Image Debug Failed", 
                    description: "Failed to fetch last image data",
                    variant: "destructive"
                  });
                }
              }}>🖼️ Last Image Debug</DropdownMenuItem>
              <DropdownMenuItem onSelect={exportLogs}>Export Logs</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          
          <Button variant="outline" size="sm" onClick={clearLogs} className="h-5 w-5 p-0" title="Clear Logs">
            <Trash2 className="h-3 w-3" />
          </Button>
          <Button variant="ghost" size="sm" onClick={() => setIsVisible(false)} className="h-5 w-5 p-0 flex-shrink-0" title="Close">
            <X className="h-3 w-3" />
          </Button>
        </div>
      </div>

      {/* Content Area - No Tabs Container */}
      <div className="flex-1 flex flex-col min-h-0 m-1">

        {/* Console View */}
        {activeTab === 'console' && (
          <div className="flex-1 flex flex-col min-h-0">
            {/* Compact Search and Filter */}
            <div className="flex gap-1 mb-1">
              <div className="relative flex-1">
                <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-3 w-3 text-muted-foreground" />
                <Input
                  placeholder="Search..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-6 h-5 text-xs"
                />
              </div>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value as DebugCategory | 'all')}
                className="h-5 px-1 rounded border border-input bg-background text-xs"
              >
                <option value="all">All</option>
                <option value="auth">Auth</option>
                <option value="story">Story</option>
                <option value="audio">Audio</option>
                <option value="image">Image</option>
                <option value="performance">Perf</option>
                <option value="network">Net</option>
                <option value="ui">UI</option>
                <option value="error">Error</option>
              </select>
            </div>

            {/* Direct Log List - Full Height */}
            <div className="flex-1 overflow-auto space-y-1 text-xs font-mono">
              {filteredLogs.map((log) => (
                <div key={log.id} className="border-b border-muted/30 pb-1 last:border-b-0">
                  <div className="flex items-center gap-1 mb-1 flex-wrap">
                    <span className="text-muted-foreground text-xs">{formatTime(log.timestamp)}</span>
                    <Badge variant="outline" className={`h-4 text-xs px-1 ${getCategoryColor(log.category)}`}>
                      {log.category}
                    </Badge>
                    <span className={`${getLevelColor(log.level)} text-xs uppercase`}>
                      {log.level}
                    </span>
                  </div>
                  <div className="text-foreground text-xs leading-tight break-words">{log.message}</div>
                  {log.data && (
                    <pre className="text-muted-foreground mt-1 text-xs bg-muted/20 p-1 rounded overflow-x-auto whitespace-pre-wrap">
                      {typeof log.data === 'string' ? log.data : JSON.stringify(log.data, null, 2)}
                    </pre>
                  )}
                </div>
              ))}
              {filteredLogs.length === 0 && (
                <div className="text-center text-muted-foreground py-4 text-xs">
                  No logs match search
                </div>
              )}
            </div>
          </div>
        )}

        {/* Network View */}
        {activeTab === 'network' && (
          <div className="flex-1 flex flex-col min-h-0">
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-1">
                <Badge variant="secondary" className="h-4 text-xs px-1">
                  Requests ({networkRequests.length})
                </Badge>
                <span className="text-xs text-muted-foreground">
                  Failed: {NetworkDebugger.getFailedRequests().length}
                </span>
              </div>
            </div>

            <div className="flex-1 overflow-auto space-y-1 text-xs font-mono">
              {networkRequests.map((req) => (
                <div key={req.id} className="border-b border-muted/30 pb-1 last:border-b-0">
                  <div className="flex items-center gap-1 mb-1 flex-wrap">
                    <span className="text-muted-foreground text-xs">{formatTime(req.timestamp)}</span>
                    <Badge className={`h-4 text-xs px-1 ${req.type === 'edge-function' ? 'bg-purple-500/20 text-purple-300' : req.type === 'supabase' ? 'bg-blue-500/20 text-blue-300' : 'bg-gray-500/20 text-gray-300'}`}>
                      {req.type}
                    </Badge>
                    <span className={`text-xs ${req.error || (req.status && req.status >= 400) ? 'text-red-400' : req.status && req.status < 400 ? 'text-green-400' : 'text-yellow-400'}`}>
                      {req.method}
                    </span>
                    {req.status && (
                      <span className={`text-xs ${req.status >= 400 ? 'text-red-400' : 'text-green-400'}`}>
                        {req.status}
                      </span>
                    )}
                    {req.duration && (
                      <span className="text-xs text-muted-foreground">
                        {req.duration}ms
                      </span>
                    )}
                  </div>
                  <div className="text-foreground text-xs leading-tight break-words">
                    {req.url}
                  </div>
                  {req.error && (
                    <div className="text-red-400 mt-1 text-xs bg-red-500/10 p-1 rounded">
                      {req.error}
                    </div>
                  )}
                </div>
              ))}
              {networkRequests.length === 0 && (
                <div className="text-center text-muted-foreground py-4 text-xs">
                  No network requests
                </div>
              )}
            </div>
          </div>
        )}

        {/* Netflix View */}
        {activeTab === 'netflix' && (
          <div className="flex-1 flex flex-col min-h-0">
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-1">
                <Badge variant="secondary" className="h-4 text-xs px-1">
                  Netflix Logs ({netflixLogs.length})
                </Badge>
                <div className="flex items-center gap-1">
                  {Object.entries(circuitBreakerStatus).map(([name, status]: [string, any]) => (
                    <Badge key={name} className={`h-4 text-xs px-1 ${getCircuitBreakerColor(status.state)}`}>
                      {name}: {status.state}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex-1 overflow-auto space-y-1 text-xs font-mono">
              {filteredNetflixLogs.map((log, index) => (
                <div key={index} className="border-b border-muted/30 pb-1 last:border-b-0">
                  <div className="flex items-center gap-1 mb-1">
                    <span className="text-muted-foreground text-xs">{formatTime(log.timestamp)}</span>
                    <span className={`text-xs uppercase ${getLevelColor(log.level)}`}>
                      {log.level}
                    </span>
                    <Badge variant="outline" className="bg-cyan-500/20 text-cyan-300 h-4 text-xs px-1">
                      {log.source}
                    </Badge>
                  </div>
                  <div className="text-foreground text-xs leading-tight break-words">{log.message}</div>
                  {log.context && (
                    <div className="text-muted-foreground text-xs mt-1">{log.context}</div>
                  )}
                </div>
              ))}
              {filteredNetflixLogs.length === 0 && (
                <div className="text-center text-muted-foreground py-4 text-xs">
                  {isRecording ? 'Recording... waiting for Netflix activity' : 'Start recording to capture Netflix debug logs'}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Live Generation View */}
        {activeTab === 'live-gen' && (
          <div className="flex-1 flex flex-col min-h-0">
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-1">
                <Badge variant="secondary" className="h-4 text-xs px-1">
                  Live Gen Logs ({logs.filter(log => log.category === 'story').length})
                </Badge>
              </div>
            </div>

            <div className="flex-1 overflow-auto space-y-1 text-xs font-mono">
              {logs.filter(log => log.category === 'story').map((log) => (
                <div key={log.id} className="border-b border-muted/30 pb-1 last:border-b-0">
                  <div className="flex items-center gap-1 mb-1">
                    <span className="text-muted-foreground text-xs">{formatTime(log.timestamp)}</span>
                    <span className={`text-xs uppercase ${getLevelColor(log.level)}`}>
                      {log.level}
                    </span>
                    <Badge className="bg-green-500/20 text-green-300 h-4 text-xs px-1">STORY</Badge>
                  </div>
                  <div className="text-foreground text-xs leading-tight break-words">{log.message}</div>
                  {log.data && (
                    <pre className="text-muted-foreground mt-1 text-xs bg-muted/20 p-1 rounded overflow-x-auto whitespace-pre-wrap">
                      {typeof log.data === 'string' ? log.data : JSON.stringify(log.data, null, 2)}
                    </pre>
                  )}
                </div>
              ))}
              {logs.filter(log => log.category === 'story').length === 0 && (
                <div className="text-center text-muted-foreground py-4 text-xs">
                  No live generation logs yet
                </div>
              )}
            </div>
          </div>
        )}

        {/* Image Generation View */}
        {activeTab === 'image-gen' && (
          <div className="flex-1 flex flex-col min-h-0">
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-1 flex-wrap">
                <Badge variant="secondary" className="h-4 text-xs px-1">
                  Image Logs ({logs.filter(log => log.category === 'image').length})
                </Badge>
                
                <Badge className="bg-green-500/20 text-green-300 h-4 text-xs px-1">
                  Gen: {logs.filter(log => log.message.includes('generate') || log.message.includes('creating')).length}
                </Badge>
                <Badge className="bg-blue-500/20 text-blue-300 h-4 text-xs px-1">
                  Cache: {logs.filter(log => log.message.includes('cache')).length}
                </Badge>
                <Badge className="bg-yellow-500/20 text-yellow-300 h-4 text-xs px-1">
                  Fallback: {logs.filter(log => log.message.includes('fallback')).length}
                </Badge>
              </div>
            </div>

            <div className="flex-1 overflow-auto space-y-1 text-xs font-mono">
              {logs.filter(log => log.category === 'image').map((log) => (
                <div key={log.id} className="border-b border-muted/30 pb-1 last:border-b-0">
                  <div className="flex items-center gap-1 mb-1">
                    <span className="text-muted-foreground text-xs">{formatTime(log.timestamp)}</span>
                    <span className={`text-xs uppercase ${getLevelColor(log.level)}`}>
                      {log.level}
                    </span>
                    {log.message.includes('caching') && (
                      <Badge className="bg-orange-500/20 text-orange-300 h-4 text-xs px-1">CACHE</Badge>
                    )}
                    {log.message.includes('generate') && (
                      <Badge className="bg-purple-500/20 text-purple-300 h-4 text-xs px-1">GEN</Badge>
                    )}
                    {log.message.includes('fallback') && (
                      <Badge className="bg-red-500/20 text-red-300 h-4 text-xs px-1">FALLBACK</Badge>
                    )}
                  </div>
                  <div className="text-foreground text-xs leading-tight break-words">{log.message}</div>
                  {log.data && (
                    <pre className="text-muted-foreground mt-1 text-xs bg-muted/20 p-1 rounded overflow-x-auto whitespace-pre-wrap">
                      {typeof log.data === 'string' ? log.data : JSON.stringify(log.data, null, 2)}
                    </pre>
                  )}
                </div>
              ))}
              {logs.filter(log => log.category === 'image').length === 0 && (
                <div className="text-center text-muted-foreground py-4 text-xs">
                  No image generation logs yet
                </div>
              )}

              <BackendTierChecker 
                onTierFound={(tier, details) => {
                  if (DebugLogger.isDebugEnabled()) {
                    DebugLogger.log('ui', 'Tier found in debug monitor', { tier, details });
                  }
                }} 
              />
            </div>
          </div>
        )}

        {/* Image Analysis View */}
        {activeTab === 'image-analysis' && (
          <div className="flex-1 flex flex-col min-h-0 p-2">
            <div className="text-xs text-muted-foreground mb-2">
              Live Session Analysis - Auto-detecting current session
            </div>
            {(() => {
              const currentSession = typeof window !== 'undefined' ? 
                sessionStorage.getItem('current_stable_session_id') || 
                sessionStorage.getItem('sessionId') : null;
              
              if (currentSession) {
                return (
                  <div className="space-y-2">
                    <div className="bg-blue-500/10 border border-blue-500/20 rounded p-2">
                      <div className="text-xs font-medium">Current Session:</div>
                      <div className="text-xs text-muted-foreground break-all">{currentSession}</div>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Use the Debug Data tab to analyze this session's image generation pipeline.
                    </div>
                  </div>
                );
              } else {
                return (
                  <div className="text-xs text-muted-foreground">
                    No active session detected. Start a story to enable live session analysis.
                  </div>
                );
              }
            })()}
          </div>
        )}

        {/* Audio Test View - Integrated functionality */}
        {activeTab === 'audio-test' && (
          <div className="flex-1 flex flex-col min-h-0 space-y-4 p-2">
            <div className="text-sm font-semibold flex items-center gap-2">
              <TestTube className="w-4 h-4" />
              Integrated Audio Testing
            </div>
            
            {/* TTS Status Display (from TTSDebugOverlay) */}
            <div className="bg-muted/50 rounded p-2 text-xs">
              <div className="font-medium mb-1">TTS Debug Status:</div>
              <div className="space-y-1">
                <div>playing: {String(ttsStatus.isPlaying)}</div>
                <div>word: {ttsStatus.currentWordIndex} / {ttsStatus.totalWords}</div>
                <div>hash(audio): {ttsStatus.contentHash ? String(ttsStatus.contentHash).slice(0, 10) : '-'}</div>
                <div>hash(ui): {typeof window !== 'undefined' && (window as any).__pageContentHash ? String((window as any).__pageContentHash).slice(0,10) : '-'}</div>
                <div>mismatch: {typeof window !== 'undefined' && ttsStatus.contentHash && (window as any).__pageContentHash && ttsStatus.contentHash !== (window as any).__pageContentHash ? 'YES' : 'no'}</div>
              </div>
            </div>

            {/* Charlotte Voice Testing */}
            <div className="space-y-2">
              <h4 className="font-semibold text-sm">Charlotte Voice (TTS)</h4>
              <div className="flex gap-2">
                <Input
                  value={testText}
                  onChange={(e) => setTestText(e.target.value)}
                  placeholder="Enter text for Charlotte to speak..."
                  className="flex-1 text-xs h-6"
                />
                <Button 
                  onClick={testCharlotteVoice} 
                  disabled={audioLoading || isAudioPlaying}
                  size="sm"
                  className="flex items-center gap-1 h-6 px-2 text-xs"
                >
                  {audioLoading && lastTest === 'Charlotte TTS' ? (
                    <Loader2 className="w-3 h-3 animate-spin" />
                  ) : (
                    <Volume2 className="w-3 h-3" />
                  )}
                  Test
                </Button>
              </div>
            </div>

            {/* Interactive Word Testing */}
            <div className="space-y-2">
              <h4 className="font-semibold text-sm">Interactive Word Audio</h4>
              <div className="flex gap-2">
                <Input
                  value={testWord}
                  onChange={(e) => setTestWord(e.target.value)}
                  placeholder="Enter word to hear pronunciation..."
                  className="flex-1 text-xs h-6"
                />
                <Button 
                  onClick={testInteractiveWord} 
                  disabled={audioLoading || isAudioPlaying}
                  size="sm"
                  className="flex items-center gap-1 h-6 px-2 text-xs"
                >
                  {audioLoading && lastTest === 'Interactive Word' ? (
                    <Loader2 className="w-3 h-3 animate-spin" />
                  ) : (
                    <Play className="w-3 h-3" />
                  )}
                  Hear
                </Button>
              </div>
            </div>

            {/* Audio Coordination Testing */}
            <div className="space-y-2">
              <h4 className="font-semibold text-sm">Audio System Coordination</h4>
              <div className="flex gap-2">
                <Button 
                  onClick={testAudioCoordination}
                  disabled={audioLoading}
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-1 h-6 px-2 text-xs"
                >
                  {audioLoading && lastTest === 'Audio Coordination' ? (
                    <Loader2 className="w-3 h-3 animate-spin" />
                  ) : (
                    <TestTube className="w-3 h-3" />
                  )}
                  Test Events
                </Button>
                <Button 
                  onClick={stopAllAudio}
                  variant="destructive"
                  size="sm"
                  className="flex items-center gap-1 h-6 px-2 text-xs"
                >
                  <Square className="w-3 h-3" />
                  Stop All
                </Button>
              </div>
            </div>

            {/* Status Display */}
            {(audioLoading || isAudioPlaying) && (
              <div className="p-2 bg-blue-500/10 border border-blue-500/20 rounded text-xs">
                <div className="flex items-center gap-2">
                  <Loader2 className="w-3 h-3 animate-spin" />
                  <span>
                    {audioLoading ? `Testing ${lastTest}...` : 'Playing audio...'}
                  </span>
                </div>
              </div>
            )}

            {/* Service Availability Check */}
            <div className="p-2 bg-muted/50 rounded text-xs">
              <div className="font-medium mb-1">Charlotte-Centric Audio Services:</div>
              <div className="space-y-1">
                <div>
                  CharlotteVoiceService: {typeof window !== 'undefined' && (window as any).__CharlotteVoiceService ? '✅ Available (Primary Unified)' : '❌ Not Found'}
                </div>
                <div>
                  SmartElevenLabsTTS: {typeof window !== 'undefined' && (window as any).SmartElevenLabsTTS ? '✅ Available (Fallback)' : '❌ Not Found'}
                </div>
                <div>
                  Event System: {typeof window !== 'undefined' && window.dispatchEvent ? '✅ Available' : '❌ Not Found'}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* System Validation View */}
        {activeTab === 'system-validation' && (
          <div className="flex-1 flex flex-col min-h-0 space-y-4 p-2">
            <div className="text-sm font-semibold flex items-center gap-2">
              <TestTube className="w-4 h-4" />
              System Validation
            </div>

            {/* Quick Actions */}
            <div className="flex gap-2">
              <Button 
                onClick={runSystemValidation}
                disabled={isValidating}
                size="sm"
                className="flex items-center gap-1 h-6 px-2 text-xs"
              >
                {isValidating ? (
                  <Loader2 className="w-3 h-3 animate-spin" />
                ) : (
                  <TestTube className="w-3 h-3" />
                )}
                Full System Scan
              </Button>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="h-6 px-2 text-xs" disabled={isValidating}>
                    Component Tests <ChevronDown className="h-3 w-3 ml-1" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="z-[10000]">
                  <DropdownMenuItem onSelect={() => validateComponent('audio')}>Audio System</DropdownMenuItem>
                  <DropdownMenuItem onSelect={() => validateComponent('network')}>Network Health</DropdownMenuItem>
                  <DropdownMenuItem onSelect={() => validateComponent('cache')}>Cache & Storage</DropdownMenuItem>
                  <DropdownMenuItem onSelect={() => validateComponent('ui')}>UI & Accessibility</DropdownMenuItem>
                  <DropdownMenuItem onSelect={() => validateComponent('performance')}>Performance</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* System Status Overview */}
            {systemValidationReport && (
              <div className="space-y-3">
                {/* Overall Status */}
                <div className={`p-3 rounded border ${
                  systemValidationReport.overall.status === 'healthy' 
                    ? 'bg-green-500/10 border-green-500/20 text-green-300' 
                    : systemValidationReport.overall.status === 'error'
                    ? 'bg-red-500/10 border-red-500/20 text-red-300'
                    : 'bg-yellow-500/10 border-yellow-500/20 text-yellow-300'
                }`}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="font-semibold text-sm">
                      System Status: {systemValidationReport.overall.status.toUpperCase()}
                    </div>
                    <Badge variant="outline" className="text-xs">
                      Score: {systemValidationReport.overall.score}/100
                    </Badge>
                  </div>
                  <div className="text-xs opacity-75">
                    Last checked: {new Date(systemValidationReport.overall.timestamp).toLocaleTimeString()}
                  </div>
                </div>

                {/* Category Results */}
                <div className="space-y-2">
                  <div className="font-medium text-sm">Component Status</div>
                  {Object.entries(systemValidationReport.categories).map(([category, result]) => {
                    const validationResult = result as ValidationResult;
                    return (
                      <div key={category} className="border border-muted rounded p-2">
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center gap-2">
                            <Badge className={`h-4 text-xs px-1 ${
                              validationResult.isValid 
                                ? 'bg-green-500/20 text-green-300' 
                                : 'bg-red-500/20 text-red-300'
                            }`}>
                              {category.toUpperCase()}
                            </Badge>
                            <span className="text-xs font-medium">
                              {validationResult.isValid ? '✅ Valid' : '❌ Issues Found'}
                            </span>
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {validationResult.issues.length + validationResult.warnings.length} items
                          </div>
                        </div>
                        
                        {/* Issues */}
                        {validationResult.issues.length > 0 && (
                          <div className="space-y-1">
                            <div className="text-xs font-medium text-red-300">Issues:</div>
                            {validationResult.issues.map((issue, idx) => (
                              <div key={idx} className="text-xs text-red-300 bg-red-500/10 p-1 rounded">
                                • {issue}
                              </div>
                            ))}
                          </div>
                        )}
                        
                        {/* Warnings */}
                        {validationResult.warnings.length > 0 && (
                          <div className="space-y-1 mt-2">
                            <div className="text-xs font-medium text-yellow-300">Warnings:</div>
                            {validationResult.warnings.map((warning, idx) => (
                              <div key={idx} className="text-xs text-yellow-300 bg-yellow-500/10 p-1 rounded">
                                • {warning}
                              </div>
                            ))}
                          </div>
                        )}
                        
                        {/* Recommendations */}
                        {validationResult.recommendations.length > 0 && (
                          <div className="space-y-1 mt-2">
                            <div className="text-xs font-medium text-blue-300">Recommendations:</div>
                            {validationResult.recommendations.map((rec, idx) => (
                              <div key={idx} className="text-xs text-blue-300 bg-blue-500/10 p-1 rounded">
                                • {rec}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* System Recommendations */}
                {systemValidationReport.recommendations.length > 0 && (
                  <div className="space-y-2">
                    <div className="font-medium text-sm">System Recommendations</div>
                    <div className="space-y-1">
                      {systemValidationReport.recommendations.map((rec, idx) => (
                        <div key={idx} className="text-xs bg-blue-500/10 border border-blue-500/20 p-2 rounded">
                          • {rec}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Initial State */}
            {!systemValidationReport && !isValidating && (
              <div className="text-center text-muted-foreground py-8 text-xs">
                <TestTube className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p>Run system validation to check application health</p>
                <p className="mt-1 opacity-75">This will test audio, network, cache, UI, and performance systems</p>
              </div>
            )}

            {/* Loading State */}
            {isValidating && !systemValidationReport && (
              <div className="text-center text-muted-foreground py-8 text-xs">
                <Loader2 className="w-8 h-8 mx-auto mb-2 animate-spin" />
                <p>Running comprehensive system validation...</p>
                <p className="mt-1 opacity-75">This may take a few seconds</p>
              </div>
            )}
          </div>
        )}

        {/* Debug Data View */}
        {activeTab === 'debug-data' && (
          <div className="flex-1 flex flex-col min-h-0">
            <DebugDataViewer />
          </div>
        )}

        {/* System Events View */}
        {activeTab === 'system-events' && (
          <div className="flex-1 flex flex-col min-h-0">
            {/* Search and Filter */}
            <div className="flex gap-1 mb-1">
              <div className="relative flex-1">
                <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-3 w-3 text-muted-foreground" />
                <Input
                  placeholder="Search system events..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="h-6 text-xs pl-6 pr-2"
                />
              </div>
            </div>

            {/* System Events Description */}
            <div className="mb-2 p-2 bg-muted/50 rounded text-xs">
              <div className="font-medium mb-1">System Events - Internal Operations</div>
              <div className="text-xs opacity-75">
                Timer creation/clearing and cache operations are logged here without console output to reduce noise.
              </div>
            </div>

            {/* System Events Logs */}
            <div className="flex-1 overflow-y-auto bg-black/20 rounded text-xs font-mono">
              {filteredLogs.filter(log => 
                (log.message.includes('timeout') || log.message.includes('interval') || 
                 log.message.includes('timer') || log.message.includes('cached') || 
                 log.message.includes('Retrieved cached'))
              ).length === 0 ? (
                <div className="p-2 text-center text-muted-foreground">No system events captured yet</div>
              ) : (
                <div className="p-2 space-y-1">
                  {filteredLogs.filter(log => 
                    (log.message.includes('timeout') || log.message.includes('interval') || 
                     log.message.includes('timer') || log.message.includes('cached') || 
                     log.message.includes('Retrieved cached'))
                  ).map((log) => (
                    <div key={log.id} className="flex gap-2 text-xs">
                      <Badge className={`text-xs px-1 py-0 h-4 ${getCategoryColor(log.category)} flex-shrink-0`}>
                        {log.category}
                      </Badge>
                      <span className="text-muted-foreground font-mono text-xs flex-shrink-0">
                        {formatTime(log.timestamp)}
                      </span>
                      <span className={`${getLevelColor(log.level)} flex-1 break-all`}>
                        {log.message}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* System Events Stats */}
            <div className="mt-2 p-2 bg-muted/50 rounded text-xs">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <span className="font-medium">Timer Events:</span>{' '}
                  {filteredLogs.filter(log => log.message.includes('timeout') || log.message.includes('interval') || log.message.includes('timer')).length}
                </div>
                <div>
                  <span className="font-medium">Cache Events:</span>{' '}
                  {filteredLogs.filter(log => log.message.includes('cached') || log.message.includes('Retrieved cached')).length}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Audio Test Tab Component with TTS debugging integrated
const AudioTestTab: React.FC = () => {
  const [word, setWord] = useState('illuminating');
  const [syllables, setSyllables] = useState<string[]>([]);
  const [source, setSource] = useState<'override' | 'heuristic' | null>(null);
  const [pronunciations, setPronunciations] = useState<string[] | null>(null);

  const handleAnalyze = async () => {
    const cleanWord = word.toLowerCase().replace(/[^a-z]/g, '');
    const chunks = phonicsMiniDict[cleanWord] || [word];
    setSyllables(chunks);
    setSource('override'); // All entries are now curated overrides
    setPronunciations(chunks);
  };

  const handlePlay = async () => {
    // Get syllables and play them using Charlotte
    const syllableText = syllables.join(' - ');
    await charlotteVoiceService.charlotteInteractiveAudio({
      text: syllableText,
      context: 'conversation'
    });
  };

  const samples = ['what', 'green', 'chase', 'good', 'bounce', 'smiles', 'illuminate', 'illumination', 'illuminating'];

  return (
    <div className="flex-1 flex flex-col min-h-0 p-2 space-y-3">
      {/* TTS & Syllable Debug Section */}
      <div className="space-y-2">
        <div className="bg-blue-500/10 border border-blue-500/20 rounded p-2">
          <div className="text-xs font-medium mb-1">TTS & Syllable Debug</div>
          <div className="text-xs text-muted-foreground">
            Test syllable splits and phonetic playback for pronunciation accuracy
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex gap-2">
            <Input 
              value={word} 
              onChange={(e) => setWord(e.target.value)} 
              placeholder="Enter a word"
              className="text-xs h-6"
            />
            <Button onClick={handleAnalyze} size="sm" className="h-6 px-2 text-xs">
              Analyze
            </Button>
            <Button variant="secondary" onClick={handlePlay} size="sm" className="h-6 px-2 text-xs">
              Play Syllables
            </Button>
          </div>

          {syllables.length > 0 && (
            <div className="rounded border p-2 bg-muted/20">
              <div className="mb-1 text-xs font-medium">Syllables</div>
              <div className="flex flex-wrap gap-1 mb-2">
                {syllables.map((s, i) => (
                  <Badge key={i} variant="outline" className="text-xs px-1 py-0.5">{s}</Badge>
                ))}
              </div>
              <div className="text-xs text-muted-foreground mb-1">
                <span className="mr-2">Source:</span>
                <Badge variant="secondary" className="text-xs px-1">
                  {source === 'override' ? 'Override (mini-dict)' : 'Heuristic'}
                </Badge>
              </div>
              {pronunciations && (
                <div className="text-xs">
                  <div className="mb-1 font-medium">Speech-friendly:</div>
                  <div className="flex flex-wrap gap-1">
                    {pronunciations.map((p, idx) => (
                      <Badge key={idx} className="bg-muted text-muted-foreground text-xs px-1 py-0.5">{p}</Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="rounded border p-2 bg-muted/20">
            <div className="mb-1 text-xs font-medium">Sample Words</div>
            <div className="flex flex-wrap gap-1">
              {samples.map((s) => (
                <Button key={s} size="sm" variant="outline" onClick={() => setWord(s)} className="h-5 px-2 text-xs">
                  {s}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UnifiedDebugMonitor;