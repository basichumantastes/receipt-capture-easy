
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

  // Vérifier si le token a les scopes nécessaires
  const checkScopes = (currentSession: Session | null) => {
    const hasToken = !!currentSession?.provider_token;
    setHasRequiredScopes(hasToken);
    return hasToken;
  };

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, currentSession) => {
        setSession(currentSession);
        setUser(currentSession?.user ?? null);
        
        if (currentSession) {
          checkScopes(currentSession);
          
          if (event === 'SIGNED_IN') {
            toast.success(`Connecté en tant que ${currentSession.user.email}`);
          }
        }
        
        if (event === 'SIGNED_OUT') {
          clearSettingsCache();
          setHasRequiredScopes(false);
        }
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session: currentSession } }) => {
      setSession(currentSession);
      setUser(currentSession?.user ?? null);
      
      if (currentSession) {
        checkScopes(currentSession);
      }
      
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const login = async () => {
    try {
      // Forcer la déconnexion avant de se reconnecter pour s'assurer que tous les scopes sont demandés
      await supabase.auth.signOut();
      clearSettingsCache();
      
      const redirectUrl = `${window.location.origin}/login`;
      
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectUrl,
          scopes: REQUIRED_SCOPES.join(' '),
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
      if (!session) {
        setSession(null);
        setUser(null);
        clearSettingsCache();
        return;
      }
      
      const { error } = await supabase.auth.signOut();
      
      if (error) throw error;
      
      clearSettingsCache();
    } catch (error: any) {
      console.error("Erreur de déconnexion:", error);
      
      // Nettoyer l'état local en cas d'erreur
      setSession(null);
      setUser(null);
      clearSettingsCache();
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
