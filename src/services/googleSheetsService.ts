
import { supabase } from "@/integrations/supabase/client";
import { Session } from "@supabase/supabase-js";
import { toast } from "sonner";

export interface SpreadsheetInfo {
  id: string;
  name: string;
  createdTime: string;
}

export async function listSpreadsheets(session: Session | null): Promise<SpreadsheetInfo[] | null> {
  try {
    if (!session?.access_token) {
      console.log("No active session found when fetching spreadsheets list");
      return null;
    }
    
    // Check if we have provider token (Google token)
    if (!session?.provider_token) {
      console.log("No Google token available. User may need to reconnect.");
      toast.error("Autorisations Google insuffisantes. Veuillez vous reconnecter.");
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
        toast.error("Autorisations Google insuffisantes. Veuillez vous reconnecter.");
        // Log out to force re-authentication with correct permissions
        await supabase.auth.signOut();
      } else {
        toast.error(`Erreur lors de la récupération des spreadsheets: ${error.message}`);
      }
      
      throw error;
    }
    
    // If we have a message but no files, it's probably because no files were found
    if (data?.message && (!data.files || data.files.length === 0)) {
      console.log("Message from API:", data.message);
      toast.info(data.message);
      return [];
    }
    
    // Check returned data structure
    if (!data?.files) {
      console.error("Unexpected response format:", data);
      return [];
    }
    
    console.log("Spreadsheets list received:", data.files.length || 0, "items");
    return data.files || [];
  } catch (error: any) {
    console.error("Error fetching spreadsheets list:", error);
    toast.error(`Erreur: ${error.message || "Échec de la récupération des Google Sheets"}`);
    return [];
  }
}
