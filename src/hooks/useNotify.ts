
import { toast, ToasterProps } from "sonner";

type NotifyOptions = Partial<ToasterProps>;

export function useNotify() {
  const notify = {
    info: (message: string, options?: NotifyOptions) => {
      toast(message, { ...options });
    },
    success: (message: string, options?: NotifyOptions) => {
      toast.success(message, { ...options });
    },
    warning: (message: string, options?: NotifyOptions) => {
      toast.warning(message, { ...options });
    },
    error: (message: string, options?: NotifyOptions) => {
      toast.error(message, { ...options });
    },
  };

  return notify;
}
