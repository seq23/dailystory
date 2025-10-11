/**
 * LOCAL VENDOR BUNDLE: Supabase JS Client v2.57.4
 * This is a true local fallback - completely independent of network CDNs
 * Contains the essential createClient function for nuclear independence
 */

// Minimal Supabase client implementation for emergency fallback
class SupabaseClient {
  constructor(supabaseUrl, supabaseKey, options = {}) {
    this.supabaseUrl = supabaseUrl;
    this.supabaseKey = supabaseKey;
    this.options = options;
    this.headers = {
      'apikey': supabaseKey,
      'Authorization': `Bearer ${supabaseKey}`,
      'Content-Type': 'application/json',
      'Prefer': 'return=minimal'
    };
  }

  from(table) {
    return new SupabaseQueryBuilder(this, table);
  }

  functions = {
    invoke: async (name, options = {}) => {
      const url = `${this.supabaseUrl}/functions/v1/${name}`;
      try {
        const response = await fetch(url, {
          method: 'POST',
          headers: {
            ...this.headers,
            ...options.headers
          },
          body: options.body ? JSON.stringify(options.body) : undefined
        });
        
        if (!response.ok) {
          throw new Error(`Function invocation failed: ${response.status}`);
        }
        
        const data = await response.json();
        return { data, error: null };
      } catch (error) {
        return { data: null, error };
      }
    }
  };
}

class SupabaseQueryBuilder {
  constructor(client, table) {
    this.client = client;
    this.table = table;
    this.queryParams = [];
    this.headers = {};
    this.method = 'GET';
    this.data = undefined;
    this.singleMode = false;
    this.maybeSingleMode = false;
    this.wantCount = false;
  }

  // URL encoding helper
  _encode(v) {
    return encodeURIComponent(v);
  }

  // Filter helper
  _addFilter(op, column, value) {
    this.queryParams.push(`${this._encode(column)}=${op}.${this._encode(value)}`);
  }

  // SELECT with count support
  select(columns = '*', options = undefined) {
    this.queryParams.push(`select=${columns}`);
    if (options && options.count === 'exact') {
      // Merge Prefer header to request count in Content-Range
      const existingPrefer = this.client.headers['Prefer'] || '';
      const preferParts = new Set(existingPrefer.split(',').map(s => s.trim()).filter(Boolean));
      preferParts.add('count=exact');
      this.client.headers['Prefer'] = Array.from(preferParts).join(', ');
      this.wantCount = true;
    }
    // Ignore options.head - always use GET for simplicity
    return this;
  }

  // Write operations
  insert(data) {
    this.method = 'POST';
    this.data = data;
    return this;
  }

  update(data) {
    this.method = 'PATCH';
    this.data = data;
    return this;
  }

  delete() {
    this.method = 'DELETE';
    return this;
  }

  upsert(data, options = {}) {
    this.method = 'POST';
    this.data = data;
    // Ensure Prefer has resolution + representation
    const existingPrefer = this.client.headers['Prefer'] || '';
    const preferParts = new Set(existingPrefer.split(',').map(s => s.trim()).filter(Boolean));
    preferParts.add('resolution=merge-duplicates');
    preferParts.add('return=representation');
    this.client.headers['Prefer'] = Array.from(preferParts).join(', ');
    return this;
  }

  // Comparison filters
  eq(column, value) { this._addFilter('eq', column, value); return this; }
  neq(column, value) { this._addFilter('neq', column, value); return this; }
  gt(column, value) { this._addFilter('gt', column, value); return this; }
  gte(column, value) { this._addFilter('gte', column, value); return this; }
  lt(column, value) { this._addFilter('lt', column, value); return this; }
  lte(column, value) { this._addFilter('lte', column, value); return this; }

  // Sorting and limiting
  order(column, { ascending = true } = {}) {
    const dir = ascending ? 'asc' : 'desc';
    this.queryParams.push(`order=${this._encode(column)}.${dir}`);
    return this;
  }

  limit(n) {
    this.queryParams.push(`limit=${Number(n)}`);
    return this;
  }

  // Single row helpers
  single() {
    this.singleMode = true;
    return this;
  }

  maybeSingle() {
    this.maybeSingleMode = true;
    return this;
  }

  async execute() {
    const qs = this.queryParams.length ? ('?' + this.queryParams.join('&')) : '';
    const url = `${this.client.supabaseUrl}/rest/v1/${this.table}${qs}`;

    try {
      const response = await fetch(url, {
        method: this.method || 'GET',
        headers: { ...this.client.headers, ...this.headers },
        body: this.data ? JSON.stringify(this.data) : undefined
      });

      if (!response.ok) {
        throw new Error(`Database operation failed: ${response.status}`);
      }

      // Try to parse JSON if present (DELETE may return empty)
      let data = null;
      try {
        data = await response.json();
      } catch {
        data = null;
      }

      // Count from Content-Range if requested
      let count = null;
      if (this.wantCount) {
        const cr = response.headers.get('Content-Range'); // e.g., "0-0/123"
        if (cr && cr.includes('/')) {
          const total = cr.split('/')[1];
          const parsed = Number(total);
          if (!Number.isNaN(parsed)) count = parsed;
        }
      }

      // Handle single/maybeSingle
      if (this.singleMode) {
        if (Array.isArray(data)) {
          if (data.length === 0) {
            return { data: null, error: { message: 'No rows found', code: 'PGRST116' }, count };
          }
          if (data.length > 1) {
            return { data: null, error: { message: 'Multiple rows returned', code: 'PGRST116' }, count };
          }
          return { data: data[0], error: null, count };
        }
        return { data, error: null, count };
      }

      if (this.maybeSingleMode) {
        if (Array.isArray(data)) {
          if (data.length === 0) {
            return { data: null, error: null, count };
          }
          if (data.length === 1) {
            return { data: data[0], error: null, count };
          }
          // More than one row: surface error (matches supabase-js behavior)
          return { data: null, error: { message: 'Multiple rows returned', code: 'PGRST116' }, count };
        }
        // Non-array: treat as single object
        return { data, error: null, count };
      }

      return { data, error: null, count };
    } catch (error) {
      return { data: null, error };
    }
  }
}

// Create client function - main export
export function createClient(supabaseUrl, supabaseKey, options) {
  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Supabase URL and key are required');
  }
  
  return new SupabaseClient(supabaseUrl, supabaseKey, options);
}

// Default export for compatibility
export default { createClient };