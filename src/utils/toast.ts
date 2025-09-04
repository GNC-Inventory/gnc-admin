// src/utils/toast.ts
import toast from 'react-hot-toast';

// Success toast with checkmark icon
export const showSuccessToast = (message: string) => {
  return toast.success(message, {
    duration: 3000,
    style: {
      background: '#f0fdf4',
      color: '#166534',
      border: '1px solid #bbf7d0',
      fontWeight: '500',
    },
    iconTheme: {
      primary: '#22c55e',
      secondary: '#f0fdf4',
    },
  });
};

// Error toast with X icon
export const showErrorToast = (message: string) => {
  return toast.error(message, {
    duration: 5000,
    style: {
      background: '#fef2f2',
      color: '#dc2626',
      border: '1px solid #fecaca',
      fontWeight: '500',
    },
    iconTheme: {
      primary: '#ef4444',
      secondary: '#fef2f2',
    },
  });
};

// Warning toast with warning icon
export const showWarningToast = (message: string) => {
  return toast(message, {
    duration: 4000,
    icon: '⚠️',
    style: {
      background: '#fffbeb',
      color: '#d97706',
      border: '1px solid #fed7aa',
      fontWeight: '500',
    },
  });
};

// Info toast with info icon
export const showInfoToast = (message: string) => {
  return toast(message, {
    duration: 4000,
    icon: 'ℹ️',
    style: {
      background: '#eff6ff',
      color: '#1e40af',
      border: '1px solid #dbeafe',
      fontWeight: '500',
    },
  });
};

// Loading toast with spinner
export const showLoadingToast = (message: string) => {
  return toast.loading(message, {
    style: {
      background: '#eff6ff',
      color: '#1e40af',
      border: '1px solid #dbeafe',
      fontWeight: '500',
    },
    iconTheme: {
      primary: '#3b82f6',
      secondary: '#eff6ff',
    },
  });
};

// Promise toast for async operations
export const showPromiseToast = (
  promise: Promise<any>,
  messages: {
    loading: string;
    success: string;
    error: string;
  }
) => {
  return toast.promise(promise, {
    loading: messages.loading,
    success: messages.success,
    error: messages.error,
  }, {
    style: {
      minWidth: '250px',
    },
    success: {
      duration: 3000,
      style: {
        background: '#f0fdf4',
        color: '#166534',
        border: '1px solid #bbf7d0',
      },
    },
    error: {
      duration: 5000,
      style: {
        background: '#fef2f2',
        color: '#dc2626',
        border: '1px solid #fecaca',
      },
    },
    loading: {
      style: {
        background: '#eff6ff',
        color: '#1e40af',
        border: '1px solid #dbeafe',
      },
    },
  });
};

// Custom toast with custom styling
export const showCustomToast = (
  message: string,
  options?: {
    icon?: string;
    duration?: number;
    backgroundColor?: string;
    textColor?: string;
    borderColor?: string;
  }
) => {
  return toast(message, {
    duration: options?.duration || 4000,
    icon: options?.icon,
    style: {
      background: options?.backgroundColor || '#fff',
      color: options?.textColor || '#333',
      border: `1px solid ${options?.borderColor || '#e5e7eb'}`,
      fontWeight: '500',
    },
  });
};

// Dismiss all toasts
export const dismissAllToasts = () => {
  toast.dismiss();
};

// Dismiss specific toast by ID
export const dismissToast = (toastId: string) => {
  toast.dismiss(toastId);
};