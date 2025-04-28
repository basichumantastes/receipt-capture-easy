
import { Session } from "@supabase/supabase-js";

export interface Settings {
  spreadsheetId?: string;
  sheetName?: string;
}

// Cache des paramètres pour éviter des appels répétés
let settingsCache: Settings | null = null;
let lastFetchTimestamp: number = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes en millisecondes

export async function fetchSettings(session: Session | null): Promise<Settings | null> {
  try {
    const now = Date.now();
    
    // Si nous avons des paramètres en cache et le cache n'a pas expiré
    if (settingsCache && (now - lastFetchTimestamp < CACHE_DURATION)) {
      console.log("Using cached settings, cache age:", (now - lastFetchTimestamp) / 1000, "seconds");
      return settingsCache;
    }

    if (!session?.user?.id) {
      console.log("No active session found when fetching settings");
      return null;
    }
    
    // Simuler le chargement des paramètres
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Valeurs par défaut
    const defaultSettings: Settings = {
      spreadsheetId: "",
      sheetName: "Dépenses"
    };
    
    settingsCache = defaultSettings;
    lastFetchTimestamp = now;
    return defaultSettings;
    
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
    
    // Simuler la sauvegarde
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Mettre à jour le cache avec les nouvelles données
    settingsCache = data;
    lastFetchTimestamp = Date.now();
    
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
  lastFetchTimestamp = 0;
}
