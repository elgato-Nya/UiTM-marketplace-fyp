// todo: recheck this file later
import React, { createContext, useContext } from "react";
import { useSnackbar as useSnackbarHook } from "../hooks/useSnackbar";
import SnackbarContainer from "../components/ui/SnackbarContainer";

const SnackbarContext = createContext(null);

export const SnackbarProvider = ({ children }) => {
  const snackbarMethods = useSnackbarHook();

  return (
    <SnackbarContext.Provider value={snackbarMethods}>
      {children}
      <SnackbarContainer
        snackbars={snackbarMethods.snackbars}
        onClose={snackbarMethods.hideSnackbar}
      />
    </SnackbarContext.Provider>
  );
};

export const useSnackbarContext = () => {
  const context = useContext(SnackbarContext);
  if (!context) {
    throw new Error(
      "useSnackbarContext must be used within a SnackbarProvider"
    );
  }
  return context;
};
