
import { Session } from "@supabase/supabase-js";
import { toast } from "sonner";

/**
 * Configuration pour les requêtes API
 */
export interface ApiRequestConfig {
  session: Session | null;
  endpoint: string;
  method?: "GET" | "POST" | "PUT" | "DELETE";
  body?: any;
  headers?: Record<string, string>;
  mockDelay?: number;  // Délai simulé pour les données mock (en ms)
}

/**
 * Options pour la gestion des erreurs
 */
export interface ErrorHandlingOptions {
  showToast?: boolean;
  customErrorMessage?: string;
}

/**
 * Client API centralisé avec gestion des erreurs et simulation
 */
export const apiClient = {
  /**
   * Exécute une requête API avec gestion d'erreur standardisée
   */
  async request<T>(
    config: ApiRequestConfig,
    errorOptions: ErrorHandlingOptions = { showToast: true }
  ): Promise<T | null> {
    try {
      // Vérification d'authentification si nécessaire
      if (!config.session && config.endpoint !== 'public') {
        console.warn("Session non disponible pour la requête API");
        return null;
      }

      // Simuler un délai pour montrer les états de chargement en dev
      if (config.mockDelay) {
        await new Promise(resolve => setTimeout(resolve, config.mockDelay));
      }

      // Données simulées pour les tests
      if (config.endpoint === "settings/get") {
        return {
          spreadsheetId: config.session ? "1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms" : "",
          sheetName: "Dépenses"
        } as T;
      }
      
      if (config.endpoint === "sheets/list") {
        return [
          { id: "1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms", name: "Budget Annuel", createdTime: new Date().toISOString() },
          { id: "1Y2VYWpDAdLNHzSr69EH7hentVxmzEJnBrQmmuXXXXXX", name: "Dépenses Mensuelles", createdTime: new Date().toISOString() },
          { id: "14ZndruUWtSROu7gbNoJntUTNq8ojcDFvK45pH1H3no4", name: "Suivi Investissements", createdTime: new Date().toISOString() },
          { id: "1xH33tRgtI12kGXQVuBV2BZfBzxkr9bvfwnMRlFp-a_w", name: "Notes et Projets", createdTime: new Date().toISOString() },
        ] as T;
      }
      
      if (config.endpoint === "sheets/tabs") {
        return [
          { title: "Dépenses", index: 0 },
          { title: "Revenus", index: 1 },
          { title: "Résumé", index: 2 },
          { title: "Budget", index: 3 },
          { title: "Notes", index: 4 }
        ] as T;
      }
      
      if (config.endpoint === "settings/save") {
        // Simule une sauvegarde réussie
        return { success: true } as T;
      }

      if (config.endpoint === "google/status") {
        // Simule le statut de l'API Google
        return (config.session ? 0 : 1) as T; // 0 = READY, 1 = NEEDS_AUTH
      }

      // Si on arrive ici, c'est qu'on n'a pas de mock pour cette requête
      console.warn(`Pas de mock pour l'endpoint: ${config.endpoint}`);
      return null;
      
    } catch (error) {
      console.error(`Erreur lors de la requête API ${config.endpoint}:`, error);
      
      if (errorOptions.showToast) {
        toast.error(
          errorOptions.customErrorMessage || 
          "Une erreur est survenue lors de la communication avec le serveur"
        );
      }
      
      throw error;
    }
  }
};

