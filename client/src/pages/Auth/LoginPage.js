import { useEffect, useState } from "react";
import { Box, Button, Link, Divider, Typography, Alert } from "@mui/material";
import { Link as RouterLink, useLocation } from "react-router-dom";

import { useTheme } from "../../hooks/useTheme";
import { useAuth } from "../../features/auth/hooks/useAuth";
import { useSnackbar } from "../../hooks/useSnackbar";
import DynamicForm from "../../components/common/Form/DynamicForm";
import DynamicSkeleton from "../../components/ui/Skeleton/DynamicSkeleton";
import { loginFormConfig } from "../../config/forms/authForms";
import { loginValidation } from "../../validation/authValidator";
import authService from "../../features/auth/service/authService";

function LoginPage() {
  const { theme } = useTheme();
  const { loginUser, isLoading, error, clearAuthError } = useAuth();
  const { showSnackbar } = useSnackbar();
  const location = useLocation();

  const [loginError, setLoginError] = useState("");
  const [isResending, setIsResending] = useState(false);
  const [lastEmail, setLastEmail] = useState("");

  // Clear auth error on component mount and unmount
  useEffect(() => {
    clearAuthError();
    setLoginError("");

    return () => {
      clearAuthError();
    };
  }, [clearAuthError]);

  useEffect(() => {
    if (error && error.message) {
      setLoginError(error.message);

      // Check if it's an email verification error - show toast notification
      if (
        error.code === "EMAIL_NOT_VERIFIED" ||
        error.message.includes("verify your email")
      ) {
        showSnackbar(error.message, "warning");
      }
    }
  }, [error, showSnackbar]);

  const handleResendVerification = async () => {
    if (!lastEmail) {
      showSnackbar(
        "Please try logging in first to resend verification email",
        "error"
      );
      return;
    }

    setIsResending(true);
    try {
      await authService.resendVerificationEmail(lastEmail);
      showSnackbar(
        "Verification email sent! Please check your inbox.",
        "success"
      );
    } catch (error) {
      // Extract error from server response structure
      const responseData = error.response?.data;
      const errorMessage =
        responseData?.error?.message || // Development format
        responseData?.message || // Production format
        "Unable to resend verification email. Please try again.";
      showSnackbar(errorMessage, "error");
    } finally {
      setIsResending(false);
    }
  };

  const handleLogin = async (data) => {
    try {
      setLoginError("");
      clearAuthError();
      setLastEmail(data.email.toLowerCase());

      await loginUser({
        email: data.email.toLowerCase(),
        password: data.password,
      }).unwrap();
    } catch (error) {
      // Error is already set in Redux state and will be handled by useEffect
      if (error.message) {
        setLoginError(error.message);

        // Show toast for email verification error
        if (
          error.code === "EMAIL_NOT_VERIFIED" ||
          error.message.includes("verify your email")
        ) {
          showSnackbar(error.message, "warning");
        }
      }
    }
  };

  // Show skeleton while loading
  if (isLoading) {
    return (
      <DynamicSkeleton
        type="page"
        location="/auth/login"
        config={{
          contentType: "form",
          centered: true,
          showHeader: false,
          showFooter: false,
        }}
      />
    );
  }

  return (
    <Box>
      {/* Success message from registration */}
      {location.state?.message && (
        <Alert severity="success" sx={{ mb: 3 }}>
          {location.state.message}
        </Alert>
      )}

      <DynamicForm
        config={loginFormConfig}
        validationSchema={loginValidation}
        onSubmit={handleLogin}
        isLoading={isLoading}
        error={loginError}
      />

      {/* Resend Verification Link - shown when email not verified */}
      {loginError &&
        (error?.code === "EMAIL_NOT_VERIFIED" ||
          loginError.includes("verify your email")) &&
        lastEmail && (
          <Box sx={{ textAlign: "center", mt: 2 }}>
            <Button
              onClick={handleResendVerification}
              disabled={isResending}
              variant="text"
              size="small"
              sx={{
                color: theme.palette.warning.main,
                "&:hover": { textDecoration: "underline" },
              }}
            >
              {isResending ? "Sending..." : "Resend Verification Email"}
            </Button>
          </Box>
        )}

      {/* Forgot Password Link */}
      <Box sx={{ textAlign: "right", mt: 2, mb: 3 }}>
        <Link
          component={RouterLink}
          to="/auth/forgot-password"
          variant="body2"
          sx={{
            color: theme.palette.primary.main,
            textDecoration: "none",
            "&:hover": { textDecoration: "underline" },
          }}
        >
          Forgot Password?
        </Link>
      </Box>

      <Divider sx={{ my: 4 }}>
        <Typography variant="body2" color="text.secondary">
          New to UiTM Marketplace?
        </Typography>
      </Divider>

      <Button
        component={RouterLink}
        to="/auth/register"
        variant="outlined"
        fullWidth
        size="large"
        sx={{
          py: 1.5,
          borderColor: theme.palette.primary.main,
          color: theme.palette.primary.main,
          "&:hover": {
            borderColor: theme.palette.primary.dark,
            backgroundColor: theme.palette.primary.main + "10",
          },
        }}
      >
        Create an Account
      </Button>

      <Box sx={{ textAlign: "center", mt: 4 }}>
        <Typography variant="body2" color="text.secondary">
          By signing in, you agree to our{" "}
          <Link href="/terms" color="primary">
            Terms of Service
          </Link>{" "}
          and{" "}
          <Link href="/privacy" color="primary">
            Privacy Policy
          </Link>
        </Typography>
      </Box>
    </Box>
  );
}

export default LoginPage;
