
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHandler, createSupabaseClient } from "../_shared/edge-utils.ts";

serve((req) => corsHandler(req, async () => {
  const authorization = req.headers.get('Authorization');
  const { supabase } = createSupabaseClient(authorization, 'list-spreadsheets');
  
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  
  if (userError) {
    console.error("Auth error:", userError);
    throw new Error('Authentication error: ' + userError.message);
  }
  
  if (!user) {
    console.error("No authenticated user found");
    throw new Error('No authenticated user found');
  }
  
  // Parse the passed data to get the Google token
  const reqData = await req.json().catch(() => ({}));
  const googleToken = reqData.googleToken;
  
  if (!googleToken) {
    console.error("Missing Google provider token");
    return new Response(JSON.stringify({
      error: "Missing Google provider token. Reconnection may be required.",
      files: []
    }), {
      headers: { 'Content-Type': 'application/json' },
      status: 400,
    });
  }
  
  console.log("Fetching spreadsheets list from Google Drive API");
  console.log("Google token first 15 chars:", googleToken.substring(0, 15) + "...");
  
  try {
    // Use the Google token to call the Drive API
    const response = await fetch(
      `https://www.googleapis.com/drive/v3/files?q=mimeType='application/vnd.google-apps.spreadsheet'&fields=files(id,name,createdTime)`, 
      {
        headers: {
          'Authorization': `Bearer ${googleToken}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error("Google Drive API error status:", response.status);
      console.error("Google Drive API error details:", errorText);
      
      // Check specific error cases and return appropriate responses
      if (errorText.includes("API has not been used") || errorText.includes("disabled")) {
        return new Response(JSON.stringify({ 
          error: "L'API Google Drive n'est pas activée dans votre projet Google Cloud. Vous devez l'activer dans la console Google Cloud.",
          files: [],
          details: errorText,
          apiActivationRequired: true
        }), {
          headers: { 'Content-Type': 'application/json' },
          status: 403,
        });
      }
      
      if (response.status === 401) {
        return new Response(JSON.stringify({ 
          error: "Erreur d'authentification Google Drive. Veuillez vous reconnecter avec les permissions appropriées.",
          files: [],
          details: errorText
        }), {
          headers: { 'Content-Type': 'application/json' },
          status: 401,
        });
      }
      
      return new Response(JSON.stringify({
        error: `Erreur API Google Drive: ${response.statusText}`,
        files: [],
        details: errorText
      }), {
        headers: { 'Content-Type': 'application/json' },
        status: response.status
      });
    }
    
    const result = await response.json();
    
    if (!result.files || result.files.length === 0) {
      console.log("No spreadsheets found for this Google account");
      return new Response(JSON.stringify({ 
        files: [],
        message: "Aucun Google Sheets trouvé sur votre compte" 
      }), {
        headers: { 'Content-Type': 'application/json' },
      });
    }
    
    return new Response(JSON.stringify(result), {
      headers: { 'Content-Type': 'application/json' },
    });
    
  } catch (apiError: any) {
    console.error("API request error:", apiError.message);
    throw apiError;
  }
}, 'list-spreadsheets'));
