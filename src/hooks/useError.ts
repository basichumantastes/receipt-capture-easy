
import { useNotify } from "./useNotify";

export function useError() {
  const notify = useNotify();

  const handleError = (error: Error, context?: string) => {
    const message = context 
      ? `${context}: ${error.message}`
      : error.message;
    
    console.error(message);
    notify.error(message);
  };

  return handleError;
}
