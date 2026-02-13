"use client";

import { Toaster } from "sonner";

export const ToastProvider = () => {
  return (
    <Toaster
      position="top-center"
      theme="dark"
      richColors={false}
      closeButton
      toastOptions={{
        classNames: {
          toast: "app-toast",
          title: "app-toast-title",
          description: "app-toast-description",
          icon: "app-toast-icon",
          closeButton: "app-toast-close",
          actionButton: "app-toast-action",
          cancelButton: "app-toast-cancel",
          success: "app-toast-success",
          error: "app-toast-error",
          info: "app-toast-info",
          warning: "app-toast-warning",
          loading: "app-toast-loading"
        }
      }}
    />
  );
};
