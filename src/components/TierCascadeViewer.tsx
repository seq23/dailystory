import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown, CheckCircle, XCircle, AlertTriangle, ArrowRight } from 'lucide-react';

interface TierCascadeEntry {
  userPrompt: string;
  systemPrompt: string;
  bundle: any;
  apiResponse: any;
  success: boolean;
  model: string;
  timestamp: number;
  pageNumber?: number;
}

interface TierCascadeViewerProps {
  tierData: TierCascadeEntry[];
  sessionId: string;
}

export function TierCascadeViewer({ tierData, sessionId }: TierCascadeViewerProps) {
  const [expandedEntries, setExpandedEntries] = React.useState<Set<number>>(new Set());

  const toggleExpanded = (index: number) => {
    const newExpanded = new Set(expandedEntries);
    if (newExpanded.has(index)) {
      newExpanded.delete(index);
    } else {
      newExpanded.add(index);
    }
    setExpandedEntries(newExpanded);
  };

  const parseTierData = (entry: TierCascadeEntry) => {
    try {
      const systemData = typeof entry.systemPrompt === 'string' 
        ? JSON.parse(entry.systemPrompt) 
        : entry.systemPrompt;
      
      return {
        tier: systemData.tier || 'unknown',
        status: systemData.status || 'unknown',
        requestId: systemData.requestId || 'unknown',
        context: systemData.context || {},
        tierAnalysis: systemData.tierAnalysis || {}
      };
    } catch (error) {
      return {
        tier: 'parsing-error',
        status: 'error',
        requestId: 'unknown',
        context: {},
        tierAnalysis: {}
      };
    }
  };

  const formatTimestamp = (timestamp: number) => {
    return new Date(timestamp).toLocaleString();
  };

  const getTierColor = (tier: string, status: string) => {
    if (status === 'success') return 'default';
    if (status === 'failure') return 'destructive';
    if (status === 'attempt') return 'secondary';
    return 'outline';
  };

  const getTierIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="w-4 h-4" />;
      case 'failure':
        return <XCircle className="w-4 h-4" />;
      case 'attempt':
        return <ArrowRight className="w-4 h-4" />;
      default:
        return <AlertTriangle className="w-4 h-4" />;
    }
  };

  // Group entries by page number
  const groupedByPage = tierData.reduce((acc, entry, index) => {
    const pageNumber = entry.pageNumber || 0;
    if (!acc[pageNumber]) acc[pageNumber] = [];
    acc[pageNumber].push({ ...entry, originalIndex: index });
    return acc;
  }, {} as Record<number, (TierCascadeEntry & { originalIndex: number })[]>);

  const pageNumbers = Object.keys(groupedByPage).sort((a, b) => Number(a) - Number(b));

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ArrowRight className="w-5 h-5" />
            Tier Cascade Analysis for {sessionId}
            <Badge variant="outline">{tierData.length} routing events</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            Shows the complete image generation tier routing: Tier 1 → Tier 2.5A → Tier 2.5C
          </p>
          
          {pageNumbers.map(pageNumber => (
            <Card key={pageNumber} className="mb-4">
              <CardHeader>
                <CardTitle className="text-lg">
                  Page {pageNumber}
                  <Badge variant="secondary" className="ml-2">
                    {groupedByPage[pageNumber].length} tier events
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {groupedByPage[pageNumber].map((entry, pageIndex) => {
                    const tierData = parseTierData(entry);
                    const isExpanded = expandedEntries.has(entry.originalIndex);
                    
                    return (
                      <Card key={entry.originalIndex} className="border-l-4 border-l-primary/20">
                        <CardHeader className="pb-2">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Badge 
                                variant={getTierColor(tierData.tier, tierData.status)}
                                className="flex items-center gap-1"
                              >
                                {getTierIcon(tierData.status)}
                                {tierData.tier} {tierData.status}
                              </Badge>
                              <Badge variant="outline" className="text-xs">
                                {formatTimestamp(entry.timestamp)}
                              </Badge>
                            </div>
                            <Collapsible>
                              <CollapsibleTrigger 
                                onClick={() => toggleExpanded(entry.originalIndex)}
                                className="flex items-center gap-1 text-sm hover:text-primary"
                              >
                                Details <ChevronDown className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                              </CollapsibleTrigger>
                            </Collapsible>
                          </div>
                        </CardHeader>
                        
                        <CardContent>
                          {/* Always show summary */}
                          <div className="text-sm space-y-1 mb-2">
                            {tierData.tierAnalysis.description && (
                              <div>
                                <span className="font-medium">Description: </span>
                                <span className="text-muted-foreground">{tierData.tierAnalysis.description}</span>
                              </div>
                            )}
                            
                            {tierData.status === 'failure' && tierData.context.error && (
                              <div>
                                <span className="font-medium text-destructive">Error: </span>
                                <span className="text-muted-foreground">{tierData.context.error}</span>
                              </div>
                            )}
                            
                            {tierData.status === 'failure' && tierData.context.escalationReason && (
                              <div>
                                <span className="font-medium">Escalation: </span>
                                <span className="text-muted-foreground">{tierData.context.escalationReason}</span>
                              </div>
                            )}
                            
                            {tierData.status === 'success' && tierData.context.templateType && (
                              <div>
                                <span className="font-medium text-green-600">Template: </span>
                                <span className="text-muted-foreground">{tierData.context.templateType}</span>
                              </div>
                            )}
                          </div>

                          {/* Template CD Warning */}
                          {tierData.tier === 'tier-2.5C' && tierData.status === 'success' && (
                            <div className="bg-yellow-50 border border-yellow-200 rounded p-2 mb-2">
                              <div className="flex items-start gap-2">
                                <AlertTriangle className="w-4 h-4 text-yellow-600 mt-0.5" />
                                <div className="text-sm">
                                  <div className="font-medium text-yellow-800">Template CD Used (Nuclear Independence)</div>
                                  <div className="text-yellow-700">
                                    This tier uses hardcoded templates which may cause issues like "two birds".
                                    Check why Tier 1 and 2.5A failed.
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}
                          
                          {isExpanded && (
                            <Collapsible open={isExpanded}>
                              <CollapsibleContent>
                                <Separator className="my-3" />
                                <div className="space-y-4">
                                  {/* Full Context */}
                                  <div>
                                    <h5 className="font-medium mb-2">Full Context</h5>
                                    <ScrollArea className="h-32 w-full rounded border p-2">
                                      <pre className="text-xs whitespace-pre-wrap">
                                        {JSON.stringify(tierData.context, null, 2)}
                                      </pre>
                                    </ScrollArea>
                                  </div>
                                  
                                  {/* Tier Analysis */}
                                  {tierData.tierAnalysis && Object.keys(tierData.tierAnalysis).length > 0 && (
                                    <div>
                                      <h5 className="font-medium mb-2">Tier Analysis</h5>
                                      <ScrollArea className="h-32 w-full rounded border p-2">
                                        <pre className="text-xs whitespace-pre-wrap">
                                          {JSON.stringify(tierData.tierAnalysis, null, 2)}
                                        </pre>
                                      </ScrollArea>
                                    </div>
                                  )}
                                  
                                  {/* API Response */}
                                  <div>
                                    <h5 className="font-medium mb-2">API Response</h5>
                                    <ScrollArea className="h-24 w-full rounded border p-2">
                                      <pre className="text-xs whitespace-pre-wrap">
                                        {JSON.stringify(entry.apiResponse, null, 2)}
                                      </pre>
                                    </ScrollArea>
                                  </div>
                                </div>
                              </CollapsibleContent>
                            </Collapsible>
                          )}
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}