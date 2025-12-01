import React from "react";
import { Snackbar, Alert, IconButton, Box } from "@mui/material";
import { Close } from "@mui/icons-material";

const SnackbarContainer = ({ snackbars, onClose }) => {
  if (!snackbars.length) return null;

  return (
    <Box
      sx={{
        position: "fixed",
        bottom: 16,
        right: 16,
        zIndex: (theme) => theme.zIndex.snackbar,
        display: "flex",
        flexDirection: "column",
        gap: 1,
        maxWidth: { xs: "calc(100vw - 32px)", sm: 400 },
      }}
    >
      {snackbars.map((snackbar, index) => (
        <Snackbar
          key={snackbar.id}
          open={snackbar.open}
          autoHideDuration={null} // We handle duration manually
          onClose={() => onClose(snackbar.id)}
          TransitionProps={{
            onExited: () => {
              // This helps clean up the snackbar after animation
            },
          }}
          sx={{
            position: "relative",
            transform: "none !important",
            // Stack snackbars with slight offset
            marginBottom: index > 0 ? 1 : 0,
          }}
          // Accessibility attributes
          aria-live={snackbar.severity === "error" ? "assertive" : "polite"}
          aria-atomic="true"
          role={snackbar.severity === "error" ? "alert" : "status"}
        >
          <Alert
            onClose={() => onClose(snackbar.id)}
            severity={snackbar.severity}
            variant="filled"
            action={
              snackbar.action || (
                <IconButton
                  size="small"
                  aria-label="close notification"
                  color="inherit"
                  onClick={() => onClose(snackbar.id)}
                >
                  <Close fontSize="small" />
                </IconButton>
              )
            }
            sx={{
              width: "100%",
              "& .MuiAlert-message": {
                width: "100%",
                wordBreak: "break-word",
              },
              // Enhanced contrast for accessibility
              "&.MuiAlert-filledSuccess": {
                backgroundColor: (theme) => theme.palette.success.dark,
              },
              "&.MuiAlert-filledError": {
                backgroundColor: (theme) => theme.palette.error.dark,
              },
              "&.MuiAlert-filledWarning": {
                backgroundColor: (theme) => theme.palette.warning.dark,
              },
              "&.MuiAlert-filledInfo": {
                backgroundColor: (theme) => theme.palette.info.dark,
              },
            }}
            // Screen reader attributes
            aria-describedby={`snackbar-message-${snackbar.id}`}
          >
            <span id={`snackbar-message-${snackbar.id}`}>
              {snackbar.message}
            </span>
          </Alert>
        </Snackbar>
      ))}
    </Box>
  );
};

export default SnackbarContainer;
