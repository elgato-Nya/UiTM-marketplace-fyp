import {
  Dialog,
  DialogContent,
  Button,
  Typography,
  Box,
  CircularProgress,
  IconButton,
  alpha,
} from "@mui/material";
import {
  CheckCircle,
  Error as ErrorIcon,
  Close as CloseIcon,
  Schedule as ScheduleIcon,
  Refresh as RefreshIcon,
} from "@mui/icons-material";
import { useTheme as useAppTheme } from "../../../hooks/useTheme";

/**
 * EmailVerificationModal Component
 *
 * PURPOSE: Professional, minimalist modal for email verification feedback
 * FEATURES:
 * - Enterprise-ready design with proper theme integration
 * - Clear visual hierarchy and professional typography
 * - Accessible color contrast and focus states
 * - Loading, success, and error states with proper feedback
 * - Rate limiting awareness with countdown
 *
 * PROPS:
 * @param {boolean} open - Whether modal is open
 * @param {function} onClose - Callback when modal closes
 * @param {string} status - Current status: 'idle' | 'loading' | 'success' | 'error'
 * @param {string} type - Verification type: 'register' | 'forgot-password' | 'merchant'
 * @param {string} email - Email address where verification was sent
 * @param {string} error - Error message if status is 'error'
 * @param {function} onResend - Optional callback to resend verification
 * @param {boolean} isResending - Whether resend is in progress
 */

