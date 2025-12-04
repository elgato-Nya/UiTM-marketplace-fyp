import React, { useEffect, useState } from "react";
import { Box, Button, Divider, Typography } from "@mui/material";
import { Link as RouterLink, useNavigate } from "react-router-dom";

import { useTheme } from "../../hooks/useTheme";
import { useAuth } from "../../features/auth/hooks/useAuth";
import { useSnackbar } from "../../hooks/useSnackbar";
import { register } from "../../features/auth/store/authSlice";
import DynamicForm from "../../components/common/Form/DynamicForm";
import DynamicSkeleton from "../../components/ui/Skeleton/DynamicSkeleton";
import { registerFormConfig } from "../../config/forms/authForms";
import { registerValidator } from "../../validation/authValidator";
import { ROUTES } from "../../constants/routes";
import authService from "../../features/auth/service/authService";

function RegisterPage() {
  const { theme } = useTheme();
  const { registerUser, error, isLoading, clearAuthError } = useAuth();
  const { showSnackbar } = useSnackbar();
  const navigate = useNavigate();

  const [registerError, setRegisterError] = useState("");
  const [registeredEmail, setRegisteredEmail] = useState("");
  const [showResendOption, setShowResendOption] = useState(false);
  const [isResending, setIsResending] = useState(false);

  useEffect(() => {
    clearAuthError();
    setRegisterError("");

    return () => {
      clearAuthError();
    };
  }, [clearAuthError]);

  useEffect(() => {
    if (error && error.message) {
      setRegisterError(error.message);
      showSnackbar(error.message, "error");
    }
  }, [error, showSnackbar]);

  const handleResendVerification = async () => {
    if (!registeredEmail) return;

    setIsResending(true);
    try {
      await authService.resendVerificationEmail(registeredEmail);
      showSnackbar(
        "Verification email sent! Please check your inbox.",
        "success"
      );
      setShowResendOption(false);
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

  const handleRegister = async (data) => {
    try {
      setRegisterError("");
      clearAuthError();
      setShowResendOption(false);

      const registrationData = {
        email: data.email.toLowerCase(),
        password: data.password,
        profile: {
          username: data.profile.username,
          phoneNumber: data.profile.phoneNumber,
          campus: data.profile.campus,
          faculty: data.profile.faculty,
        },
      };

      setRegisteredEmail(registrationData.email);
      const result = await registerUser(registrationData);

      // Check if registration was successful
      if (register.fulfilled.match(result)) {
        showSnackbar(
          "Registration successful! Please check your email to verify your account.",
          "success"
        );
        setShowResendOption(true);

        // Navigate to login after 2 seconds
        setTimeout(() => {
          navigate(ROUTES.AUTH.LOGIN, {
            state: {
              message:
                "Registration successful! Please verify your email and then log in.",
              email: registrationData.email,
            },
          });
        }, 2000);
      } else if (result.payload?.message) {
        // Handle registration failure - error message from server
        setRegisterError(result.payload.message);
        showSnackbar(result.payload.message, "error");
      }
    } catch (error) {
      // Error is already set in Redux state and will be handled by useEffect
      console.error("Registration error:", error);
    }
  };

  // Show skeleton while loading
  if (isLoading) {
    return (
      <DynamicSkeleton
        type="page"
        location="/auth/register"
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
      <DynamicForm
        config={registerFormConfig}
        validationSchema={registerValidator}
        onSubmit={handleRegister}
        isLoading={isLoading}
        error={registerError}
      />

      {/* Resend Verification Option - shown after successful registration */}
      {showResendOption && registeredEmail && (
        <Box sx={{ textAlign: "center", mt: 2, mb: 2 }}>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
            Didn't receive the email?
          </Typography>
          <Button
            onClick={handleResendVerification}
            disabled={isResending}
            variant="text"
            size="small"
            sx={{
              color: theme.palette.primary.main,
              "&:hover": { textDecoration: "underline" },
            }}
          >
            {isResending ? "Sending..." : "Resend Verification Email"}
          </Button>
        </Box>
      )}

      <Typography
        variant="body2"
        color="text.secondary"
        sx={{ mt: 2, mb: 1, textAlign: "center" }}
      >
        Already have an account?
      </Typography>

      <Button
        component={RouterLink}
        to="/auth/login"
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
        Sign In
      </Button>
    </Box>
  );
}

export default RegisterPage;
