
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
  simulateLogin: (email: string, token?: string) => void; // Updated to accept token parameter
}

const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  user: null,
  session: null,
  loading: true,
  login: async () => {},
  logout: async () => {},
  hasRequiredScopes: false,
  simulateLogin: () => {} // Default value
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