const EmailVerificationModal = ({
  open,
  onClose,
  status = "idle",
  type = "register",
  email = "",
  error = "",
  onResend = null,
  isResending = false,
}) => {
  const { theme, isDark } = useAppTheme();

  // Get configuration based on verification type
  const getConfig = () => {
    switch (type) {
      case "register":
        return {
          title: "Verify Your Email",
          subtitle: "Check your inbox to activate your account",
          expiryTime: "24 hours",
          iconBgColor: theme.palette.primary.main,
        };
      case "forgot-password":
        return {
          title: "Password Reset",
          subtitle: "Check your inbox to reset your password",
          expiryTime: "15 minutes",
          iconBgColor: theme.palette.warning.main,
        };
      case "merchant":
        return {
          title: "Merchant Verification",
          subtitle: "Check your UiTM email to verify merchant status",
          expiryTime: "24 hours",
          iconBgColor: theme.palette.success.main,
        };
      default:
        return {
          title: "Email Verification",
          subtitle: "Check your email for further instructions",
          expiryTime: "24 hours",
          iconBgColor: theme.palette.primary.main,
        };
    }
  };

  const config = getConfig();

  // Render error state
  if (status === "error") {
    const isRateLimited =
      error.toLowerCase().includes("wait") ||
      error.toLowerCase().includes("5 minutes") ||
      error.toLowerCase().includes("recently");

    const isPlatformError =
      error.toLowerCase().includes("technical difficulties") ||
      error.toLowerCase().includes("service unavailable") ||
      error.toLowerCase().includes("not your fault") ||
      error.toLowerCase().includes("experiencing");

    return (
      <Dialog
        open={open}
        onClose={onClose}
        maxWidth="xs"
        fullWidth
        slotProps={{
          paper: {
            sx: {
              borderRadius: 2,
              bgcolor: theme.palette.background.paper,
            },
          },
        }}
      >
        {/* Close Button */}
        <IconButton
          onClick={onClose}
          sx={{
            position: "absolute",
            right: 16,
            top: 16,
            color: "text.secondary",
            "&:hover": {
              bgcolor: alpha(theme.palette.text.primary, 0.05),
            },
          }}
        >
          <CloseIcon fontSize="small" />
        </IconButton>

        <DialogContent sx={{ p: 4, pt: 5 }}>
          {/* Icon */}
          <Box
            sx={{
              width: 56,
              height: 56,
              borderRadius: "50%",
              bgcolor: alpha(
                isPlatformError
                  ? theme.palette.info.main
                  : isRateLimited
                    ? theme.palette.warning.main
                    : theme.palette.error.main,
                0.1
              ),
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              mx: "auto",
              mb: 2,
            }}
          >
            {isPlatformError ? (
              <ErrorIcon
                sx={{
                  fontSize: 28,
                  color: theme.palette.info.main,
                }}
              />
            ) : isRateLimited ? (
              <ScheduleIcon
                sx={{
                  fontSize: 28,
                  color: theme.palette.warning.main,
                }}
              />
            ) : (
              <ErrorIcon
                sx={{
                  fontSize: 28,
                  color: theme.palette.error.main,
                }}
              />
            )}
          </Box>

          {/* Title */}
          <Typography
            variant="h6"
            fontWeight={600}
            color="text.primary"
            align="center"
            sx={{ mb: 1 }}
          >
            {isPlatformError
              ? "Service Unavailable"
              : isRateLimited
                ? "Please Wait"
                : "Failed to Send"}
          </Typography>

          {/* Message */}
          <Typography
            variant="body2"
            color="text.secondary"
            align="center"
            sx={{ mb: 3, lineHeight: 1.6 }}
          >
            {error || "An unexpected error occurred. Please try again."}
          </Typography>

          {/* Additional Info */}
          {isPlatformError && (
            <Box
              sx={{
                p: 2,
                borderRadius: 1.5,
                bgcolor: alpha(theme.palette.success.main, 0.08),
                border: `1px solid ${alpha(theme.palette.success.main, 0.2)}`,
                mb: 3,
              }}
            >
              <Typography variant="caption" color="text.secondary">
                ✓ Your account is safe. This is a temporary issue on our end.
              </Typography>
            </Box>
          )}

          {isRateLimited && (
            <Box
              sx={{
                p: 2,
                borderRadius: 1.5,
                bgcolor: alpha(theme.palette.warning.main, 0.08),
                border: `1px solid ${alpha(theme.palette.warning.main, 0.2)}`,
                mb: 3,
              }}
            >
              <Typography variant="caption" color="text.secondary">
                This helps protect your account from spam.
              </Typography>
            </Box>
          )}

          {/* Actions */}
          <Box sx={{ display: "flex", gap: 1.5 }}>
            {onResend && !isRateLimited && (
              <Button
                onClick={onResend}
                disabled={isResending}
                variant="contained"
                fullWidth
                startIcon={
                  isResending ? (
                    <CircularProgress size={18} color="inherit" />
                  ) : (
                    <RefreshIcon />
                  )
                }
                sx={{
                  textTransform: "none",
                  fontWeight: 500,
                  py: 1.25,
                }}
              >
                {isResending ? "Retrying..." : "Try Again"}
              </Button>
            )}
            <Button
              onClick={onClose}
              variant={onResend && !isRateLimited ? "outlined" : "contained"}
              fullWidth
              sx={{
                textTransform: "none",
                fontWeight: 500,
                py: 1.25,
              }}
            >
              {isPlatformError
                ? "Got it"
                : isRateLimited
                  ? "Understood"
                  : "Close"}
            </Button>
          </Box>
        </DialogContent>
      </Dialog>
    );
  }

  // Render success state
  if (status === "success") {
    return (
      <Dialog
        open={open}
        onClose={onClose}
        maxWidth="xs"
        fullWidth
        slotProps={{
          paper: {
            sx: {
              borderRadius: 2,
              bgcolor: theme.palette.background.paper,
            },
          },
        }}
      >
        {/* Close Button */}
        <IconButton
          onClick={onClose}
          sx={{
            position: "absolute",
            right: 16,
            top: 16,
            color: "text.secondary",
            "&:hover": {
              bgcolor: alpha(theme.palette.text.primary, 0.05),
            },
          }}
        >
          <CloseIcon fontSize="small" />
        </IconButton>

        <DialogContent sx={{ p: 4, pt: 5 }}>
          {/* Icon */}
          <Box
            sx={{
              width: 56,
              height: 56,
              borderRadius: "50%",
              bgcolor: alpha(config.iconBgColor, 0.1),
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              mx: "auto",
              mb: 2,
            }}
          >
            <CheckCircle
              sx={{
                fontSize: 28,
                color: config.iconBgColor,
              }}
            />
          </Box>

          {/* Title */}
          <Typography
            variant="h6"
            fontWeight={600}
            color="text.primary"
            align="center"
            sx={{ mb: 1 }}
          >
            {config.title}
          </Typography>

          {/* Subtitle */}
          <Typography
            variant="body2"
            color="text.secondary"
            align="center"
            sx={{ mb: 3 }}
          >
            {config.subtitle}
          </Typography>

          {/* Email Display */}
          {email && (
            <Box
              sx={{
                p: 2,
                borderRadius: 1.5,
                bgcolor: alpha(theme.palette.primary.main, 0.08),
                border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
                mb: 2,
              }}
            >
              <Typography
                variant="caption"
                color="text.secondary"
                display="block"
                sx={{ mb: 0.5 }}
              >
                Email sent to
              </Typography>
              <Typography
                variant="body2"
                fontWeight={500}
                color="text.primary"
                sx={{
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {email}
              </Typography>
            </Box>
          )}

          {/* Expiry Info */}
          <Box
            sx={{
              p: 2,
              borderRadius: 1.5,
              bgcolor: alpha(theme.palette.warning.main, 0.08),
              border: `1px solid ${alpha(theme.palette.warning.main, 0.2)}`,
              mb: 3,
            }}
          >
            <Typography variant="caption" color="text.secondary">
              ⏱️ Link expires in {config.expiryTime}. Check spam if not found.
            </Typography>
          </Box>

          {/* Resend Button */}
          {onResend && (
            <Box sx={{ mb: 2 }}>
              <Typography
                variant="caption"
                color="text.secondary"
                display="block"
                align="center"
                sx={{ mb: 1 }}
              >
                Didn't receive it?
              </Typography>
              <Button
                onClick={onResend}
                disabled={isResending}
                variant="outlined"
                fullWidth
                size="small"
                startIcon={
                  isResending ? (
                    <CircularProgress size={16} color="inherit" />
                  ) : (
                    <RefreshIcon />
                  )
                }
                sx={{
                  textTransform: "none",
                  fontWeight: 500,
                  py: 0.75,
                }}
              >
                {isResending ? "Sending..." : "Resend Email"}
              </Button>
            </Box>
          )}

          {/* Close Button */}
          <Button
            onClick={onClose}
            variant="contained"
            fullWidth
            sx={{
              textTransform: "none",
              fontWeight: 500,
              py: 1.25,
            }}
          >
            Got it
          </Button>
        </DialogContent>
      </Dialog>
    );
  }

  // Default/idle state - should not normally be shown
  return null;
};

export default EmailVerificationModal;
