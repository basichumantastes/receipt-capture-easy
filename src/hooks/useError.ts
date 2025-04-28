import { useNotify } from "./useNotify";

export type ErrorType = 'auth' | 'api' | 'validation' | 'network' | 'unknown';

export interface ErrorOptions {
  type?: ErrorType;
  context?: string;
  displayMode?: 'toast' | 'alert' | 'both';
  silent?: boolean;
}

export function useError() {
  const notify = useNotify();

  const handleError = (error: Error, options: ErrorOptions = {}) => {
    const {
      type = 'unknown',
      context,
      displayMode = 'toast',
      silent = false
    } = options;

    // Format du message d'erreur
    const message = context 
      ? `${context}: ${error.message}`
      : error.message;
    
    // Log de l'erreur (sauf si silent)
    if (!silent) {
      console.error(`[${type.toUpperCase()}] ${message}`, error);
    }

    // Affichage de l'erreur selon le mode choisi
    if (displayMode === 'toast' || displayMode === 'both') {
      notify.error(message, {
        // Durée plus longue pour les erreurs importantes
        duration: type === 'auth' || type === 'network' ? 8000 : 5000,
      });
    }

    // Retourner l'erreur formatée pour un éventuel affichage dans un composant Alert
    return {
      type,
      message,
      error
    };
  };

  return handleError;
}

// Fonction utilitaire pour vérifier si une erreur est de type AuthError
export const isAuthError = (error: any) => {
  return (
    error?.name === 'AuthError' || 
    error?.message?.toLowerCase().includes('auth') ||
    error?.message?.toLowerCase().includes('unauthorized') ||
    error?.message?.toLowerCase().includes('unauthenticated')
  );
};
