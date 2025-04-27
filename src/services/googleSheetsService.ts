
import { supabase } from "@/integrations/supabase/client";
import { Session } from "@supabase/supabase-js";
import { toast } from "sonner";

export interface SpreadsheetInfo {
  id: string;
  name: string;
  createdTime: string;
}

// Configuration status
export enum GoogleApiStatus {
  READY,
  NEEDS_AUTH,
  NEEDS_API_ACTIVATION,
  ERROR
}

/**
 * Check if Google APIs are properly configured
 */
export async function checkGoogleApiStatus(session: Session | null): Promise<GoogleApiStatus> {
  try {
    if (!session?.access_token) {
      return GoogleApiStatus.NEEDS_AUTH;
    }
    
    if (!session?.provider_token) {
      return GoogleApiStatus.NEEDS_AUTH;
    }
    
    // Perform a test request to see if APIs are configured
    const response = await supabase.functions.invoke('list-spreadsheets', {
      headers: { Authorization: `Bearer ${session.access_token}` },
      body: { googleToken: session.provider_token, testMode: true }
    });
    
    if (response.error) {
      console.error("API status check error:", response.error);
      return GoogleApiStatus.ERROR;
    }
    
    if (response.data?.apiActivationRequired) {
      return GoogleApiStatus.NEEDS_API_ACTIVATION;
    }
    
    return GoogleApiStatus.READY;
  } catch (error) {
    console.error("Failed to check API status:", error);
    return GoogleApiStatus.ERROR;
  }
}

export interface WorksheetInfo {
  title: string;
  index: number;
}

/**
 * Fetch list of worksheets/tabs for a specific spreadsheet
 */
export async function listWorksheets(session: Session | null, spreadsheetId: string): Promise<WorksheetInfo[] | null> {
  try {
    if (!session?.access_token || !spreadsheetId) {
      console.log("No active session or spreadsheet ID found when fetching worksheets list");
      return null;
    }
    
    if (!session?.provider_token) {
      console.log("No Google token available. User may need to reconnect.");
      toast.error("Autorisations Google insuffisantes. Veuillez vous reconnecter.");
      return [];
    }
    
    console.log("Fetching worksheets for spreadsheet ID:", spreadsheetId);
    
    const response = await supabase.functions.invoke('list-worksheets', {
      headers: { Authorization: `Bearer ${session.access_token}` },
      body: { 
        googleToken: session.provider_token,
        spreadsheetId 
      }
    }).catch(err => {
      console.error("Error invoking list-worksheets function:", err);
      throw new Error("Erreur lors de la communication avec le serveur");
    });
    
    const { data, error } = response;
    
    if (error) {
      console.error("Error from list-worksheets function:", error);
      throw error;
    }
    
    if (!data?.sheets) {
      return [];
    }
    
    return data.sheets;
  } catch (error: any) {
    console.error("Error fetching worksheets list:", error);
    toast.error(`Erreur: ${error.message || "Échec de la récupération des onglets"}`);
    return [];
  }
}

/**
 * Fetch list of Google Spreadsheets
 */
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
    }).catch(err => {
      console.error("Error invoking list-spreadsheets function:", err);
      throw new Error("Erreur lors de la communication avec le serveur");
    });
    
    const { data, error } = response;
    
    if (error) {
      console.error("Error from list-spreadsheets function:", error);
      
      if (response.error?.status === 401) {
        toast.error("Session expirée. Veuillez vous reconnecter.");
        await supabase.auth.signOut();
      } else {
        toast.error("Erreur lors de la récupération des spreadsheets");
      }
      
      throw error;
    }
    
    // Check if Google Drive API needs to be activated
    if (data?.apiActivationRequired) {
      console.log("Google Drive API activation required");
      return [];
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
