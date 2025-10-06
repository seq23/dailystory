import { Badge } from '@/components/ui/badge';

interface CCSStatusDisplayProps {
  result: {
    tier: string;
    details: {
      testType?: string;
      ccsBootStatus?: {
        loaded: boolean;
        tier1: boolean;
        tier25: boolean;
        directMode: boolean;
      };
      precomputedCCSUsed?: boolean | null;
      ccsMethodStatus?: Record<string, string>;
      ccsFallbacksActive?: string[];
      ccsImportSource?: string;
    };
  };
}

export function CCSStatusDisplay({ result }: CCSStatusDisplayProps) {
  if (result.details.testType !== 'REAL' || !result.details.ccsBootStatus) return null;

  return (
    <div className="text-sm border-2 border-blue-300 rounded p-3 bg-blue-50 mt-3">
      <div className="font-bold text-blue-700 mb-2 flex items-center gap-2">
        🔧 Character Consistency Service (CCS) Status
        {result.details.precomputedCCSUsed === true && (
          <Badge className="bg-green-600 text-white">⚡ FAST PATH</Badge>
        )}
        {result.details.precomputedCCSUsed === false && (
          <Badge className="bg-orange-600 text-white">🔄 LEGACY PATH</Badge>
        )}
      </div>
      
      <div className="space-y-2 text-xs">
        {/* CCS Boot Status */}
        {result.details.ccsBootStatus && (
          <div className={`flex items-center gap-2 ${
            result.details.ccsBootStatus.loaded ? 'text-green-700' : 'text-red-700'
          }`}>
            {result.details.ccsBootStatus.loaded ? '✅' : '❌'} 
            <span>CCS Module: {result.details.ccsBootStatus.loaded ? 'LOADED' : 'FAILED'}</span>
          </div>
        )}
        
        {/* Import Source */}
        {result.details.ccsImportSource && result.details.ccsImportSource !== 'unknown' && (
          <div className="text-gray-700 flex items-center gap-2">
            📦 Import Source: 
            <Badge variant="outline" className={
              result.details.ccsImportSource === 'orchestrator-precomputed' ? 'bg-green-100 border-green-400' :
              result.details.ccsImportSource.includes('_shared') ? 'bg-blue-100 border-blue-400' :
              result.details.ccsImportSource.includes('_vendor') ? 'bg-orange-100 border-orange-400' :
              result.details.ccsImportSource === 'unavailable' ? 'bg-red-100 border-red-400' :
              'bg-gray-100'
            }>
              {result.details.ccsImportSource}
            </Badge>
          </div>
        )}
        
        {/* Fast Path for Template 2.5A/B */}
        {(result.tier.includes('2.5A') || result.tier.includes('2.5B')) && result.details.precomputedCCSUsed !== null && (
          <div className={`p-2 rounded ${
            result.details.precomputedCCSUsed 
              ? 'bg-green-50 border border-green-300' 
              : 'bg-orange-50 border border-orange-300'
          }`}>
            <div className="font-medium mb-1">
              {result.details.precomputedCCSUsed ? '⚡ FAST PATH' : '🔄 LEGACY PATH'}
            </div>
            <div className="text-xs">
              {result.details.precomputedCCSUsed 
                ? 'Using orchestrator-provided CCS data (ZERO import overhead)'
                : 'Using local CCS imports (slower) - may indicate scope bug'
              }
            </div>
          </div>
        )}
        
        {/* Method Status */}
        {result.details.ccsMethodStatus && Object.keys(result.details.ccsMethodStatus).length > 0 && (
          <details className="mt-2">
            <summary className="cursor-pointer font-medium text-blue-600">
              📊 CCS Method Status
            </summary>
            <div className="mt-2 ml-4 space-y-1">
              {Object.entries(result.details.ccsMethodStatus).map(([method, status]) => (
                <div key={method} className="text-xs flex items-center gap-2">
                  {String(status).includes('precomputed') || String(status).includes('success') ? '✅' : '🟡'}
                  <span>{method}:</span>
                  <Badge variant="outline">{String(status).toUpperCase()}</Badge>
                </div>
              ))}
            </div>
          </details>
        )}
      </div>
    </div>
  );
}
