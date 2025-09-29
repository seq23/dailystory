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
  }

  select(columns = '*') {
    this.queryParams.push(`select=${columns}`);
    return this;
  }

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

  eq(column, value) {
    this.queryParams.push(`${column}=eq.${value}`);
    return this;
  }

  async execute() {
    const url = `${this.client.supabaseUrl}/rest/v1/${this.table}${this.queryParams.length ? '?' + this.queryParams.join('&') : ''}`;
    
    try {
      const response = await fetch(url, {
        method: this.method || 'GET',
        headers: this.client.headers,
        body: this.data ? JSON.stringify(this.data) : undefined
      });

      if (!response.ok) {
        throw new Error(`Database operation failed: ${response.status}`);
      }

      const data = await response.json();
      return { data, error: null };
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