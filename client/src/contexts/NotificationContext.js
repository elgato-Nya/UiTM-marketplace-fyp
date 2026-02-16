import React, { createContext, useContext } from "react";
import { useNotifications } from "../hooks/useNotifications";
import { useAuth } from "../features/auth/hooks/useAuth";

const NotificationContext = createContext(null);

export const NotificationProvider = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const notificationState = useNotifications(isAuthenticated);

  return (
    <NotificationContext.Provider value={notificationState}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotificationContext = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error(
      "useNotificationContext must be used within a NotificationProvider"
    );
  }
  return context;
};
