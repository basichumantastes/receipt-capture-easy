import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Session } from "@supabase/supabase-js";
import { useNotify } from "./useNotify";
import { useError } from "./useError";
import { queryClient } from "@/lib/queryClient";

export interface Settings {
  spreadsheetId?: string;
  sheetName?: string;
}

// Cache des paramètres pour éviter des appels inutiles
let settingsCache: Settings | null = null;

export const useSettingsQuery = (session: Session | null) => {
  const handleError = useError();

  return useQuery({
    queryKey: ["settings"],
    queryFn: async () => {
      if (!session?.access_token) {
        throw new Error("Vous devez être connecté pour accéder aux paramètres");
      }

      // Utiliser le cache si disponible
      if (settingsCache) {
        return settingsCache;
      }

      const { data: existingSettings, error } = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/get-settings`, {
        headers: { Authorization: `Bearer ${session.access_token}` }
      }).then(res => res.json());
      
      if (error) {
        throw error;
      }

      // Cache les paramètres pour utilisation future
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
  const handleError = useError();

  return useMutation({
    mutationFn: async (data: Settings) => {
      if (!session?.access_token) {
        throw new Error("Vous devez être connecté pour sauvegarder les paramètres");
      }

      // Valider les champs requis
      if (!data.spreadsheetId || !data.sheetName) {
        throw new Error("L'ID du Google Sheets et le nom de la feuille sont obligatoires");
      }

      // Sauvegarder les paramètres
      const { error } = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/save-settings`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${session.access_token}`
          },
          body: JSON.stringify(data)
        }
      ).then(res => res.json());

      if (error) {
        throw error;
      }

      // Mettre à jour les variables d'environnement
      try {
        await fetch(
          `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/update-env-vars`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${session.access_token}`
            },
            body: JSON.stringify({
              SPREADSHEET_ID: data.spreadsheetId,
              SHEET_NAME: data.sheetName
            })
          }
        ).then(res => res.json());
      } catch (envUpdateError) {
        handleError(envUpdateError as Error, {
          type: 'api',
          context: "Mise à jour des variables d'environnement",
          displayMode: 'toast'
        });
        // Erreur non critique, on continue
      }

      return data;
    },
    onSuccess: () => {
      notify.success("Paramètres sauvegardés", {
        description: "Vos paramètres Google Sheets ont été mis à jour avec succès."
      });
      
      // Invalider la requête de paramètres pour forcer un rechargement
      queryClient.invalidateQueries({ queryKey: ['settings'] });
    }
  });
};

// Fonction pour vider le cache des paramètres (utile lors de la déconnexion)
export const clearSettingsCache = () => {
  settingsCache = null;
};
