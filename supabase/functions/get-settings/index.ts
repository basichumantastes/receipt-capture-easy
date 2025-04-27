
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }
  
  try {
    const authorization = req.headers.get('Authorization');
    if (!authorization) {
      console.error("Missing Authorization header");
      return new Response(JSON.stringify({ error: 'Missing Authorization header' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 401
      });
    }
    
    // Create a Supabase client with the auth token
    const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
    const supabaseKey = Deno.env.get("SUPABASE_ANON_KEY") || "";
    
    console.log("Creating Supabase client with URL:", supabaseUrl);
    
    const supabase = createClient(supabaseUrl, supabaseKey, {
      global: {
        headers: { Authorization: authorization },
      },
    });
    
    // Get user info from the session
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError) {
      console.error("Auth error:", userError);
      return new Response(JSON.stringify({ error: 'Authentication error: ' + userError.message }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 401
      });
    }
    
    if (!user) {
      console.error("No authenticated user found");
      return new Response(JSON.stringify({ error: 'No authenticated user found' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 401
      });
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
      return new Response(JSON.stringify({ error: 'Error fetching settings: ' + error.message }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      });
    }
    
    console.log("Settings retrieved:", settings);
    
    // Gestion explicite du cas où les paramètres ne sont pas trouvés
    if (!settings) {
      console.log("No settings found for user, returning empty object");
      return new Response(JSON.stringify({}), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    
    return new Response(JSON.stringify(settings?.settings || {}), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error("Error in get-settings function:", error);
    
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});
