import React, { useState, useEffect } from "react";
import { Box, Typography, Paper, LinearProgress, Alert } from "@mui/material";
import { AccessTime as TimerIcon, Info as InfoIcon } from "@mui/icons-material";
import { useTheme } from "../../../hooks/useTheme";

/**
 * SessionTimer Component
 *
 * PURPOSE: Display countdown timer for checkout session
 * FEATURES:
 * - Sticky positioning at top of checkout page
 * - Color changes based on time remaining (green → yellow → red)
 * - Warning when < 2 minutes
 * - Auto-calls onExpire when time runs out
 *
 * @param {Date|String} expiresAt - Session expiration time
 * @param {Function} onExpire - Callback when timer reaches 0
 */
const SessionTimer = ({ expiresAt, onExpire }) => {
  const { theme } = useTheme();
  const [timeRemaining, setTimeRemaining] = useState(null);
  const [progress, setProgress] = useState(100);

  useEffect(() => {
    if (!expiresAt) return;

    const calculateTimeRemaining = () => {
      const now = new Date().getTime();
      const expiry = new Date(expiresAt).getTime();
      const remaining = expiry - now;

      if (remaining <= 0) {
        setTimeRemaining(0);
        setProgress(0);
        onExpire?.();
        return;
      }

      setTimeRemaining(remaining);

      // Calculate progress (10 minutes = 600000ms)
      const totalTime = 10 * 60 * 1000;
      const progressPercent = (remaining / totalTime) * 100;
      setProgress(progressPercent);
    };

    // Initial calculation
    calculateTimeRemaining();

    // Update every second
    const interval = setInterval(calculateTimeRemaining, 1000);

    return () => clearInterval(interval);
  }, [expiresAt, onExpire]);

  // Format time as MM:SS
  const formatTime = (milliseconds) => {
    if (milliseconds === null) return "--:--";

    const totalSeconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;

    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  const getWarningLevel = () => {
    if (timeRemaining === null) return null;
    if (timeRemaining <= 60000) return "critical"; // < 1 minute
    if (timeRemaining <= 120000) return "warning"; // < 2 minutes
    return "normal";
  };

  const warningLevel = getWarningLevel();
  const formattedTime = formatTime(timeRemaining);

  /**
   * Get color scheme with proper contrast for all theme modes
   * - Normal mode: Use paper background with colored accents
   * - Dark mode: Use paper background with appropriate colors
   * - Accessible mode: Use high contrast black/white with colored borders
   */
  const getColor = () => {
    const isDark = theme.palette.mode === "dark";
    const isAccessible =
      theme.palette.mode === "light" &&
      theme.palette.primary.main === "#000000";

    switch (warningLevel) {
      case "critical":
        return {
          bg: isAccessible
            ? "#FFFFFF"
            : isDark
              ? "rgba(211, 47, 47, 0.15)" // error.main with opacity
              : "#FFEBEE", // error.50 equivalent
          text: isAccessible ? "#000000" : theme.palette.error.main,
          progress: theme.palette.error.main,
          borderColor: theme.palette.error.main,
          iconColor: isAccessible ? "#000000" : theme.palette.error.main,
        };
      case "warning":
        return {
          bg: isAccessible
            ? "#FFFFFF"
            : isDark
              ? "rgba(237, 108, 2, 0.15)" // warning.main with opacity
              : "#FFF4E5", // warning.50 equivalent
          text: isAccessible ? "#000000" : theme.palette.warning.main,
          progress: theme.palette.warning.main,
          borderColor: theme.palette.warning.main,
          iconColor: isAccessible ? "#000000" : theme.palette.warning.main,
        };
      default:
        return {
          bg: isAccessible
            ? "#FFFFFF"
            : isDark
              ? "rgba(2, 136, 209, 0.15)" // info.main with opacity
              : "#E3F2FD", // info.50 equivalent
          text: isAccessible ? "#000000" : theme.palette.info.main,
          progress: theme.palette.info.main,
          borderColor: theme.palette.info.main,
          iconColor: isAccessible ? "#000000" : theme.palette.info.main,
        };
    }
  };

  const colors = getColor();

  return (
    <Paper
      elevation={3}
      role="timer"
      aria-live="polite"
      aria-atomic="true"
      aria-label={`Checkout session timer: ${formattedTime} remaining`}
      sx={{
        mt: 3,
        p: 2,
        backgroundColor: colors.bg,
        borderLeft: `4px solid ${colors.borderColor}`,
        border:
          theme.palette.mode === "light" &&
          theme.palette.primary.main === "#000000"
            ? `2px solid ${colors.borderColor}`
            : undefined,
      }}
    >
      {/** Session Timer Header */}
      <Box
        sx={{
          display: "flex",
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 1,
          mb: 1,
        }}
      >
        <Box sx={{ display: "flex", flexDirection: "row", gap: 1 }}>
          <TimerIcon sx={{ color: colors.iconColor }} aria-hidden="true" />
          <Typography
            variant="subtitle1"
            component="h2"
            sx={{
              fontWeight: 600,
              color: theme.palette.text.primary,
            }}
          >
            Session Timer
          </Typography>
        </Box>

        {/** Timer Display */}
        <Typography
          variant="h4"
          component="span"
          sx={{
            fontWeight: 700,
            color: colors.text,
            fontVariantNumeric: "tabular-nums",
          }}
          aria-label={`${formattedTime} minutes and seconds`}
        >
          {formattedTime}{" "}
          <Typography
            variant="body2"
            component="span"
            sx={{ color: theme.palette.text.secondary }}
          >
            remaining
          </Typography>
        </Typography>
      </Box>

      {/** Progress Bar */}
      <LinearProgress
        variant="determinate"
        value={progress}
        aria-label={`${Math.round(progress)}% of session time remaining`}
        sx={{
          height: 8,
          borderRadius: 1,
          backgroundColor:
            theme.palette.mode === "dark"
              ? "rgba(255, 255, 255, 0.1)"
              : theme.palette.grey[200],
          mb: 1.5,
          "& .MuiLinearProgress-bar": {
            backgroundColor: colors.progress,
            borderRadius: 1,
          },
        }}
      />

      {/** Info Message */}
      <Box
        sx={{
          display: "flex",
          alignItems: "flex-start",
          gap: 1,
        }}
      >
        <InfoIcon
          sx={{
            fontSize: 18,
            color: colors.iconColor,
            my: "auto",
          }}
          aria-hidden="true"
        />
        <Typography
          variant="caption"
          sx={{ color: theme.palette.text.primary, my: "auto" }}
        >
          {warningLevel === "critical" ? (
            <strong>Hurry! Your session is about to expire.</strong>
          ) : warningLevel === "warning" ? (
            <strong>Please complete your checkout soon.</strong>
          ) : (
            <>
              Your items are reserved for <strong>10 minutes</strong>. Complete
              your checkout to secure your order.
            </>
          )}
        </Typography>
      </Box>

      {/** Critical Warning Alert */}
      {warningLevel === "critical" && (
        <Alert
          severity="error"
          icon={false}
          sx={{ mt: 1.5, py: 0.5 }}
          role="alert"
          aria-live="assertive"
        >
          <Typography variant="caption" sx={{ fontWeight: 600 }}>
            Session expiring in less than 1 minute!
          </Typography>
        </Alert>
      )}
    </Paper>
  );
};

export default SessionTimer;
