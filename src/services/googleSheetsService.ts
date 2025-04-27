
import { supabase } from "@/integrations/supabase/client";
import { Session } from "@supabase/supabase-js";

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
    
    const { data, error } = await supabase.functions.invoke('list-spreadsheets', {
      headers: { Authorization: `Bearer ${session.access_token}` }
    });
    
    if (error) {
      console.error("Error from list-spreadsheets function:", error);
      throw error;
    }
    
    console.log("Spreadsheets list received:", data?.files?.length || 0, "items");
    return data?.files || [];
  } catch (error) {
    console.error("Error fetching spreadsheets list:", error);
    return null;
  }
}
