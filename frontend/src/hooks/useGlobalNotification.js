import { useEffect } from "react";
import { useNotification } from "../context/NotificationContext";

// Custom hook to expose notification function globally
export const useGlobalNotification = () => {
  const { addNotification } = useNotification();

  useEffect(() => {
    // Make addNotification available globally
    window.addNotification = addNotification;

    // Cleanup on unmount
    return () => {
      delete window.addNotification;
    };
  }, [addNotification]);

  return { addNotification };
};
