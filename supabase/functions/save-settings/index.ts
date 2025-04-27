
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface SettingsData {
  spreadsheetId?: string;
  sheetName?: string;
}

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
    
    // Get the settings data from the request body
    const settingsData = await req.json() as SettingsData;
    console.log("Received settings data:", settingsData);
    
    if (!settingsData.spreadsheetId || !settingsData.sheetName) {
      console.error("Missing required settings fields");
      return new Response(JSON.stringify({ error: 'Missing required settings fields' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400
      });
    }
    
    // Check if settings already exist for this user
    const { data: existingSettings, error: fetchError } = await supabase
      .from('user_settings')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle();
    
    if (fetchError) {
      console.error("Error fetching existing settings:", fetchError);
      return new Response(JSON.stringify({ error: 'Error fetching existing settings: ' + fetchError.message }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      });
    }
    
    let result;
    
    try {
      if (existingSettings) {
        // Update existing settings
        const { data, error } = await supabase
          .from('user_settings')
          .update({
            settings: settingsData,
            updated_at: new Date().toISOString()
          })
          .eq('user_id', user.id)
          .select();
          
        if (error) {
          console.error("Error updating settings:", error);
          throw error;
        }
        result = data;
      } else {
        // Insert new settings
        const { data, error } = await supabase
          .from('user_settings')
          .insert({
            user_id: user.id,
            settings: settingsData,
          })
          .select();
          
        if (error) {
          console.error("Error inserting settings:", error);
          throw error;
        }
        result = data;
      }
      
      console.log("Settings saved successfully:", result);
      
      return new Response(JSON.stringify({ 
        success: true,
        message: "Settings saved successfully",
        data: result
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      });
    } catch (dbError) {
      console.error("Database operation error:", dbError);
      return new Response(JSON.stringify({ error: 'Database operation failed: ' + dbError.message }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      });
    }
  } catch (error) {
    console.error("Error in save-settings function:", error);
    
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});
