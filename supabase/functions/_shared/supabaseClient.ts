import { createClient } from '@supabase/supabase-js';

// Fix: Remove incorrect Deno type declaration and window reference
declare const Deno: {
  env: {
    get(key: string): string | undefined;
  };
};

export const createSupabaseClient = (authorization: string | null, functionName: string) => {
  const supabaseUrl = Deno.env.get('SUPABASE_URL') || 'http://127.0.0.1:54321';
  const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU';

  const supabase = createClient(supabaseUrl, supabaseKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
    global: {
      headers: {
        'x-my-custom-header': `${functionName}-${Deno.env.get('SUPABASE_FUNCTION_VERSION') || '1.0'}`
      }
    }
  });

  if (authorization) {
    supabase.auth.setSession({
      access_token: authorization,
      refresh_token: '',
    });
  }

  return { supabase };
};