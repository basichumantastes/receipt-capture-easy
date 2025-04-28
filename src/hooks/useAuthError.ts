
import { useNotify } from "./useNotify";

export function useAuthError() {
  const notify = useNotify();

  const handleAuthError = (error: Error, context?: string) => {
    const message = context 
      ? `${context}: ${error.message}`
      : error.message;
    
    console.error("Auth error:", message);
    notify.error(message);
  };

  return handleAuthError;
}
