
import React, { createContext, useContext } from "react";
import { Session, User } from "@supabase/supabase-js";
import { useAuthSession } from "@/hooks/useAuthSession";

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  session: Session | null;
  loading: boolean;
  login: () => Promise<void>;
  logout: () => Promise<void>;
  hasRequiredScopes: boolean;
  simulateLogin: (email: string) => void; // Nouvelle fonction pour simuler la connexion
}

const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  user: null,
  session: null,
  loading: true,
  login: async () => {},
  logout: async () => {},
  hasRequiredScopes: false,
  simulateLogin: () => {} // Valeur par défaut
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const auth = useAuthSession();
  
  return (
    <AuthContext.Provider value={auth}>
      {children}
    </AuthContext.Provider>
  );
};
