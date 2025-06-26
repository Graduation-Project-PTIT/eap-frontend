import { toast as sonnerToast } from "sonner";

// Common toast configurations
const defaultOptions = {
  duration: 3000,
  position: "top-center" as const,
};

// Success toast with consistent styling
export const toast = {
  success: (message: string, options?: { description?: string; duration?: number }) => {
    return sonnerToast.success(message, {
      ...defaultOptions,
      description: options?.description,
      duration: options?.duration || defaultOptions.duration,
    });
  },

  error: (message: string, options?: { description?: string; duration?: number }) => {
    return sonnerToast.error(message, {
      ...defaultOptions,
      description: options?.description,
      duration: options?.duration || 5000, // Longer duration for errors
    });
  },

  warning: (message: string, options?: { description?: string; duration?: number }) => {
    return sonnerToast.warning(message, {
      ...defaultOptions,
      description: options?.description,
      duration: options?.duration || defaultOptions.duration,
    });
  },

  info: (message: string, options?: { description?: string; duration?: number }) => {
    return sonnerToast.info(message, {
      ...defaultOptions,
      description: options?.description,
      duration: options?.duration || defaultOptions.duration,
    });
  },

  // Generic toast
  message: (message: string, options?: { description?: string; duration?: number }) => {
    return sonnerToast(message, {
      ...defaultOptions,
      description: options?.description,
      duration: options?.duration || defaultOptions.duration,
    });
  },

  // Loading toast
  loading: (message: string, options?: { description?: string }) => {
    return sonnerToast.loading(message, {
      ...defaultOptions,
      description: options?.description,
    });
  },

  // Promise toast for async operations
  promise: <T>(
    promise: Promise<T>,
    options: {
      loading: string;
      success: string | ((data: T) => string);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      error: string | ((error: any) => string);
      description?: string;
    },
  ) => {
    return sonnerToast.promise(promise, {
      loading: options.loading,
      success: options.success,
      error: options.error,
      description: options.description,
    });
  },

  // Dismiss all toasts
  dismiss: (toastId?: string | number) => {
    return sonnerToast.dismiss(toastId);
  },
};

// Export individual functions for convenience
export const { success, error, warning, info, message, loading, promise, dismiss } = toast;

// Default export
export default toast;
