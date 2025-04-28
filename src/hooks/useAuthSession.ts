
import { useAuthToken } from "./useAuthToken";
import { useUserScopes } from "./useUserScopes";
import { useAuthError } from "./useAuthError";

export const useAuthSession = () => {
  const { 
    isAuthenticated,
    user,
    session,
    loading,
    login,
    logout,
    simulateLogin
  } = useAuthToken();

  const { hasRequiredScopes } = useUserScopes(session);
  const handleAuthError = useAuthError();

  return {
    isAuthenticated,
    user,
    session,
    loading,
    login,
    logout,
    hasRequiredScopes,
    simulateLogin,
    handleAuthError
  };
};
