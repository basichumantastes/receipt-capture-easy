
import { toast } from "sonner";
import type { ToastOptions } from "sonner";

type NotifyOpts = Partial<ToastOptions>;

export function useNotify() {
  const notify = {
    info: (message: string, options?: NotifyOpts) => {
      toast(message, { ...options });
    },
    success: (message: string, options?: NotifyOpts) => {
      toast.success(message, { ...options });
    },
    warning: (message: string, options?: NotifyOpts) => {
      toast.warning(message, { ...options });
    },
    error: (message: string, options?: NotifyOpts) => {
      toast.error(message, { ...options });
    },
  };

  return notify;
}
