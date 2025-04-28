
import { toast } from "sonner";

// Use a more generic type since ToastOptions isn't exported
type NotifyOpts = {
  description?: React.ReactNode;
  action?: {
    label: string;
    onClick: () => void;
  };
  duration?: number;
  id?: string | number;
  onDismiss?: () => void;
  onAutoClose?: () => void;
  cancel?: boolean;
};

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
