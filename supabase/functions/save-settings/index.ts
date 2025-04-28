// @ts-ignore
import { serve } from "https://deno.land/std@0.208.0/http/server.ts";
import { createHandler } from '../_shared/edge-utils.ts';
import { createSupabaseClient } from "../_shared/supabaseClient.ts";

serve(createHandler(async (req) => {
  const authorization = req.headers.get('Authorization');
  const { supabase } = createSupabaseClient(authorization, 'save-settings');
  
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
  
  // Get the settings data from the request body
  const settingsData = await req.json();
  console.log("Received settings data:", settingsData);
  
  if (!settingsData.spreadsheetId || !settingsData.sheetName) {
    console.error("Missing required settings fields");
    throw new Error('Missing required settings fields');
  }
  
  // Check if settings already exist for this user
  const { data: existingSettings, error: fetchError } = await supabase
    .from('user_settings')
    .select('*')
    .eq('user_id', user.id)
    .maybeSingle();
  
  if (fetchError) {
    console.error("Error fetching existing settings:", fetchError);
    throw new Error('Error fetching existing settings: ' + fetchError.message);
  }
  
  try {
    let result;
    
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
        
      if (error) throw error;
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
        
      if (error) throw error;
      result = data;
    }
    
    console.log("Settings saved successfully:", result);
    
    return new Response(JSON.stringify({ 
      success: true,
      message: "Settings saved successfully",
      data: result
    }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (dbError) {
    console.error("Database operation error:", dbError);
    throw new Error('Database operation failed: ' + dbError.message);
  }
}));
