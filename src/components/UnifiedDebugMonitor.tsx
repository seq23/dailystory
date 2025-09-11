import React, { useState, useEffect } from 'react';
import { DebugLogger, DebugLogEntry, DebugCategory } from '@/services/DebugLogger';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { X, Download, Trash2, Search } from 'lucide-react';

// Unified Debug Monitor - Consolidates all debug modes into single ?debug=1 interface
export const UnifiedDebugMonitor: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [logs, setLogs] = useState<DebugLogEntry[]>([]);
  const [activeTab, setActiveTab] = useState('console');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<DebugCategory | 'all'>('all');

  useEffect(() => {
    // Only show if debug mode is enabled
    if (!DebugLogger.isDebugEnabled()) return;

    // Subscribe to log updates
    const unsubscribe = DebugLogger.subscribe((newLogs) => {
      setLogs(newLogs);
    });

    // Initialize with existing logs
    setLogs(DebugLogger.getLogs());

    return unsubscribe;
  }, []);

  const filteredLogs = logs.filter(log => {
    const matchesSearch = log.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         log.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || log.category === selectedCategory;
    return matchesSearch && matchesCategory;
  }).slice(-100); // Show last 100 logs

  const getLogCount = (category: DebugCategory) => {
    return logs.filter(log => log.category === category).length;
  };

  const exportLogs = () => {
    const data = {
      timestamp: new Date().toISOString(),
      logs: logs,
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

  if (!DebugLogger.isDebugEnabled() || !isVisible) {
    return DebugLogger.isDebugEnabled() ? (
      <button
        onClick={() => setIsVisible(true)}
        className="fixed bottom-4 right-4 z-[9999] bg-background/90 border border-muted rounded-lg px-3 py-2 text-xs font-medium shadow-lg hover:bg-accent"
      >
        🐛 Debug Monitor ({logs.length})
      </button>
    ) : null;
  }

  return (
    <div className="fixed inset-4 z-[9999] bg-background/95 backdrop-blur-sm border border-muted rounded-lg shadow-2xl flex flex-col max-h-[80vh]">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-muted">
        <h2 className="text-lg font-semibold">🐛 Debug Monitor</h2>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={exportLogs}
            className="h-8"
          >
            <Download className="h-4 w-4 mr-1" />
            Export
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => DebugLogger.clearLogs()}
            className="h-8"
          >
            <Trash2 className="h-4 w-4 mr-1" />
            Clear
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsVisible(false)}
            className="h-8 w-8 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
        <TabsList className="grid w-full grid-cols-3 m-4 mb-2">
          <TabsTrigger value="console">
            Console ({logs.length})
          </TabsTrigger>
          <TabsTrigger value="categories">
            Categories
          </TabsTrigger>
          <TabsTrigger value="performance">
            Performance
          </TabsTrigger>
        </TabsList>

        <TabsContent value="console" className="flex-1 flex flex-col px-4 pb-4">
          {/* Search and Filter */}
          <div className="flex gap-2 mb-3">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search logs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8 h-8"
              />
            </div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value as DebugCategory | 'all')}
              className="h-8 px-2 rounded border border-input bg-background text-sm"
            >
              <option value="all">All Categories</option>
              <option value="auth">Auth</option>
              <option value="story">Story</option>
              <option value="audio">Audio</option>
              <option value="image">Image</option>
              <option value="performance">Performance</option>
              <option value="network">Network</option>
              <option value="ui">UI</option>
              <option value="error">Error</option>
            </select>
          </div>

          {/* Log List */}
          <ScrollArea className="flex-1 border border-muted rounded-md">
            <div className="p-2 space-y-1">
              {filteredLogs.map((log) => (
                <div key={log.id} className="text-xs font-mono border-b border-muted/50 pb-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-muted-foreground">{formatTime(log.timestamp)}</span>
                    <Badge variant="outline" className={`h-5 text-xs ${getCategoryColor(log.category)}`}>
                      {log.category}
                    </Badge>
                    <span className={getLevelColor(log.level)}>{log.level.toUpperCase()}</span>
                  </div>
                  <div className="text-foreground">{log.message}</div>
                  {log.data && (
                    <pre className="text-muted-foreground mt-1 text-xs bg-muted/30 p-1 rounded overflow-x-auto">
                      {typeof log.data === 'string' ? log.data : JSON.stringify(log.data, null, 2)}
                    </pre>
                  )}
                </div>
              ))}
              {filteredLogs.length === 0 && (
                <div className="text-center text-muted-foreground py-8">
                  No logs match your search criteria
                </div>
              )}
            </div>
          </ScrollArea>
        </TabsContent>

        <TabsContent value="categories" className="flex-1 px-4 pb-4">
          <div className="grid grid-cols-2 gap-3">
            {(['auth', 'story', 'audio', 'image', 'performance', 'network', 'ui', 'error'] as DebugCategory[]).map((category) => (
              <div key={category} className="border border-muted rounded-lg p-3">
                <div className="flex items-center justify-between">
                  <Badge className={getCategoryColor(category)}>
                    {category}
                  </Badge>
                  <span className="text-sm font-medium">{getLogCount(category)} logs</span>
                </div>
              </div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="performance" className="flex-1 px-4 pb-4">
          <div className="space-y-3">
            {(performance as any).memory && (
              <div className="border border-muted rounded-lg p-3">
                <h3 className="font-medium mb-2">Memory Usage</h3>
                <div className="text-sm space-y-1">
                  <div>Used: {Math.round(((performance as any).memory.usedJSHeapSize / 1024 / 1024))} MB</div>
                  <div>Total: {Math.round(((performance as any).memory.totalJSHeapSize / 1024 / 1024))} MB</div>
                  <div>Limit: {Math.round(((performance as any).memory.jsHeapSizeLimit / 1024 / 1024))} MB</div>
                </div>
              </div>
            )}
            <div className="border border-muted rounded-lg p-3">
              <h3 className="font-medium mb-2">Debug Stats</h3>
              <div className="text-sm space-y-1">
                <div>Total Logs: {logs.length}</div>
                <div>Session Start: {logs.length > 0 ? formatTime(logs[0].timestamp) : 'N/A'}</div>
                <div>Debug Mode: {DebugLogger.isDebugEnabled() ? 'Enabled' : 'Disabled'}</div>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default UnifiedDebugMonitor;