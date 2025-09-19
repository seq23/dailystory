import React, { useState, useEffect } from 'react';
import { DebugLogger, DebugLogEntry, DebugCategory } from '@/services/DebugLogger';
import { performanceManager } from '@/services/PerformanceManager';
import { productionHardening } from '@/services/ProductionHardening';
import { NetflixRetryService } from '@/services/NetflixRetryService';
import { NetworkDebugger, NetworkRequest } from '@/services/NetworkDebugger';
import { DebugGateway } from '@/services/DebugGateway';
import { DebugDataViewer } from '@/components/DebugDataViewer';
import { BackendTierChecker } from '@/components/BackendTierChecker';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { X, Download, Trash2, Search, Play, Square, RotateCcw, MoreHorizontal, ChevronDown } from 'lucide-react';

interface NetflixDebugLog {
  timestamp: number;
  level: 'info' | 'warn' | 'error';
  message: string;
  context?: string;
  source: string;
}

// Enhanced Unified Debug Monitor - Combines Netflix monitoring with general debug system
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
    
    // Check immediately and every 5 seconds
    detectCurrentSession();
    const interval = setInterval(detectCurrentSession, 5000);
    
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
          
          // Capture debug-related messages
          if (message.includes('Netflix') || message.includes('netflix') || 
              message.includes('circuit') || message.includes('retry') ||
              message.includes('🎬') || message.includes('🔄') || message.includes('❌') ||
              message.includes('Failed to fetch') || message.includes('TypeError: Failed to fetch') ||
              message.includes('504') || message.includes('api.zilliqa.com')) {
            
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
        console.warn('Failed to get circuit breaker status:', error);
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

  const resetCircuitBreakers = () => {
    try {
      NetflixRetryService.resetAllCircuitBreakers();
      DebugLogger.log('performance', 'All circuit breakers reset');
    } catch (error) {
      DebugLogger.error('performance', 'Failed to reset circuit breakers', error);
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

        {/* Audio Test View */}
        {activeTab === 'audio-test' && (
          <div className="flex-1 flex flex-col min-h-0 p-2">
            <div className="text-xs text-muted-foreground mb-2">
              Audio & TTS Testing - Charlotte Voice & Interactive Words
            </div>
            <div className="space-y-2">
              <div className="bg-purple-500/10 border border-purple-500/20 rounded p-2">
                <div className="text-xs font-medium mb-1">Audio Playback Tester</div>
                <div className="text-xs text-muted-foreground">
                  Test Charlotte voice, interactive words, and loading states separately from Voice Catalog System
                </div>
              </div>
              <div className="text-xs text-muted-foreground">
                AudioPlaybackTester component will be implemented for dedicated audio debugging.
              </div>
            </div>
          </div>
        )}

        {/* Debug Data View */}
        {activeTab === 'debug-data' && (
          <div className="flex-1 flex flex-col min-h-0">
            <DebugDataViewer />
          </div>
        )}
      </div>
    </div>
  );
};

export default UnifiedDebugMonitor;