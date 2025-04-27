
import React, { createContext, useState, useContext, useEffect } from "react";
import { toast } from "sonner";

interface User {
  id: string;
  email: string;
  name: string;
  imageUrl?: string;
}

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  token: string | null;
  login: (credential: string) => void;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  user: null,
  token: null,
  login: () => {},
  logout: () => {},
  loading: true,
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Parse token and extract user info
  const parseToken = (token: string): User | null => {
    try {
      // For demonstration, decode the JWT without verification
      // In production, token verification should happen server-side
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      
      const payload = JSON.parse(jsonPayload);
      
      return {
        id: payload.sub,
        email: payload.email,
        name: payload.name,
        imageUrl: payload.picture,
      };
    } catch (error) {
      console.error("Failed to parse token:", error);
      return null;
    }
  };

  const login = (credential: string) => {
    try {
      // Store token in localStorage
      localStorage.setItem("auth_token", credential);
      
      // Parse user from token
      const parsedUser = parseToken(credential);
      if (!parsedUser) {
        throw new Error("Invalid token format");
      }
      
      setToken(credential);
      setUser(parsedUser);
      
      toast.success(`Connecté en tant que ${parsedUser.name}`);
    } catch (error) {
      console.error("Login failed:", error);
      toast.error("Échec de l'authentification");
    }
  };

  const logout = () => {
    localStorage.removeItem("auth_token");
    setToken(null);
    setUser(null);
    toast.info("Déconnecté");
  };

  // Check for existing token on mount
  useEffect(() => {
    const storedToken = localStorage.getItem("auth_token");
    if (storedToken) {
      const parsedUser = parseToken(storedToken);
      if (parsedUser) {
        setToken(storedToken);
        setUser(parsedUser);
      } else {
        // Invalid stored token
        localStorage.removeItem("auth_token");
      }
    }
    setLoading(false);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated: !!user,
        user,
        token,
        login,
        logout,
        loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
