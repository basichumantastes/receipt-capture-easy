
import React, { createContext, useState, useContext, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Session, User } from "@supabase/supabase-js";
import { toast } from "sonner";

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  session: Session | null;
  loading: boolean;
  login: () => Promise<void>;
  logout: () => Promise<void>;
  loginAsTestUser: () => void; // Pour conserver la fonctionnalité de test
}

const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  user: null,
  session: null,
  loading: true,
  login: async () => {},
  logout: async () => {},
  loginAsTestUser: () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Définir l'écouteur d'état d'authentification
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, currentSession) => {
        setSession(currentSession);
        setUser(currentSession?.user ?? null);
        
        if (event === 'SIGNED_IN') {
          toast.success(`Connecté en tant que ${currentSession?.user.email}`);
        }
        if (event === 'SIGNED_OUT') {
          toast.info("Déconnecté");
        }
      }
    );

    // Vérifier si une session existe déjà
    supabase.auth.getSession().then(({ data: { session: currentSession } }) => {
      setSession(currentSession);
      setUser(currentSession?.user ?? null);
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const login = async () => {
    try {
      // Utiliser simplement l'URL actuelle pour la redirection
      const redirectUrl = `${window.location.origin}/login`;
      
      console.log("Redirecting to:", redirectUrl);
      
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectUrl,
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
    } catch (error: any) {
      console.error("Erreur de déconnexion:", error);
      toast.error(`Échec de la déconnexion: ${error.message}`);
    }
  };

  // Fonction de connexion de test maintenue pour compatibilité
  const loginAsTestUser = () => {
    // Cast le test user en unknown puis en User pour satisfaire TypeScript
    const testUser = {
      id: "test-user-id",
      email: "test@example.com",
      user_metadata: {
        name: "Utilisateur Test",
        avatar_url: "https://ui-avatars.com/api/?name=Test+User&background=0D8ABC&color=fff",
      },
      app_metadata: {},
      aud: "authenticated",
      created_at: new Date().toISOString()
    } as unknown as User;
    
    setUser(testUser);
    setSession({ user: testUser } as Session);
    toast.success(`Connecté en mode test en tant que Utilisateur Test`);
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated: !!user,
        user,
        session,
        login,
        logout,
        loading,
        loginAsTestUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
