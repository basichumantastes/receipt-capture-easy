
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req: Request) => {
  // Gestion du CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { googleToken, spreadsheetId } = await req.json();
    
    if (!googleToken) {
      return new Response(
        JSON.stringify({ error: "Google OAuth token is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    if (!spreadsheetId) {
      return new Response(
        JSON.stringify({ error: "Spreadsheet ID is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    console.log(`Fetching worksheets for spreadsheet ${spreadsheetId}`);
    
    // Appeler l'API Google Sheets pour obtenir les feuilles de calcul
    const sheetsResponse = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}?fields=sheets.properties`,
      {
        headers: {
          Authorization: `Bearer ${googleToken}`,
        },
      }
    );

    if (!sheetsResponse.ok) {
      const errorData = await sheetsResponse.json();
      console.error("Error from Google Sheets API:", errorData);
      
      if (sheetsResponse.status === 403) {
        return new Response(
          JSON.stringify({ 
            error: "Access denied", 
            message: "Vérifiez que vous avez les droits d'accès nécessaires pour ce Google Sheets" 
          }),
          { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      return new Response(
        JSON.stringify({ 
          error: "Failed to fetch worksheets",
          message: errorData.error?.message || "Unknown error" 
        }),
        { status: sheetsResponse.status, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    const sheetsData = await sheetsResponse.json();
    
    // Extraction des informations pertinentes sur les feuilles de calcul
    const worksheets = sheetsData.sheets.map((sheet: any) => ({
      title: sheet.properties.title,
      index: sheet.properties.index,
    }));
    
    console.log(`Found ${worksheets.length} worksheets`);
    
    return new Response(
      JSON.stringify({ 
        sheets: worksheets,
        success: true
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
    
  } catch (error) {
    console.error("Error in list-worksheets function:", error);
    
    return new Response(
      JSON.stringify({ error: error.message || "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
