import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemText,
  Button,
  IconButton,
} from "@mui/material";
import {
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Refresh as RefreshIcon,
  ErrorOutline as ErrorIcon,
  WarningAmberOutlined as WarningIcon,
  CloudOff as NetworkIcon,
  Close as CloseIcon,
  InfoOutlined as InfoIcon,
} from "@mui/icons-material";
import { useState } from "react";
import { useTheme } from "../../../hooks/useTheme";
import {
  parseError,
  ErrorType,
  isRecoverableError,
} from "../../../utils/errorUtils";

const ErrorAlert = ({
  error,
  message = null,
  fallback = "An error occurred. Please try again.",
  onRetry = null,
  onDismiss = null,
  showDetails = true,
  showRetry = true,
  compact = false,
  severity: customSeverity = null,
  ...props
}) => {
  const { isDark } = useTheme();
  const [detailsExpanded, setDetailsExpanded] = useState(true);

  if (!error) return null;

  const parsedError = parseError(error);
  const displayMessage = message || parsedError.message || fallback;
  const validationErrors = parsedError.validationErrors;
  const hasValidationErrors =
    validationErrors &&
    Array.isArray(validationErrors) &&
    validationErrors.length > 0;
  const hint = parsedError.hint;
  const canRetry = showRetry && onRetry && isRecoverableError(error);

  const severityConfig = {
    error: {
      icon: ErrorIcon,
      iconColor: isDark ? "#fca5a5" : "#dc2626",
      bgColor: isDark ? "rgba(127, 29, 29, 0.5)" : "#fef2f2",
      borderColor: isDark ? "rgba(248, 113, 113, 0.5)" : "#fecaca",
      textColor: isDark ? "#fca5a5" : "#991b1b",
      mutedText: isDark ? "rgba(252, 165, 165, 0.8)" : "#b91c1c",
      fieldBg: isDark ? "rgba(0, 0, 0, 0.3)" : "rgba(220, 38, 38, 0.06)",
    },
    warning: {
      icon: WarningIcon,
      iconColor: isDark ? "#fcd34d" : "#d97706",
      bgColor: isDark ? "rgba(120, 53, 15, 0.5)" : "#fffbeb",
      borderColor: isDark ? "rgba(252, 211, 77, 0.5)" : "#fde68a",
      textColor: isDark ? "#fcd34d" : "#92400e",
      mutedText: isDark ? "rgba(252, 211, 77, 0.8)" : "#b45309",
      fieldBg: isDark ? "rgba(0, 0, 0, 0.3)" : "rgba(217, 119, 6, 0.06)",
    },
    info: {
      icon: InfoIcon,
      iconColor: isDark ? "#93c5fd" : "#2563eb",
      bgColor: isDark ? "rgba(30, 58, 138, 0.5)" : "#eff6ff",
      borderColor: isDark ? "rgba(147, 197, 253, 0.5)" : "#bfdbfe",
      textColor: isDark ? "#93c5fd" : "#1e40af",
      mutedText: isDark ? "rgba(147, 197, 253, 0.8)" : "#1d4ed8",
      fieldBg: isDark ? "rgba(0, 0, 0, 0.3)" : "rgba(37, 99, 235, 0.06)",
    },
    network: {
      icon: NetworkIcon,
      iconColor: isDark ? "#fcd34d" : "#d97706",
      bgColor: isDark ? "rgba(120, 53, 15, 0.5)" : "#fffbeb",
      borderColor: isDark ? "rgba(252, 211, 77, 0.5)" : "#fde68a",
      textColor: isDark ? "#fcd34d" : "#92400e",
      mutedText: isDark ? "rgba(252, 211, 77, 0.8)" : "#b45309",
      fieldBg: isDark ? "rgba(0, 0, 0, 0.3)" : "rgba(217, 119, 6, 0.06)",
    },
  };

  const getSeverity = () => {
    if (customSeverity) return customSeverity;
    switch (parsedError.type) {
      case ErrorType.NETWORK:
        return "network";
      case ErrorType.RATE_LIMIT:
        return "warning";
      case ErrorType.VALIDATION:
        return "error";
      default:
        return "error";
    }
  };

  const severity = getSeverity();
  const config = severityConfig[severity] || severityConfig.error;
  const IconComponent = config.icon;

  const formatFieldName = (field) => {
    if (!field || field === "unknown") return "Field";
    return field
      .replace(/([A-Z])/g, " $1")
      .replace(/[._-]/g, " ")
      .replace(/^\w/, (c) => c.toUpperCase())
      .trim();
  };

  const bannerStyles = {
    display: "flex",
    alignItems: "flex-start",
    gap: 1.5,
    p: 2,
    borderRadius: "8px",
    backgroundColor: config.bgColor,
    border: `1px solid ${config.borderColor}`,
    ...props.sx,
  };

  if (compact) {
    return (
      <Box sx={bannerStyles} role="alert" aria-live="polite">
        <IconComponent
          sx={{ fontSize: 20, color: config.iconColor, mt: 0.25 }}
        />
        <Typography
          variant="body2"
          sx={{
            flex: 1,
            fontWeight: 500,
            color: config.textColor,
            lineHeight: 1.5,
          }}
        >
          {displayMessage}
        </Typography>
        {canRetry && (
          <Button
            size="small"
            onClick={onRetry}
            startIcon={<RefreshIcon sx={{ fontSize: "16px !important" }} />}
            sx={{
              minWidth: "auto",
              px: 1.5,
              py: 0.5,
              fontSize: "12px",
              fontWeight: 600,
              textTransform: "none",
              color: config.iconColor,
              "&:hover": { backgroundColor: config.fieldBg },
            }}
          >
            Retry
          </Button>
        )}
        {onDismiss && (
          <IconButton
            size="small"
            onClick={onDismiss}
            sx={{ p: 0.5, color: config.mutedText }}
          >
            <CloseIcon sx={{ fontSize: 18 }} />
          </IconButton>
        )}
      </Box>
    );
  }

  if (hasValidationErrors && showDetails) {
    const showCollapse = validationErrors.length > 5;
    const visibleErrors =
      showCollapse && !detailsExpanded
        ? validationErrors.slice(0, 5)
        : validationErrors;

    return (
      <Box sx={bannerStyles} role="alert" aria-live="polite">
        <IconComponent
          sx={{
            fontSize: 22,
            color: config.iconColor,
            mt: 0.25,
            flexShrink: 0,
          }}
        />
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography
            variant="body2"
            sx={{
              fontWeight: 600,
              color: config.textColor,
              lineHeight: 1.5,
              mb: 1,
            }}
          >
            {validationErrors.length === 1
              ? "Please fix the following issue:"
              : `Please fix the following ${validationErrors.length} issues:`}
          </Typography>
          <Box sx={{ bgcolor: config.fieldBg, borderRadius: "6px", p: 1.5 }}>
            <List
              dense
              disablePadding
              sx={{ "& .MuiListItem-root": { py: 0.25, px: 0 } }}
            >
              {visibleErrors.map((err, index) => (
                <ListItem key={index}>
                  <ListItemText
                    primary={
                      <Typography
                        variant="body2"
                        component="div"
                        sx={{ display: "flex", gap: 0.5 }}
                      >
                        <Box
                          component="span"
                          sx={{ fontWeight: 600, color: config.iconColor }}
                        ></Box>
                        <Box component="span">
                          <Box
                            component="span"
                            sx={{ fontWeight: 600, color: config.textColor }}
                          >
                            {formatFieldName(err.field)}:
                          </Box>{" "}
                          <Box
                            component="span"
                            sx={{ color: config.mutedText }}
                          >
                            {err.message}
                          </Box>
                        </Box>
                      </Typography>
                    }
                  />
                </ListItem>
              ))}
            </List>
            {showCollapse && (
              <Button
                size="small"
                onClick={() => setDetailsExpanded(!detailsExpanded)}
                endIcon={
                  detailsExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />
                }
                sx={{
                  mt: 0.5,
                  fontSize: "11px",
                  fontWeight: 500,
                  textTransform: "none",
                  color: config.mutedText,
                  p: 0,
                  minWidth: "auto",
                  "&:hover": {
                    backgroundColor: "transparent",
                    color: config.iconColor,
                  },
                }}
              >
                {detailsExpanded
                  ? "Show less"
                  : `Show ${validationErrors.length - 5} more`}
              </Button>
            )}
          </Box>
          {hint && (
            <Typography
              variant="caption"
              sx={{ display: "block", mt: 1, color: config.mutedText }}
            >
              {" "}
              {hint}
            </Typography>
          )}
          {canRetry && (
            <Button
              size="small"
              onClick={onRetry}
              startIcon={<RefreshIcon />}
              sx={{
                mt: 1.5,
                px: 2,
                py: 0.5,
                fontSize: "12px",
                fontWeight: 600,
                textTransform: "none",
                color: "#fff",
                backgroundColor: config.iconColor,
                "&:hover": { backgroundColor: config.iconColor, opacity: 0.9 },
              }}
            >
              Try Again
            </Button>
          )}
        </Box>
        {onDismiss && (
          <IconButton
            size="small"
            onClick={onDismiss}
            sx={{
              p: 0.5,
              color: config.mutedText,
              "&:hover": { color: config.iconColor },
            }}
          >
            <CloseIcon sx={{ fontSize: 18 }} />
          </IconButton>
        )}
      </Box>
    );
  }

  return (
    <Box sx={bannerStyles} role="alert" aria-live="polite">
      <IconComponent
        sx={{ fontSize: 22, color: config.iconColor, mt: 0.25, flexShrink: 0 }}
      />
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography
          variant="body2"
          sx={{ fontWeight: 500, color: config.textColor, lineHeight: 1.5 }}
        >
          {displayMessage}
        </Typography>
        {hint && (
          <Typography
            variant="caption"
            sx={{ display: "block", mt: 0.5, color: config.mutedText }}
          >
            {" "}
            {hint}
          </Typography>
        )}
        {parsedError.code && showDetails && (
          <Typography
            variant="caption"
            sx={{
              display: "block",
              mt: 0.5,
              color: config.mutedText,
              fontFamily: "monospace",
              fontSize: "10px",
              opacity: 0.8,
            }}
          >
            Code: {parsedError.code}
          </Typography>
        )}
        {canRetry && (
          <Button
            size="small"
            onClick={onRetry}
            startIcon={<RefreshIcon />}
            sx={{
              mt: 1,
              px: 2,
              py: 0.5,
              fontSize: "12px",
              fontWeight: 600,
              textTransform: "none",
              color: "#fff",
              backgroundColor: config.iconColor,
              "&:hover": { backgroundColor: config.iconColor, opacity: 0.9 },
            }}
          >
            Try Again
          </Button>
        )}
      </Box>
      {onDismiss && (
        <IconButton
          size="small"
          onClick={onDismiss}
          sx={{
            p: 0.5,
            color: config.mutedText,
            "&:hover": { color: config.iconColor },
          }}
        >
          <CloseIcon sx={{ fontSize: 18 }} />
        </IconButton>
      )}
    </Box>
  );
};

export default ErrorAlert;
