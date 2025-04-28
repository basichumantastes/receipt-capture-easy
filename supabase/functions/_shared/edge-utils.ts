
import { createClient, SupabaseClient, User } from "https://esm.sh/@supabase/supabase-js@2.7.1";

export const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

export async function corsHandler(
  request: Request,
  handler: () => Promise<Response>,
  logPrefix?: string
): Promise<Response> {
  const prefix = logPrefix ? `[${logPrefix}] ` : '';
  
  if (request.method === 'OPTIONS') {
    console.log(prefix + "Handling CORS preflight request");
    return new Response('ok', { headers: corsHeaders });
  }
  
  try {
    const response = await handler();
    const newHeaders = new Headers(response.headers);
    Object.entries(corsHeaders).forEach(([key, value]) => {
      newHeaders.set(key, value);
    });
    
    return new Response(response.body, {
      status: response.status,
      headers: newHeaders,
    });
  } catch (error) {
    console.error(prefix + "Error in handler:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
}

export function createSupabaseClient(
  authHeader: string | null,
  logPrefix?: string
): { supabase: SupabaseClient; user: User | null } {
  const prefix = logPrefix ? `[${logPrefix}] ` : '';
  
  if (!authHeader) {
    console.error(prefix + "Missing Authorization header");
    throw new Error('Missing Authorization header');
  }
  
  const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
  const supabaseKey = Deno.env.get("SUPABASE_ANON_KEY") || "";
  
  return {
    supabase: createClient(supabaseUrl, supabaseKey, {
      global: { headers: { Authorization: authHeader } },
    }),
    user: null
  };
}
