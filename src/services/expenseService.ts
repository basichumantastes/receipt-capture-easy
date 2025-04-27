
import { supabase } from "@/integrations/supabase/client";
import { Session } from "@supabase/supabase-js";
import { fetchSettings } from "./settingsService";

export interface ExpenseData {
  date: string;
  commercant: string;
  montant_ttc: number;
  categorie: string;
  motif: string;
  user_id?: string;
  created_at?: string;
}

export async function submitExpense(
  expenseData: ExpenseData, 
  session: Session | null
): Promise<{ success: boolean; error?: Error }> {
  try {
    if (!session?.access_token) {
      throw new Error("Vous devez être connecté pour soumettre une dépense");
    }
    
    // Vérifier d'abord si les paramètres sont configurés
    const settings = await fetchSettings(session);
    if (!settings?.spreadsheetId || !settings?.sheetName) {
      throw new Error("Veuillez configurer vos paramètres Google Sheets avant de soumettre une dépense");
    }
    
    const fullExpenseData = {
      ...expenseData,
      user_id: session.user?.id,
      created_at: new Date().toISOString()
    };
    
    console.log("Submitting expense data:", fullExpenseData);
    
    const { data, error } = await supabase.functions.invoke('submit-expense', {
      body: fullExpenseData,
      headers: {
        Authorization: `Bearer ${session.access_token}`
      }
    });
    
    if (error) {
      console.error("Error from submit-expense function:", error);
      throw new Error(error.message);
    }
    
    console.log("Submission response:", data);
    return { success: true };
  } catch (error) {
    console.error("Error submitting expense:", error);
    return { 
      success: false, 
      error: error instanceof Error ? error : new Error(String(error)) 
    };
  }
}
