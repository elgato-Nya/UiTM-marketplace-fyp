import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Alert,
  CircularProgress,
} from "@mui/material";
import {
  MarkEmailRead,
  HourglassEmpty,
  CheckCircle,
  Error as ErrorIcon,
} from "@mui/icons-material";

/**
 * EmailVerificationModal Component
 *
 * PURPOSE: Reusable modal for email verification feedback
 * FEATURES:
 * - Shows loading, success, and error states
 * - Customizable for different verification types (register, forgot password, merchant)
 * - Provides user guidance and next steps
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
  // Get configuration based on verification type
  const getConfig = () => {
    switch (type) {
      case "register":
        return {
          title: "Verify Your Email",
          successTitle: "Registration Successful! 📧",
          successMessage:
            "We've sent a verification link to your email. Please check your inbox and click the link to activate your account.",
          errorTitle: "Registration Failed",
          icon: <MarkEmailRead sx={{ fontSize: 64, color: "primary.main" }} />,
          expiryTime: "24 hours",
          steps: [
            "Check your email inbox",
            "Click the verification link",
            "You'll be redirected to login",
            "Start shopping!",
          ],
        };
      case "forgot-password":
        return {
          title: "Password Reset Email Sent",
          successTitle: "Reset Link Sent! 🔐",
          successMessage:
            "We've sent a password reset link to your email. Click the link to create a new password.",
          errorTitle: "Failed to Send Reset Email",
          icon: <MarkEmailRead sx={{ fontSize: 64, color: "warning.main" }} />,
          expiryTime: "1 hour",
          steps: [
            "Check your email inbox",
            "Click the reset link",
            "Create a new password",
            "Login with new password",
          ],
        };
      case "merchant":
        return {
          title: "Merchant Verification",
          successTitle: "Verification Email Sent! 🏪",
          successMessage:
            "We've sent a verification link to your UiTM email. Click the link to verify your merchant status.",
          errorTitle: "Verification Failed",
          icon: <MarkEmailRead sx={{ fontSize: 64, color: "success.main" }} />,
          expiryTime: "24 hours",
          steps: [
            "Check your UiTM email inbox",
            "Click the verification link",
            "Your merchant status will be activated",
            "Start listing products!",
          ],
        };
      default:
        return {
          title: "Email Verification",
          successTitle: "Email Sent!",
          successMessage: "Please check your email for further instructions.",
          errorTitle: "Verification Failed",
          icon: <MarkEmailRead sx={{ fontSize: 64, color: "primary.main" }} />,
          expiryTime: "24 hours",
          steps: ["Check your email", "Follow the instructions"],
        };
    }
  };

  const config = getConfig();

  // Render loading state
  if (status === "loading") {
    return (
      <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
        <DialogContent sx={{ textAlign: "center", py: 6 }}>
          <CircularProgress size={60} sx={{ mb: 3 }} />
          <Typography variant="h6" gutterBottom>
            Sending Verification Email...
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Please wait a moment
          </Typography>
        </DialogContent>
      </Dialog>
    );
  }

  // Render error state
  if (status === "error") {
    return (
      <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Box display="flex" alignItems="center" gap={1}>
            <ErrorIcon color="error" />
            {config.errorTitle}
          </Box>
        </DialogTitle>
        <DialogContent>
          <Alert severity="error" sx={{ mb: 2 }}>
            {error || "An unexpected error occurred. Please try again."}
          </Alert>
          <Typography variant="body2" color="text.secondary">
            If the problem persists, please contact support.
          </Typography>
        </DialogContent>
        <DialogActions>
          {onResend && (
            <Button
              onClick={onResend}
              disabled={isResending}
              variant="outlined"
              color="primary"
            >
              {isResending ? "Resending..." : "Try Again"}
            </Button>
          )}
          <Button onClick={onClose} variant="contained">
            Close
          </Button>
        </DialogActions>
      </Dialog>
    );
  }

  // Render success state
  if (status === "success") {
    return (
      <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ textAlign: "center", pt: 4 }}>
          <Box display="flex" flexDirection="column" alignItems="center">
            {config.icon}
            <Typography variant="h5" fontWeight="bold" sx={{ mt: 2 }}>
              {config.successTitle}
            </Typography>
          </Box>
        </DialogTitle>
        <DialogContent sx={{ pb: 4 }}>
          {/* Success Message */}
          <Alert severity="success" sx={{ mb: 3 }}>
            <Typography variant="body2">{config.successMessage}</Typography>
          </Alert>

          {/* Email Display */}
          {email && (
            <Box
              sx={{
                bgcolor: "grey.100",
                p: 2,
                borderRadius: 1,
                mb: 3,
                textAlign: "center",
              }}
            >
              <Typography variant="caption" color="text.secondary" gutterBottom>
                Email sent to:
              </Typography>
              <Typography variant="body1" fontWeight="medium">
                {email}
              </Typography>
            </Box>
          )}

          {/* Next Steps */}
          <Box
            sx={{
              bgcolor: "primary.50",
              p: 2,
              borderRadius: 1,
              mb: 2,
            }}
          >
            <Typography
              variant="subtitle2"
              fontWeight="bold"
              gutterBottom
              color="primary.main"
            >
              📋 Next Steps:
            </Typography>
            <Box component="ol" sx={{ pl: 2, m: 0 }}>
              {config.steps.map((step, index) => (
                <Typography
                  key={index}
                  component="li"
                  variant="body2"
                  color="text.secondary"
                  sx={{ mb: 0.5 }}
                >
                  {step}
                </Typography>
              ))}
            </Box>
          </Box>

          {/* Important Notice */}
          <Alert severity="warning" sx={{ mb: 2 }}>
            <Typography variant="caption">
              ⚠️ <strong>Important:</strong> The verification link expires in{" "}
              {config.expiryTime}. If you don't see the email, check your spam
              folder.
            </Typography>
          </Alert>

          {/* Resend Option */}
          {onResend && (
            <Box sx={{ textAlign: "center", mt: 2 }}>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                Didn't receive the email?
              </Typography>
              <Button
                onClick={onResend}
                disabled={isResending}
                variant="text"
                size="small"
                color="primary"
              >
                {isResending ? (
                  <>
                    <CircularProgress size={16} sx={{ mr: 1 }} />
                    Resending...
                  </>
                ) : (
                  "Resend Verification Email"
                )}
              </Button>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button onClick={onClose} variant="contained" fullWidth>
            Got it!
          </Button>
        </DialogActions>
      </Dialog>
    );
  }

  // Default/idle state - should not normally be shown
  return null;
};

export default EmailVerificationModal;
