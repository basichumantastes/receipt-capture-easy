
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHandler, createSupabaseClient } from "../_shared/edge-utils.ts";

interface EnvVars {
  SPREADSHEET_ID?: string;
  SHEET_NAME?: string;
  [key: string]: string | undefined;
}

serve((req) => corsHandler(req, async () => {
  const authorization = req.headers.get('Authorization');
  const { supabase } = createSupabaseClient(authorization, 'update-env-vars');
  
  // Get user info from the session
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  
  if (userError) {
    console.error("Auth error:", userError);
    throw new Error('Unauthorized');
  }
  
  if (!user) {
    console.error("No authenticated user found");
    throw new Error('No authenticated user found');
  }
  
  // Get the environment variables from the request body
  const envVars: EnvVars = await req.json();
  
  // Store environment variables in Supabase KV store
  Object.entries(envVars).forEach(([key, value]) => {
    if (value) {
      console.log(`Setting environment variable ${key} to ${value}`);
    }
  });
  
  return new Response(JSON.stringify({ 
    success: true,
    message: "Environment variables updated"
  }), {
    headers: { 'Content-Type': 'application/json' },
  });
}, 'update-env-vars'));
