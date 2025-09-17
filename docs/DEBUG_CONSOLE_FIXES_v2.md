# Debug Console Recovery & Enhancement Guide v2

**SYSTEM RECOVERY**: This document details the debug console improvements implemented during September 17, 2025 system recovery, focusing on real-time monitoring and log capture functionality.

## 🖥️ DEBUG CONSOLE ARCHITECTURE

### UnifiedDebugMonitor Components
The debug console provides comprehensive system monitoring through 5 specialized tabs:

1. **Console Tab** - General application logs with category filtering
2. **Network Tab** - Edge function requests and API calls
3. **Netflix Tab** - Live console capture during active recording
4. **Image Generation Tab** - Specialized image generation activity monitoring
5. **Debug Data Tab** - Raw debug data viewer integration

### Access Methods
- **URL Parameter**: Add `?debug=1` to any application URL
- **Floating Button**: Click "Debug Monitor" button (bottom-right when debug mode active)
- **Automatic Detection**: Console automatically detects debug mode environment

## LOG CAPTURE SYSTEM (ENHANCED)

### Real-Time Console Interception
```typescript
// Enhanced console capture with batch updates
const flushLogs = () => {
  if (pendingLogs.length > 0) {
    setNetflixLogs(prev => [...prev.slice(-(100 - pendingLogs.length)), ...pendingLogs]);
    pendingLogs.length = 0;
  }
};

// Smart filtering for relevant messages
if (message.includes('Netflix') || message.includes('netflix') || 
    message.includes('circuit') || message.includes('retry') ||
    message.includes('🎬') || message.includes('🔄') || message.includes('❌') ||
    message.includes('Failed to fetch') || message.includes('TypeError: Failed to fetch') ||
    message.includes('504') || message.includes('api.zilliqa.com')) {
  // Capture and batch update
}
```

### Network Request Monitoring
```typescript
const updateNetworkRequests = () => {
  const requests = NetworkDebugger.getRequests(50); // Last 50 requests
  setNetworkRequests(requests);
};

// Edge function call detection
req.type === 'edge-function' ? 'bg-purple-500/20 text-purple-300' : 
req.type === 'supabase' ? 'bg-blue-500/20 text-blue-300' : 
'bg-gray-500/20 text-gray-300'
```

## CONSOLE TAB IMPROVEMENTS

### Enhanced Log Filtering
```typescript
const filteredLogs = logs.filter(log => {
  const matchesSearch = log.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
                       log.category.toLowerCase().includes(searchTerm.toLowerCase());
  const matchesCategory = selectedCategory === 'all' || log.category === selectedCategory;
  return matchesSearch && matchesCategory;
}).slice(-100);
```

### Category-Based Organization
- **Auth**: Authentication and user session management
- **Story**: Story generation and content management  
- **Audio**: Audio playback and generation systems
- **Image**: Image generation pipeline and tier management
- **Performance**: System performance and memory usage
- **Network**: API calls and network request monitoring
- **UI**: User interface and component lifecycle
- **Error**: Error handling and exception tracking

### Real-Time Display Features
```typescript
// Timestamp formatting for precise timing
const formatTime = (timestamp: number) => {
  return new Date(timestamp).toLocaleTimeString('en-US', { 
    hour12: false, 
    hour: '2-digit', 
    minute: '2-digit', 
    second: '2-digit'
  }) + '.' + String(timestamp % 1000).padStart(3, '0');
};

// Color-coded severity levels
const getLevelColor = (level: string) => {
  switch (level) {
    case 'error': return 'text-red-400';
    case 'warn': return 'text-yellow-400';
    default: return 'text-foreground';
  }
};
```

## NETWORK TAB ENHANCEMENTS

### Edge Function Call Tracking
```typescript
// Enhanced request categorization
<Badge className={`h-5 text-xs ${
  req.type === 'edge-function' ? 'bg-purple-500/20 text-purple-300' : 
  req.type === 'supabase' ? 'bg-blue-500/20 text-blue-300' : 
  'bg-gray-500/20 text-gray-300'
}`}>
  {req.type}
</Badge>

// Status code color coding
<span className={`text-xs ${
  req.status >= 400 ? 'text-red-400' : 
  'text-green-400'
}`}>
  {req.status}
</span>
```

### Failed Request Analysis
```typescript
// Automatic failure tracking
Failed: {NetworkDebugger.getFailedRequests().length}

// Error display with context
{req.error && (
  <div className="text-red-400 mt-2 text-xs bg-red-500/10 p-2 rounded">
    {req.error}
  </div>
)}
```

## NETFLIX TAB RECORDING SYSTEM

### Intelligent Message Filtering
The Netflix tab captures system-specific debug messages during active recording:

```typescript
// Smart pattern matching for relevant messages
const isRelevantMessage = (message: string) => {
  return message.includes('Netflix') || message.includes('netflix') || 
         message.includes('circuit') || message.includes('retry') ||
         message.includes('🎬') || message.includes('🔄') || message.includes('❌') ||
         message.includes('Failed to fetch') || message.includes('TypeError: Failed to fetch') ||
         message.includes('504') || message.includes('api.zilliqa.com');
};
```

