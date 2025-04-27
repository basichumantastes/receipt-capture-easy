
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
    
    console.log("Fetching spreadsheets list with session access token");
    
    const response = await supabase.functions.invoke('list-spreadsheets', {
      headers: { Authorization: `Bearer ${session.access_token}` }
    });
    
    const { data, error } = response;
    
    if (error) {
      console.error("Error from list-spreadsheets function:", error);
      
      // Vérifier le code HTTP dans la réponse
      if (response.error?.status === 401) {
        toast.error("Autorisations Google insuffisantes. Veuillez vous reconnecter.");
        // Déconnexion pour forcer la reconnexion avec les bonnes permissions
        await supabase.auth.signOut();
      } else {
        toast.error(`Erreur lors de la récupération des spreadsheets: ${error.message}`);
      }
      
      throw error;
    }
    
    // Si nous avons un message mais pas d'erreur, c'est peut-être qu'aucun fichier n'a été trouvé
    if (data?.message && (!data.files || data.files.length === 0)) {
      console.log("Message from API:", data.message);
      toast.info(data.message);
      return [];
    }
    
    // Vérification de la structure des données retournées
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
