// @ts-ignore
import { serve } from "https://deno.land/std@0.208.0/http/server.ts";
import { createHandler } from '../_shared/edge-utils.ts';
import { createSupabaseClient } from "../_shared/supabaseClient.ts";

declare const Deno: {
  env: {
    get(key: string): string | undefined;
  };
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

serve(createHandler(async (req) => {
  const authorization = req.headers.get('Authorization');
  if (!authorization) {
    throw new Error('Missing authorization header');
  }

  const { supabase } = createSupabaseClient(authorization, 'submit-expense');
  
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
  
  // Get the data from the request body
  const expenseData = await req.json() as ExpenseData;
  console.log("Received expense data:", expenseData);
  
  // Validate required fields
  if (!expenseData.date || !expenseData.commercant || !expenseData.montant_ttc || !expenseData.categorie) {
    console.error("Missing required fields in expense data");
    throw new Error('Missing required fields');
  }
  
  // Get the Google Sheets ID from environment variables
  const SPREADSHEET_ID = Deno.env.get("SPREADSHEET_ID") ?? "";
  const SHEET_NAME = Deno.env.get("SHEET_NAME") ?? "Dépenses";
  
  console.log("Using spreadsheet ID:", SPREADSHEET_ID);
  console.log("Using sheet name:", SHEET_NAME);
  
  if (!SPREADSHEET_ID) {
    console.error("Google Spreadsheet ID is not configured");
    throw new Error('Google Spreadsheet ID is not configured');
  }
  
  // We'll use the user's Google token sent in the Authorization header
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
    
    return new Response(JSON.stringify({
      success: true,
      message: "Expense successfully added to Google Sheets",
      details: result
    }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (apiError) {
    console.error("Google Sheets API fetch error:", apiError);
    throw new Error(`Google Sheets API error: ${apiError.message}`);
  }
}));
