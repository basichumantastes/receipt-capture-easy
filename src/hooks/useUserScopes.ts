
import { useState, useEffect } from "react";
import { Session } from "@supabase/supabase-js";
import { toast } from "sonner";

const REQUIRED_SCOPES = [
  'https://www.googleapis.com/auth/spreadsheets',
  'https://www.googleapis.com/auth/drive.readonly'
];

export const useUserScopes = (session: Session | null) => {
  const [hasRequiredScopes, setHasRequiredScopes] = useState<boolean>(false);

  // Vérifier si le token a les scopes nécessaires
  const checkScopes = (currentSession: Session | null) => {
    // Si nous avons un provider_token, considérer qu'on a les scopes (simplification)
    // Une vérification plus stricte nécessiterait de décoder le JWT ou d'appeler une API Google
    const hasToken = !!currentSession?.provider_token;
    console.log("Provider token présent:", hasToken);
    setHasRequiredScopes(hasToken);
    return hasToken;
  };

  useEffect(() => {
    if (session) {
      checkScopes(session);
    } else {
      setHasRequiredScopes(false);
    }
  }, [session]);

  return {
    hasRequiredScopes,
    requiredScopes: REQUIRED_SCOPES,
    checkScopes
  };
};
