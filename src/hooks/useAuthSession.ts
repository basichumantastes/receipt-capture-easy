import { useAuthToken } from "./useAuthToken";
import { useUserScopes } from "./useUserScopes";

export const useAuthSession = () => {
  const { 
    isAuthenticated,
    user,
    session,
    loading,
    login,
    logout
  } = useAuthToken();

  const { hasRequiredScopes } = useUserScopes(session);

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
