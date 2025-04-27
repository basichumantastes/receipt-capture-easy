
import { useState, useEffect } from "react";
import { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { clearSettingsCache } from "@/services/settingsService";

// Scopes requis pour l'application
const REQUIRED_SCOPES = [
  'https://www.googleapis.com/auth/spreadsheets',
  'https://www.googleapis.com/auth/drive.readonly'
];

export const useAuthSession = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [hasRequiredScopes, setHasRequiredScopes] = useState<boolean>(false);
  const isAuthenticated = !!user;

  // Vérifier si le token a les scopes nécessaires (simplification)
  const checkScopes = (currentSession: Session | null) => {
    const hasToken = !!currentSession?.provider_token;
    console.log("Provider token présent:", hasToken);
    setHasRequiredScopes(hasToken);
    return hasToken;
  };

  useEffect(() => {
    console.log("Setting up auth state listener");
    
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, currentSession) => {
        console.log("Auth state changed:", event, currentSession?.user?.email);
        console.log("Provider token available:", !!currentSession?.provider_token);
        
        setSession(currentSession);
        setUser(currentSession?.user ?? null);
        
        if (currentSession) {
          checkScopes(currentSession);
          
          if (event === 'SIGNED_IN') {
            toast.success(`Connecté en tant que ${currentSession.user.email}`);
          }
        }
        
        if (event === 'SIGNED_OUT') {
          // Nettoyer le cache lors de la déconnexion
          clearSettingsCache();
          toast.info("Déconnecté");
          setHasRequiredScopes(false);
        }
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session: currentSession } }) => {
      console.log("Initial session check:", currentSession?.user?.email || "No session");
      console.log("Provider token available:", !!currentSession?.provider_token);
      
      setSession(currentSession);
      setUser(currentSession?.user ?? null);
      
      if (currentSession) {
        checkScopes(currentSession);
      }
      
      setLoading(false);
    });

    return () => {
      console.log("Cleaning up auth subscription");
      subscription.unsubscribe();
    };
  }, []);

  const login = async () => {
    try {
      // Forcer la déconnexion avant de se reconnecter pour s'assurer que tous les scopes sont demandés
      await supabase.auth.signOut();
      clearSettingsCache();
      
      const redirectUrl = `${window.location.origin}/login`;
      
      console.log("Redirecting to:", redirectUrl);
      console.log("Requesting scopes:", REQUIRED_SCOPES.join(' '));
      
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectUrl,
          // Demander explicitement les autorisations nécessaires
          scopes: REQUIRED_SCOPES.join(' '),
          // Forcer la demande de consentement à chaque fois pour s'assurer que les scopes sont bien demandés
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
            include_granted_scopes: 'true',
          }
        },
      });
      
      if (error) throw error;
    } catch (error: any) {
      console.error("Erreur de connexion:", error);
      toast.error(`Échec de l'authentification: ${error.message}`);
    }
  };

  const logout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      // S'assurer que le cache est nettoyé
      clearSettingsCache();
    } catch (error: any) {
      console.error("Erreur de déconnexion:", error);
      toast.error(`Échec de la déconnexion: ${error.message}`);
    }
  };

  return {
    isAuthenticated,
    user,
    session,
    loading,
    login,
    logout,
    hasRequiredScopes
  };
};
