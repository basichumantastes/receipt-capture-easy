
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
    
    // Simuler un test API
    await new Promise(resolve => setTimeout(resolve, 500));
    
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
    
    // Simuler le chargement des onglets
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // Données de test
    const worksheetsMock: WorksheetInfo[] = [
      { title: "Dépenses", index: 0 },
      { title: "Revenus", index: 1 },
      { title: "Résumé", index: 2 },
      { title: "Budget", index: 3 },
      { title: "Notes", index: 4 }
    ];
    
    return worksheetsMock;
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
    
    // Simuler le chargement des spreadsheets
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Données de test
    const spreadsheetsMock: SpreadsheetInfo[] = [
      { id: "1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms", name: "Budget Annuel", createdTime: new Date().toISOString() },
      { id: "1Y2VYWpDAdLNHzSr69EH7hentVxmzEJnBrQmmuXXXXXX", name: "Dépenses Mensuelles", createdTime: new Date().toISOString() },
      { id: "14ZndruUWtSROu7gbNoJntUTNq8ojcDFvK45pH1H3no4", name: "Suivi Investissements", createdTime: new Date().toISOString() },
      { id: "1xH33tRgtI12kGXQVuBV2BZfBzxkr9bvfwnMRlFp-a_w", name: "Notes et Projets", createdTime: new Date().toISOString() },
    ];
    
    return spreadsheetsMock;
  } catch (error: any) {
    console.error("Error fetching spreadsheets list:", error);
    toast.error(`Erreur: ${error.message || "Échec de la récupération des Google Sheets"}`);
    return [];
  }
}
