// @ts-ignore
import { serve } from "https://deno.land/std@0.208.0/http/server.ts";
import { createHandler } from '../_shared/edge-utils.ts';
import { createSupabaseClient } from "../_shared/supabaseClient.ts";

serve(createHandler(async (req, token) => {
  if (!token) {
    return new Response(JSON.stringify({ error: 'Missing authorization header' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const { supabase } = createSupabaseClient(token, 'get-settings');
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError) {
      console.error("Auth error:", userError);
      return new Response(JSON.stringify({ error: 'Invalid authentication token' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    if (!user) {
      console.error("No user found for token");
      return new Response(JSON.stringify({ error: 'User not found' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    console.log("Fetching settings for user:", user.id);
    
    // Fetch user settings
    const { data: settings, error } = await supabase
      .from('user_settings')
      .select('settings')
      .eq('user_id', user.id)
      .maybeSingle();

    if (error) {
      console.error("Error fetching settings:", error);
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify(settings?.settings || {}), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error("Unexpected error:", error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}, true));
