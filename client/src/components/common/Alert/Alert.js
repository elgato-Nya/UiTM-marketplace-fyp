import {
  Alert as MuiAlert,
  AlertTitle,
  Collapse,
  IconButton,
} from "@mui/material";
import { Close as CloseIcon } from "@mui/icons-material";
import { useState } from "react";

/**
 * Reusable Alert Component
 *
 * A wrapper around MUI Alert with common patterns and auto-dismiss functionality
 *
 * @param {Object} props
 * @param {string} props.severity - "error" | "warning" | "info" | "success"
 * @param {string} props.title - Optional alert title
 * @param {string|React.ReactNode} props.message - Alert message content
 * @param {boolean} props.show - Control visibility (for conditional rendering)
 * @param {boolean} props.dismissible - Show close button (default: true)
 * @param {number} props.autoDismiss - Auto-dismiss after ms (0 = no auto-dismiss)
 * @param {function} props.onClose - Callback when dismissed
 * @param {Object} props.sx - Additional MUI sx props
 */
const Alert = ({
  severity = "info",
  title = null,
  message = "",
  show = true,
  dismissible = true,
  autoDismiss = 0,
  onClose = null,
  sx = {},
  children,
  ...props
}) => {
  const [visible, setVisible] = useState(true);

  // Auto-dismiss timer
  useState(() => {
    if (autoDismiss > 0 && show) {
      const timer = setTimeout(() => {
        handleClose();
      }, autoDismiss);

      return () => clearTimeout(timer);
    }
  }, [autoDismiss, show]);

  const handleClose = () => {
    setVisible(false);
    onClose?.();
  };

  // Don't render if show is false or dismissed
  if (!show || !visible) return null;

  return (
    <Collapse in={visible}>
      <MuiAlert
        severity={severity}
        sx={{
          mb: 3,
          ...sx,
        }}
        action={
          dismissible && (
            <IconButton
              aria-label="close"
              color="inherit"
              size="small"
              onClick={handleClose}
            >
              <CloseIcon fontSize="inherit" />
            </IconButton>
          )
        }
        {...props}
      >
        {title && <AlertTitle>{title}</AlertTitle>}
        {children || message}
      </MuiAlert>
    </Collapse>
  );
};

export default Alert;
