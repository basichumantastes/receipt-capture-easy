
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHandler, createSupabaseClient } from "../_shared/edge-utils.ts";

serve((req) => corsHandler(req, async () => {
  const authorization = req.headers.get('Authorization');
  const { supabase } = createSupabaseClient(authorization, 'get-settings');
  
  // Get user info from the session
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  
  if (userError) {
    console.error("Auth error:", userError);
    throw new Error('Authentication error: ' + userError.message);
  }
  
  if (!user) {
    console.error("No authenticated user found");
    throw new Error('No authenticated user found');
  }
  
  console.log("Fetching settings for user ID:", user.id);
  
  // Get the user's settings
  const { data: settings, error } = await supabase
    .from('user_settings')
    .select('settings')
    .eq('user_id', user.id)
    .maybeSingle();
  
  if (error) {
    console.error("Error fetching settings:", error);
    throw new Error('Error fetching settings: ' + error.message);
  }
  
  console.log("Settings retrieved:", settings);
  
  if (!settings) {
    console.log("No settings found for user, returning empty object");
    return new Response(JSON.stringify({}), {
      headers: { 'Content-Type': 'application/json' },
    });
  }
  
  return new Response(JSON.stringify(settings?.settings || {}), {
    headers: { 'Content-Type': 'application/json' },
  });
}, 'get-settings'));
