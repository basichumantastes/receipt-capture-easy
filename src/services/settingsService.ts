
import { supabase } from "@/integrations/supabase/client";
import { Session } from "@supabase/supabase-js";

export interface Settings {
  spreadsheetId?: string;
  sheetName?: string;
}

export async function fetchSettings(session: Session | null): Promise<Settings | null> {
  try {
    if (!session?.access_token) {
      console.log("No active session found when fetching settings");
      return null;
    }
    
    console.log("Fetching settings with session access token");
    
    const { data: existingSettings, error } = await supabase.functions.invoke('get-settings', {
      headers: { Authorization: `Bearer ${session.access_token}` }
    });
    
    if (error) {
      console.error("Error from get-settings function:", error);
      throw error;
    }
    
    console.log("Settings received:", existingSettings);
    return existingSettings;
  } catch (error) {
    console.error("Error fetching settings:", error);
    return null;
  }
}

export async function saveSettings(data: Settings, session: Session | null): Promise<{ success: boolean; error?: Error }> {
  try {
    if (!session?.access_token) {
      throw new Error("Vous devez être connecté pour sauvegarder les paramètres");
    }
    
    // Validate required fields before saving
    if (!data.spreadsheetId || !data.sheetName) {
      throw new Error("L'ID du Google Sheets et le nom de la feuille sont obligatoires");
    }

    console.log("Saving settings:", data);
    
    // Save settings using edge function
    const { data: result, error } = await supabase.functions.invoke('save-settings', {
      body: data,
      headers: {
        Authorization: `Bearer ${session.access_token}`
      }
    });
    
    if (error) {
      console.error("Error from save-settings function:", error);
      throw error;
    }
    
    // Update environment variables for edge functions if needed
    try {
      const { error: envError } = await supabase.functions.invoke('update-env-vars', {
        body: {
          SPREADSHEET_ID: data.spreadsheetId,
          SHEET_NAME: data.sheetName
        },
        headers: {
          Authorization: `Bearer ${session.access_token}`
        }
      });
      
      if (envError) {
        console.error("Error updating environment variables:", envError);
        // This is not critical, so we'll just log it and continue
      }
    } catch (envUpdateError) {
      console.error("Failed to update environment variables:", envUpdateError);
      // Non-critical error, continue
    }
    
    console.log("Settings saved successfully:", result);
    return { success: true };
  } catch (error) {
    console.error("Error saving settings:", error);
    return { 
      success: false, 
      error: error instanceof Error ? error : new Error(String(error)) 
    };
  }
}
