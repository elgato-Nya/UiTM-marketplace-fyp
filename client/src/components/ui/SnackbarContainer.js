import React from "react";
import {
  Box,
  Typography,
  IconButton,
  Button,
  Slide,
  Fade,
} from "@mui/material";
import {
  Close,
  Refresh as RefreshIcon,
  CheckCircleOutline,
  ErrorOutline,
  WarningAmberOutlined,
  InfoOutlined,
} from "@mui/icons-material";
import { useTheme } from "../../hooks/useTheme";

/**
 * SnackbarContainer Component
 *
 * PURPOSE: Display stacked toast notifications with modern enterprise design
 *
 * FEATURES:
 * - Minimalist, modern design with glass morphism effect
 * - Multiple toast support with smooth stacking
 * - Theme-aware (light/dark mode support)
 * - Enhanced error display with hints
 * - Retry action support for recoverable errors
 * - Accessibility compliant
 * - Smooth slide-in/fade animations
 * - Progress bar for auto-dismiss timing
 */
const SnackbarContainer = ({ snackbars, onClose }) => {
  const { isDark } = useTheme();

  if (!snackbars.length) return null;

  // Severity config with theme-aware colors
  const severityConfig = {
    success: {
      icon: CheckCircleOutline,
      accentColor: isDark ? "#4ade80" : "#22c55e",
      bgGradient: isDark
        ? "linear-gradient(135deg, rgba(34, 197, 94, 0.15) 0%, rgba(34, 197, 94, 0.05) 100%)"
        : "linear-gradient(135deg, rgba(34, 197, 94, 0.12) 0%, rgba(34, 197, 94, 0.04) 100%)",
      borderColor: isDark
        ? "rgba(74, 222, 128, 0.3)"
        : "rgba(34, 197, 94, 0.25)",
    },
    error: {
      icon: ErrorOutline,
      accentColor: isDark ? "#f87171" : "#ef4444",
      bgGradient: isDark
        ? "linear-gradient(135deg, rgba(239, 68, 68, 0.15) 0%, rgba(239, 68, 68, 0.05) 100%)"
        : "linear-gradient(135deg, rgba(239, 68, 68, 0.12) 0%, rgba(239, 68, 68, 0.04) 100%)",
      borderColor: isDark
        ? "rgba(248, 113, 113, 0.3)"
        : "rgba(239, 68, 68, 0.25)",
    },
    warning: {
      icon: WarningAmberOutlined,
      accentColor: isDark ? "#fbbf24" : "#f59e0b",
      bgGradient: isDark
        ? "linear-gradient(135deg, rgba(245, 158, 11, 0.15) 0%, rgba(245, 158, 11, 0.05) 100%)"
        : "linear-gradient(135deg, rgba(245, 158, 11, 0.12) 0%, rgba(245, 158, 11, 0.04) 100%)",
      borderColor: isDark
        ? "rgba(251, 191, 36, 0.3)"
        : "rgba(245, 158, 11, 0.25)",
    },
    info: {
      icon: InfoOutlined,
      accentColor: isDark ? "#60a5fa" : "#3b82f6",
      bgGradient: isDark
        ? "linear-gradient(135deg, rgba(59, 130, 246, 0.15) 0%, rgba(59, 130, 246, 0.05) 100%)"
        : "linear-gradient(135deg, rgba(59, 130, 246, 0.12) 0%, rgba(59, 130, 246, 0.04) 100%)",
      borderColor: isDark
        ? "rgba(96, 165, 250, 0.3)"
        : "rgba(59, 130, 246, 0.25)",
    },
  };

  // Render message content (supports string or object with hint)
  const renderMessage = (snackbar, config) => {
    const message = snackbar.message;
    const hint = snackbar.hint;

    return (
      <Box id={`toast-message-${snackbar.id}`} sx={{ flex: 1 }}>
        <Typography
          variant="body2"
          sx={{
            fontWeight: 500,
            color: isDark ? "rgba(255, 255, 255, 0.95)" : "rgba(0, 0, 0, 0.87)",
            lineHeight: 1.5,
            letterSpacing: "-0.01em",
          }}
        >
          {typeof message === "string"
            ? message
            : message?.text || "An error occurred"}
        </Typography>
        {hint && (
          <Typography
            variant="caption"
            sx={{
              display: "block",
              mt: 0.5,
              color: isDark
                ? "rgba(255, 255, 255, 0.6)"
                : "rgba(0, 0, 0, 0.55)",
              fontWeight: 400,
              lineHeight: 1.4,
            }}
          >
            💡 {hint}
          </Typography>
        )}
      </Box>
    );
  };

  // Build action element
  const buildAction = (snackbar, config) => {
    const actions = [];

    // Retry action if provided
    if (snackbar.onRetry) {
      actions.push(
        <Button
          key="retry"
          size="small"
          onClick={() => {
            snackbar.onRetry();
            onClose(snackbar.id);
          }}
          startIcon={<RefreshIcon sx={{ fontSize: "16px !important" }} />}
          sx={{
            mr: 0.5,
            minWidth: "auto",
            px: 1.5,
            py: 0.5,
            fontSize: "12px",
            fontWeight: 500,
            textTransform: "none",
            borderRadius: "6px",
            color: config.accentColor,
            backgroundColor: isDark
              ? "rgba(255, 255, 255, 0.08)"
              : "rgba(0, 0, 0, 0.04)",
            "&:hover": {
              backgroundColor: isDark
                ? "rgba(255, 255, 255, 0.12)"
                : "rgba(0, 0, 0, 0.08)",
            },
          }}
        >
          Retry
        </Button>
      );
    }

    // Custom action if provided
    if (snackbar.action) {
      if (typeof snackbar.action === "object" && snackbar.action.label) {
        actions.push(
          <Button
            key="custom"
            size="small"
            onClick={() => {
              snackbar.action.onClick?.();
              if (snackbar.action.closeOnClick !== false) {
                onClose(snackbar.id);
              }
            }}
            sx={{
              mr: 0.5,
              minWidth: "auto",
              px: 1.5,
              py: 0.5,
              fontSize: "12px",
              fontWeight: 500,
              textTransform: "none",
              borderRadius: "6px",
              color: config.accentColor,
              backgroundColor: isDark
                ? "rgba(255, 255, 255, 0.08)"
                : "rgba(0, 0, 0, 0.04)",
              "&:hover": {
                backgroundColor: isDark
                  ? "rgba(255, 255, 255, 0.12)"
                  : "rgba(0, 0, 0, 0.08)",
              },
            }}
          >
            {snackbar.action.label}
          </Button>
        );
      } else if (React.isValidElement(snackbar.action)) {
        actions.push(snackbar.action);
      }
    }

    // Close button
    actions.push(
      <IconButton
        key="close"
        size="small"
        aria-label="close notification"
        onClick={() => onClose(snackbar.id)}
        sx={{
          p: 0.5,
          color: isDark ? "rgba(255, 255, 255, 0.5)" : "rgba(0, 0, 0, 0.4)",
          "&:hover": {
            color: isDark ? "rgba(255, 255, 255, 0.8)" : "rgba(0, 0, 0, 0.7)",
            backgroundColor: isDark
              ? "rgba(255, 255, 255, 0.08)"
              : "rgba(0, 0, 0, 0.04)",
          },
        }}
      >
        <Close sx={{ fontSize: 18 }} />
      </IconButton>
    );

    return (
      <Box sx={{ display: "flex", alignItems: "center", ml: 1 }}>{actions}</Box>
    );
  };

  return (
    <Box
      sx={{
        position: "fixed",
        bottom: { xs: 16, sm: 24 },
        right: { xs: 16, sm: 24 },
        zIndex: (theme) => theme.zIndex.snackbar + 100,
        display: "flex",
        flexDirection: "column-reverse",
        gap: 1.5,
        maxWidth: { xs: "calc(100vw - 32px)", sm: 420 },
        pointerEvents: "none",
      }}
    >
      {snackbars.map((snackbar, index) => {
        const severity = snackbar.severity || "info";
        const config = severityConfig[severity] || severityConfig.info;
        const IconComponent = config.icon;

        return (
          <Slide
            key={snackbar.id}
            direction="left"
            in={snackbar.open}
            mountOnEnter
            unmountOnExit
          >
            <Box
              role={severity === "error" ? "alert" : "status"}
              aria-live={severity === "error" ? "assertive" : "polite"}
              aria-atomic="true"
              aria-describedby={`toast-message-${snackbar.id}`}
              sx={{
                pointerEvents: "auto",
                display: "flex",
                alignItems: "flex-start",
                gap: 1.5,
                p: 2,
                borderRadius: "12px",
                background: isDark
                  ? "rgba(30, 30, 35, 0.95)"
                  : "rgba(255, 255, 255, 0.98)",
                backdropFilter: "blur(20px)",
                WebkitBackdropFilter: "blur(20px)",
                border: `1px solid ${config.borderColor}`,
                boxShadow: isDark
                  ? `0 4px 24px rgba(0, 0, 0, 0.4), 
                     0 1px 3px rgba(0, 0, 0, 0.2),
                     inset 0 1px 0 rgba(255, 255, 255, 0.05)`
                  : `0 4px 24px rgba(0, 0, 0, 0.08), 
                     0 1px 3px rgba(0, 0, 0, 0.04),
                     inset 0 1px 0 rgba(255, 255, 255, 0.9)`,
                transform: "translateZ(0)",
                willChange: "transform, opacity",
                position: "relative",
                overflow: "hidden",
                "&::before": {
                  content: '""',
                  position: "absolute",
                  left: 0,
                  top: 0,
                  bottom: 0,
                  width: "3px",
                  background: config.accentColor,
                  borderRadius: "3px 0 0 3px",
                },
              }}
            >
              {/* Icon */}
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: 32,
                  height: 32,
                  borderRadius: "8px",
                  background: config.bgGradient,
                  flexShrink: 0,
                }}
              >
                <IconComponent
                  sx={{
                    fontSize: 18,
                    color: config.accentColor,
                  }}
                />
              </Box>

              {/* Content */}
              {renderMessage(snackbar, config)}

              {/* Actions */}
              {buildAction(snackbar, config)}
            </Box>
          </Slide>
        );
      })}
    </Box>
  );
};

export default SnackbarContainer;
