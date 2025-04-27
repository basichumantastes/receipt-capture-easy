
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

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
      throw new Error('Missing Authorization header');
    }

    // Utiliser le token d'accès Google de l'utilisateur
    const token = authorization.replace("Bearer ", "");
    
    console.log("Fetching spreadsheets list from Google Drive API");
    
    // Utiliser l'API Google Drive pour récupérer la liste des spreadsheets
    const response = await fetch(
      `https://www.googleapis.com/drive/v3/files?q=mimeType='application/vnd.google-apps.spreadsheet'&fields=files(id,name,createdTime)`, 
      {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error("Google Drive API error:", errorText);
      throw new Error(`Google Drive API error: ${response.statusText}`);
    }
    
    const result = await response.json();
    console.log(`Found ${result.files.length} spreadsheets`);
    
    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
    
  } catch (error) {
    console.error("Error in list-spreadsheets function:", error);
    
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});
