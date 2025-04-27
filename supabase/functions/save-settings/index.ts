
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
    console.log("Processing settings save request");
    
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
    
    // Get the settings data from the request body
    let settingsData;
    try {
      settingsData = await req.json() as SettingsData;
      console.log("Received settings data:", settingsData);
    } catch (jsonError) {
      console.error("Error parsing request body:", jsonError);
      return new Response(JSON.stringify({ error: 'Invalid request body' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400
      });
    }
    
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
        console.log("Updating existing settings for user:", user.id);
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
        console.log("Creating new settings for user:", user.id);
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
      
      // Try to update environment variables for edge functions - but don't block the response if it fails
      try {
        console.log("Updating environment variables for edge functions");
        await supabase.functions.invoke('update-env-vars', {
          body: {
            SPREADSHEET_ID: settingsData.spreadsheetId,
            SHEET_NAME: settingsData.sheetName
          }
        }).catch(e => {
          console.warn("Failed to update environment variables, but continuing:", e);
          // Non-critical error, continue
        });
      } catch (envError) {
        console.warn("Error updating environment variables, but continuing:", envError);
        // Non-critical error, continue
      }
      
      return new Response(JSON.stringify({ 
        success: true,
        message: "Settings saved successfully",
        data: result
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      });
      
    } catch (dbError: any) {
      console.error("Database operation error:", dbError);
      return new Response(JSON.stringify({ error: 'Database operation failed: ' + dbError.message }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      });
    }
  } catch (error: any) {
    console.error("Error in save-settings function:", error);
    
    return new Response(JSON.stringify({ error: error.message || 'Unknown error' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});
