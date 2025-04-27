
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ExpenseData {
  date: string;
  commercant: string;
  montant_ttc: number;
  categorie: string;
  motif: string;
  user_id: string;
  created_at: string;
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
      throw new Error('Missing Authorization header');
    }

    // Get the data from the request body
    const expenseData = await req.json() as ExpenseData;
    console.log("Received expense data:", expenseData);
    
    // Validate required fields
    if (!expenseData.date || !expenseData.commercant || !expenseData.montant_ttc || !expenseData.categorie) {
      console.error("Missing required fields in expense data");
      throw new Error('Missing required fields');
    }
    
    // Get the Google Sheets ID from environment variables
    const SPREADSHEET_ID = Deno.env.get("SPREADSHEET_ID");
    const SHEET_NAME = Deno.env.get("SHEET_NAME") || "Dépenses";
    
    console.log("Using spreadsheet ID:", SPREADSHEET_ID);
    console.log("Using sheet name:", SHEET_NAME);
    
    if (!SPREADSHEET_ID) {
      console.error("Google Spreadsheet ID is not configured");
      throw new Error('Google Spreadsheet ID is not configured');
    }
    
    // We'll use the user's Google token sent in the Authorization header
    // The token should be the one obtained from Google OAuth during login
    const token = authorization.replace("Bearer ", "");
    
    // Create a Supabase client with the auth token to verify the user
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
      throw new Error(`Authentication error: ${userError.message}`);
    }
    
    if (!user) {
      console.error("No authenticated user found");
      throw new Error('No authenticated user found');
    }
    
    // Prepare the values to be added to the spreadsheet
    const values = [
      [
        expenseData.date,
        expenseData.commercant,
        expenseData.montant_ttc.toString(),
        expenseData.categorie,
        expenseData.motif || ""
      ]
    ];
    
    console.log("Preparing to add values to spreadsheet:", values);
    
    // Use Google Sheets API v4 to append values to the spreadsheet
    const range = `${SHEET_NAME}!A:E`;
    
    console.log(`Sending request to Google Sheets API for spreadsheet ${SPREADSHEET_ID}, range ${range}`);
    
    try {
      const response = await fetch(
        `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/${range}:append?valueInputOption=USER_ENTERED&insertDataOption=INSERT_ROWS`, 
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            values: values
          })
        }
      );
      
      console.log("Google Sheets API response status:", response.status);
      
      if (!response.ok) {
        const errorBody = await response.text();
        console.error("Google Sheets API error:", response.status, errorBody);
        throw new Error(`Google Sheets API error (${response.status}): ${errorBody}`);
      }
      
      const result = await response.json();
      console.log("Google Sheets API success response:", result);
      
      // Return success response
      return new Response(JSON.stringify({
        success: true,
        message: "Expense successfully added to Google Sheets",
        details: result
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    } catch (apiError) {
      console.error("Google Sheets API fetch error:", apiError);
      throw new Error(`Google Sheets API error: ${apiError.message}`);
    }
  } catch (error) {
    console.error("Error in submit-expense function:", error);
    
    return new Response(JSON.stringify({ 
      success: false,
      error: error.message || "Unknown error"
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});
