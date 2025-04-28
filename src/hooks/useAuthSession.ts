import { useState, useEffect } from "react";
import { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { clearSettingsCache } from "@/services/settingsService";

const REQUIRED_SCOPES = [
  'https://www.googleapis.com/auth/spreadsheets',
  'https://www.googleapis.com/auth/drive.readonly'
];

// Key for storing test tokens
const TEST_TOKEN_KEY = 'test_google_token';

export const useAuthSession = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [hasRequiredScopes, setHasRequiredScopes] = useState<boolean>(false);
  const isAuthenticated = !!user;

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
    console.log("Setting up auth state listener");
    
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, currentSession) => {
        console.log("Auth state changed:", event, currentSession?.user?.email);
        console.log("Provider token available:", !!currentSession?.provider_token);
        
        setSession(currentSession);
        setUser(currentSession?.user ?? null);
        
        if (currentSession) {
          const hasScopes = checkScopes(currentSession);
          if (event === 'SIGNED_IN') {
            if (hasScopes) {
              toast.success(`Connecté en tant que ${currentSession.user.email}`);
            } else {
              toast.warning("Autorisations Google insuffisantes. Veuillez vous reconnecter.");
              // Si l'utilisateur n'a pas les scopes requis, on le déconnecte
              setTimeout(() => {
                supabase.auth.signOut().then(() => {
                  toast.info("Vous avez été déconnecté en raison d'autorisations insuffisantes");
                });
              }, 2000);
            }
          }
        }
        
        if (event === 'SIGNED_OUT') {
          // Nettoyer le cache lors de la déconnexion
          clearSettingsCache();
          toast.info("Déconnecté");
          setHasRequiredScopes(false);
        }
        
        if (event === 'TOKEN_REFRESHED') {
          console.log("Token refreshed successfully");
          checkScopes(currentSession);
        }
        
        if (event === 'USER_UPDATED') {
          console.log("User updated");
          checkScopes(currentSession);
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

  const simulateLogin = (email: string, googleToken?: string) => {
    const fakeUser: User = {
      id: 'simulated-user-id',
      email: email,
      app_metadata: {},
      user_metadata: { full_name: 'Test User', name: 'Test User' },
      aud: 'authenticated',
      created_at: new Date().toISOString(),
    };
    
    // If a Google token is provided, store it for later use
    const provider_token = googleToken || localStorage.getItem(TEST_TOKEN_KEY) || 'fake-provider-token';
    
    if (googleToken) {
      localStorage.setItem(TEST_TOKEN_KEY, googleToken);
    }
    
    const fakeSession: Session = {
      access_token: 'fake-access-token',
      refresh_token: 'fake-refresh-token',
      expires_in: 3600,
      expires_at: Math.floor(Date.now() / 1000) + 3600,
      token_type: 'bearer',
      user: fakeUser,
      provider_token: provider_token,
      provider_refresh_token: 'fake-provider-refresh-token'
    };
    
    setUser(fakeUser);
    setSession(fakeSession);
    setHasRequiredScopes(!!provider_token && provider_token !== 'fake-provider-token');
    
    toast.success(`Session de test simulée pour ${email}`);
  };

  return {
    isAuthenticated,
    user,
    session,
    loading,
    login,
    logout,
    hasRequiredScopes,
    simulateLogin
  };
};
