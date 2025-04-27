
import { supabase } from "@/integrations/supabase/client";
import { Session } from "@supabase/supabase-js";

export interface Settings {
  spreadsheetId?: string;
  sheetName?: string;
}

export async function fetchSettings(session: Session | null): Promise<Settings | null> {
  try {
    if (!session?.access_token) return null;
    
    const { data: existingSettings, error } = await supabase.functions.invoke('get-settings', {
      headers: { Authorization: `Bearer ${session.access_token}` }
    });
    
    if (error) throw error;
    
    return existingSettings;
  } catch (error) {
    console.error("Error fetching settings:", error);
    return null;
  }
}

export async function saveSettings(data: Settings, session: Session | null): Promise<{ success: boolean; error?: Error }> {
  try {
    if (!session?.access_token) {
      throw new Error("You must be logged in to save settings");
    }
    
    // Validate required fields before saving
    if (!data.spreadsheetId || !data.sheetName) {
      throw new Error("Spreadsheet ID and sheet name are required");
    }
    
    // Save settings using edge function
    const { error } = await supabase.functions.invoke('save-settings', {
      body: data,
      headers: {
        Authorization: `Bearer ${session.access_token}`
      }
    });
    
    if (error) throw error;
    
    // Update environment variables for edge functions
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
    
    return { success: true };
  } catch (error) {
    console.error("Error saving settings:", error);
    return { success: false, error: error instanceof Error ? error : new Error(String(error)) };
  }
}
