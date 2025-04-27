
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

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
      throw new Error('Missing Authorization header');
    }

    // Get the data from the request body
    const expenseData = await req.json() as ExpenseData;
    console.log("Received expense data:", expenseData);
    
    // Validate required fields
    if (!expenseData.date || !expenseData.commercant || !expenseData.montant_ttc || !expenseData.categorie) {
      throw new Error('Missing required fields');
    }
    
    // Get the Google Sheets ID from environment variables
    const SPREADSHEET_ID = Deno.env.get("SPREADSHEET_ID");
    
    if (!SPREADSHEET_ID) {
      throw new Error('Google Spreadsheet ID is not configured');
    }
    
    // We'll use the user's Google token sent in the Authorization header
    // The token should be the one obtained from Google OAuth during login
    const token = authorization.replace("Bearer ", "");
    
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
    
    // Use Google Sheets API v4 to append values to the spreadsheet
    const sheetName = Deno.env.get("SHEET_NAME") || "Dépenses"; // Default to "Dépenses" if not specified
    const range = `${sheetName}!A:E`;
    
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
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error("Google Sheets API error:", errorText);
      throw new Error(`Google Sheets API error: ${response.statusText}`);
    }
    
    const result = await response.json();
    
    // Return success response
    return new Response(JSON.stringify({
      success: true,
      message: "Expense successfully added to Google Sheets",
      details: result
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
    
  } catch (error) {
    console.error("Error in submit-expense function:", error);
    
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});
