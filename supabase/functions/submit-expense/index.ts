
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
    
    // Get the Google Sheets URL and other settings from environment variables
    // In a real implementation, these would come from your Supabase secrets or user settings
    const SCRIPT_URL = Deno.env.get("SCRIPT_URL");
    
    if (!SCRIPT_URL) {
      throw new Error('Google Apps Script URL is not configured');
    }
    
    // Forward the expense data to Google Apps Script
    const response = await fetch(SCRIPT_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': authorization
      },
      body: JSON.stringify({
        date: expenseData.date,
        commercant: expenseData.commercant,
        montant_ttc: expenseData.montant_ttc,
        categorie: expenseData.categorie,
        motif: expenseData.motif || ""
      })
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error("Google Apps Script error:", errorText);
      throw new Error(`Google Apps Script error: ${response.statusText}`);
    }
    
    const result = await response.json();
    
    // Return the result
    return new Response(JSON.stringify(result), {
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
