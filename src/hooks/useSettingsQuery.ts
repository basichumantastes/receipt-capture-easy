
import { useQuery, useMutation } from '@tanstack/react-query';
import { supabase } from "@/integrations/supabase/client";
import { Session } from "@supabase/supabase-js";
import { queryClient } from '@/lib/queryClient';
import { useNotify } from './useNotify';

export interface Settings {
  spreadsheetId?: string;
  sheetName?: string;
}

// Cache for settings to avoid multiple requests
let settingsCache: Settings | null = null;

export const useSettingsQuery = (session: Session | null) => {
  return useQuery({
    queryKey: ['settings', session?.user?.id],
    queryFn: async () => {
      if (!session?.access_token) {
        console.log("No active session found when fetching settings");
        return null;
      }
      
      // If we have settings in cache and a session, return them
      if (settingsCache && session?.access_token) {
        return settingsCache;
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
      
      // Cache the settings for future use
      if (existingSettings) {
        settingsCache = existingSettings;
      }
      
      return existingSettings || null;
    },
    enabled: !!session?.access_token,
  });
};

export const useSaveSettingsMutation = (session: Session | null) => {
  const notify = useNotify();

  return useMutation({
    mutationFn: async (data: Settings) => {
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
      
      // Update the cache with the new data
      settingsCache = data;
      
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
      return result;
    },
    onSuccess: () => {
      notify.success("Paramètres sauvegardés", {
        description: "Vos paramètres Google Sheets ont été mis à jour avec succès."
      });
      
      // Invalidate the settings query to refetch the latest data
      queryClient.invalidateQueries({ queryKey: ['settings'] });
    },
    onError: (error: Error) => {
      console.error("Error saving settings:", error);
      notify.error(`Erreur lors de la sauvegarde des paramètres: ${error.message}`);
    }
  });
};

// Function to clear settings cache (useful on logout)
export const clearSettingsCache = () => {
  settingsCache = null;
};
