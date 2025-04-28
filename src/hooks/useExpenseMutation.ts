
import { useMutation } from '@tanstack/react-query';
import { supabase } from "@/integrations/supabase/client";
import { Session } from "@supabase/supabase-js";
import { useNotify } from './useNotify';
import { useSettingsQuery } from './useSettingsQuery';

export interface ExpenseData {
  date: string;
  commercant: string;
  montant_ttc: number;
  categorie: string;
  motif: string;
  user_id?: string;
  created_at?: string;
}

export const useSubmitExpenseMutation = (session: Session | null) => {
  const notify = useNotify();
  const { data: settings } = useSettingsQuery(session);

  return useMutation({
    mutationFn: async (expenseData: ExpenseData) => {
      if (!session?.access_token) {
        throw new Error("Vous devez être connecté pour soumettre une dépense");
      }
      
      // Check if settings are configured
      if (!settings?.spreadsheetId || !settings?.sheetName) {
        throw new Error("Veuillez configurer vos paramètres Google Sheets avant de soumettre une dépense");
      }
      
      const fullExpenseData = {
        ...expenseData,
        user_id: session.user?.id,
        created_at: new Date().toISOString()
      };
      
      console.log("Submitting expense data:", fullExpenseData);
      
      const { data, error } = await supabase.functions.invoke('submit-expense', {
        body: fullExpenseData,
        headers: {
          Authorization: `Bearer ${session.access_token}`
        }
      });
      
      if (error) {
        console.error("Error from submit-expense function:", error);
        throw new Error(error.message);
      }
      
      console.log("Submission response:", data);
      return data;
    },
    onSuccess: () => {
      notify.success("Dépense soumise avec succès", {
        description: "Votre dépense a été ajoutée à Google Sheets."
      });
    },
    onError: (error: Error) => {
      console.error("Error submitting expense:", error);
      notify.error(`Erreur lors de la soumission de la dépense: ${error.message}`);
    }
  });
};
