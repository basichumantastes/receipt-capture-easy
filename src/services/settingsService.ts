
import { supabase } from "@/integrations/supabase/client";
import { Session } from "@supabase/supabase-js";

export interface Settings {
  spreadsheetId?: string;
  sheetName?: string;
}

// Cache des paramètres pour éviter des appels répétés
let settingsCache: Settings | null = null;

export async function fetchSettings(session: Session | null): Promise<Settings | null> {
  try {
    // Si nous avons des paramètres en cache et une session, retournons-les
    if (settingsCache && session?.access_token) {
      return settingsCache;
    }

    if (!session?.user?.id) {
      console.log("No active session found when fetching settings");
      return null;
    }
    
    console.log("Fetching settings from database");
    
    const { data: userSettings, error } = await supabase
      .from('user_settings')
      .select('settings')
      .eq('user_id', session.user.id)
      .maybeSingle();
    
    if (error) {
      console.error("Error fetching settings:", error);
      throw error;
    }
    
    console.log("Settings received:", userSettings);
    
    // Mettre en cache les paramètres récupérés et conversion du type JSON vers Settings
    if (userSettings?.settings) {
      const typedSettings = userSettings.settings as unknown as Settings;
      settingsCache = typedSettings;
      return typedSettings;
    }
    
    return null;
  } catch (error) {
    console.error("Error fetching settings:", error);
    return null;
  }
}

export async function saveSettings(data: Settings, session: Session | null): Promise<{ success: boolean; error?: Error }> {
  try {
    if (!session?.user?.id) {
      throw new Error("Vous devez être connecté pour sauvegarder les paramètres");
    }
    
    // Validate required fields before saving
    if (!data.spreadsheetId || !data.sheetName) {
      throw new Error("L'ID du Google Sheets et le nom de la feuille sont obligatoires");
    }

    console.log("Saving settings:", data);
    
    // Try to upsert the settings - convert Settings to Json type for Supabase
    const { error } = await supabase
      .from('user_settings')
      .upsert({
        user_id: session.user.id,
        settings: data as any // Use type assertion to satisfy TypeScript
      }, {
        onConflict: 'user_id'
      });
    
    if (error) {
      console.error("Error saving settings:", error);
      throw error;
    }
    
    // Mettre à jour le cache avec les nouvelles données
    settingsCache = data;
    
    console.log("Settings saved successfully");
    return { success: true };
  } catch (error) {
    console.error("Error saving settings:", error);
    return { 
      success: false, 
      error: error instanceof Error ? error : new Error(String(error)) 
    };
  }
}

// Fonction pour réinitialiser le cache (utile lors de la déconnexion)
export function clearSettingsCache() {
  settingsCache = null;
}
