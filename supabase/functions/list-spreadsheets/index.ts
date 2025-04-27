
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

    // Parse the passed data to get the Google token
    const reqData = await req.json().catch(() => ({}));
    const googleToken = reqData.googleToken;
    const testMode = reqData.testMode === true;
    
    if (!googleToken) {
      console.error("Missing Google provider token");
      return new Response(JSON.stringify({
        error: "Missing Google provider token",
        files: []
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      });
    }
    
    console.log("Fetching spreadsheets list from Google Drive API");
    
    try {
      // If in test mode, just check API status
      if (testMode) {
        const testResponse = await fetch(
          `https://www.googleapis.com/drive/v3/about?fields=user`,
          {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${googleToken}`,
              'Content-Type': 'application/json'
            }
          }
        );
        
        if (!testResponse.ok) {
          const errorText = await testResponse.text();
          console.error("Google Drive API status check failed:", testResponse.status);
          
          // Check for API not enabled error
          if (errorText.includes("API has not been used") || 
              errorText.includes("disabled") || 
              errorText.includes("not enabled")) {
            return new Response(JSON.stringify({ apiActivationRequired: true }), {
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
              status: 200,
            });
          }
          
          return new Response(JSON.stringify({ error: `API status check failed: ${testResponse.statusText}` }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: testResponse.status
          });
        }
        
        // API is accessible
        return new Response(JSON.stringify({ status: "API accessible" }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        });
      }
      
      // Regular mode - get spreadsheets
      const response = await fetch(
        `https://www.googleapis.com/drive/v3/files?q=mimeType='application/vnd.google-apps.spreadsheet'&fields=files(id,name,createdTime)`, 
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${googleToken}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error("Google Drive API error status:", response.status);
        
        // Check for API not enabled error
        if (errorText.includes("API has not been used") || 
            errorText.includes("disabled") || 
            errorText.includes("not enabled")) {
          return new Response(JSON.stringify({ 
            apiActivationRequired: true,
            details: errorText
          }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200,
          });
        }
        
        // Authentication issues
        if (response.status === 401) {
          return new Response(JSON.stringify({ 
            error: "Erreur d'authentification Google Drive",
            files: [],
            details: errorText
          }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 401,
          });
        }
        
        return new Response(JSON.stringify({
          error: `Erreur API Google Drive: ${response.statusText}`,
          files: [],
          details: errorText
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: response.status
        });
      }
      
      const result = await response.json();
      console.log(`Found ${result.files ? result.files.length : 0} spreadsheets`);
      
      // If no files found, return empty array with status 200
      if (!result.files || result.files.length === 0) {
        console.log("No spreadsheets found for this Google account");
        return new Response(JSON.stringify({ 
          files: [],
          message: "Aucun Google Sheets trouvé sur votre compte" 
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        });
      }
      
      return new Response(JSON.stringify(result), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      });
    } catch (apiError: any) {
      console.error("API request error:", apiError.message);
      
      return new Response(JSON.stringify({ 
        error: apiError.message,
        files: []
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      });
    }
    
  } catch (error: any) {
    console.error("Error in list-spreadsheets function:", error);
    
    return new Response(JSON.stringify({ 
      error: error.message, 
      files: [] 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});
