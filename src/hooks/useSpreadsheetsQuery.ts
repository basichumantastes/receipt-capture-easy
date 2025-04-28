
import { useQuery } from '@tanstack/react-query';
import { supabase } from "@/integrations/supabase/client";
import { Session } from "@supabase/supabase-js";
import { useNotify } from './useNotify';

export interface SpreadsheetInfo {
  id: string;
  name: string;
  createdTime: string;
}

export const useSpreadsheetsQuery = (session: Session | null) => {
  const notify = useNotify();

  return useQuery({
    queryKey: ['spreadsheets', session?.user?.id],
    queryFn: async () => {
      if (!session?.access_token) {
        console.log("No active session found when fetching spreadsheets list");
        return [];
      }
      
      // Check if we have provider token (Google token)
      if (!session?.provider_token) {
        console.log("No Google token available. User may need to reconnect.");
        notify.error("Autorisations Google insuffisantes. Veuillez vous reconnecter.");
        return [];
      }
      
      console.log("Fetching spreadsheets list with Google provider token");
      
      // Send both the access token (for Supabase auth) and the provider token (for Google API)
      const response = await supabase.functions.invoke('list-spreadsheets', {
        headers: { Authorization: `Bearer ${session.access_token}` },
        body: { googleToken: session.provider_token }
      });
      
      const { data, error } = response;
      
      if (error) {
        console.error("Error from list-spreadsheets function:", error);
        
        // Check HTTP status code in the response
        if (response.error?.status === 401) {
          notify.error("Autorisations Google insuffisantes. Veuillez vous reconnecter.");
          // Log out to force re-authentication with correct permissions
          await supabase.auth.signOut();
        } else {
          notify.error(`Erreur lors de la récupération des spreadsheets: ${error.message}`);
        }
        
        throw error;
      }
      
      // Check if Google Drive API needs to be activated
      if (data?.apiActivationRequired) {
        console.log("Google Drive API activation required");
        notify.error(
          "L'API Google Drive n'est pas activée",
          {
            description: "Vous devez activer l'API Google Drive dans votre console Google Cloud.",
            action: {
              label: "Activer l'API",
              onClick: () => window.open("https://console.developers.google.com/apis/api/drive.googleapis.com/overview", "_blank")
            },
            duration: 10000
          }
        );
        return [];
      }
      
      // If we have a message but no files, it's probably because no files were found
      if (data?.message && (!data.files || data.files.length === 0)) {
        console.log("Message from API:", data.message);
        notify.info(data.message);
        return [];
      }
      
      // Check returned data structure
      if (!data?.files) {
        console.error("Unexpected response format:", data);
        return [];
      }
      
      console.log("Spreadsheets list received:", data.files.length || 0, "items");
      return data.files || [];
    },
    enabled: !!session?.access_token && !!session?.provider_token,
  });
};