### Recording Controls
- **Start Recording**: Begin capturing console messages
- **Stop Recording**: Pause message capture
- **Clear Logs**: Remove all captured messages
- **Export**: Download complete log data as JSON

## IMAGE GENERATION TAB SPECIALIZATION

### Generation Activity Tracking
```typescript
// Image-specific log filtering
{logs.filter(log => log.category === 'image').slice(-20).map((log) => (
  // Enhanced badge system for image operations
  {log.message.includes('cached') && (
    <Badge variant="outline" className="bg-blue-500/20 text-blue-300 h-4 text-xs">CACHE</Badge>
  )}
  {log.message.includes('generation') && (
    <Badge variant="outline" className="bg-purple-500/20 text-purple-300 h-4 text-xs">GEN</Badge>
  )}
  {log.message.includes('fallback') && (
    <Badge variant="outline" className="bg-orange-500/20 text-orange-300 h-4 text-xs">FALLBACK</Badge>
  )}
))}
```

### Performance Metrics Display
```typescript
// Image generation statistics
<div className="space-y-1 text-xs">
  <div>Total Image Logs: {logs.filter(log => log.category === 'image').length}</div>
  <div>Recent Generations: {logs.filter(log => log.category === 'image' && log.message.includes('Starting generation')).length}</div>
  <div>Cache Hits: {logs.filter(log => log.category === 'image' && log.message.includes('cached image')).length}</div>
  <div>Fallbacks Used: {logs.filter(log => log.category === 'image' && log.message.includes('fallback')).length}</div>
</div>
```

## PERFORMANCE OPTIMIZATIONS

### Memory Management
```typescript
// Batch log updates to prevent setState during render
const pendingLogs: NetflixDebugLog[] = [];
let flushTimer: NodeJS.Timeout;

const flushLogs = () => {
  if (pendingLogs.length > 0) {
    setNetflixLogs(prev => [...prev.slice(-(100 - pendingLogs.length)), ...pendingLogs]);
    pendingLogs.length = 0;
  }
};

// Use requestAnimationFrame for smooth updates
clearTimeout(flushTimer);
flushTimer = setTimeout(() => {
  requestAnimationFrame(flushLogs);
}, 16);
```

### Scroll Performance
```typescript
// Proper ScrollArea implementation for large log lists
<ScrollArea className="flex-1 border border-muted rounded-md bg-background/50 backdrop-blur-sm">
  <div className="p-3 space-y-2">
    {filteredLogs.map((log) => (
      // Log entry rendering with proper key management
    ))}
  </div>
</ScrollArea>
```

### Log Rotation
```typescript
// Automatic log limiting to prevent memory issues
const filteredLogs = logs.filter(/* filter criteria */).slice(-100);
const filteredNetflixLogs = netflixLogs.filter(/* filter criteria */).slice(-100);
```

## EXPORT & DATA ANALYSIS

### Complete System Export
```typescript
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
```

## TROUBLESHOOTING DEBUG CONSOLE ISSUES

### Console Not Appearing
1. **Check URL Parameter**: Ensure `?debug=1` is in the URL
2. **Environment Check**: Verify debug mode is enabled in build
3. **Browser Console**: Check for JavaScript errors preventing render
4. **Local Storage**: Clear browser cache if persistent issues

### Logs Not Capturing
1. **Recording Status**: Ensure recording is started for Netflix tab
2. **Filter Settings**: Check search terms and category filters
3. **Message Patterns**: Verify log messages match capture patterns
4. **Memory Limits**: Check if log rotation is clearing old entries

### Performance Issues
1. **Log Volume**: Reduce capture frequency or limit retained logs
2. **Memory Usage**: Export and clear logs periodically
3. **Browser Resources**: Close other tabs to free up memory
4. **Scroll Performance**: Use virtual scrolling for very large log lists

### Export Problems
1. **Browser Permissions**: Allow file downloads in browser settings
2. **Data Size**: Large exports may timeout - filter before export
3. **JSON Format**: Verify exported data is valid JSON structure
4. **File Access**: Check download folder permissions

## DEBUG CONSOLE USAGE GUIDELINES

### Development Workflow
1. **Enable Debug Mode**: Add `?debug=1` to URL during development
2. **Start Recording**: Begin Netflix tab recording before testing
3. **Monitor Activity**: Watch console and network tabs during operations
4. **Export Data**: Save logs before significant system changes
5. **Clear Logs**: Reset between test scenarios

### Production Debugging
1. **Temporary Access**: Enable debug mode only during investigation
2. **Focused Logging**: Use category filters to isolate specific issues
3. **Export Analysis**: Download logs for offline analysis
4. **Privacy Consideration**: Avoid logging sensitive user data

### Performance Monitoring
1. **Memory Tracking**: Monitor memory usage in performance tab
2. **Request Analysis**: Review network tab for API call patterns
3. **Error Tracking**: Focus on error category for issue identification
4. **Circuit Breaker**: Monitor circuit breaker status for service health

**Debug Console Status**: ✅ Fully operational with enhanced logging, filtering, and export capabilities optimized for system recovery and monitoring.