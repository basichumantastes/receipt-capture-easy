
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
    
    // Test du token pour déboguer
    console.log("Token first 15 chars:", token.substring(0, 15) + "...");
    
    try {
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
        console.error("Google Drive API error status:", response.status);
        console.error("Google Drive API error details:", errorText);
        
        // Vérifier si c'est une erreur d'authentification
        if (response.status === 401) {
          return new Response(JSON.stringify({ 
            error: "Erreur d'authentification Google Drive. Veuillez vous reconnecter avec les permissions appropriées.",
            files: [] 
          }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 401,
          });
        }
        
        throw new Error(`Google Drive API error: ${response.statusText}`);
      }
      
      const result = await response.json();
      console.log(`Found ${result.files ? result.files.length : 0} spreadsheets`);
      
      // Si aucun fichier n'est trouvé, retourner un tableau vide mais avec un statut 200
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
      throw apiError;
    }
    
  } catch (error: any) {
    console.error("Error in list-spreadsheets function:", error);
    
    return new Response(JSON.stringify({ error: error.message, files: [] }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});
