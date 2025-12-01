import { useEffect, useState } from "react";
import { Box, Button, Link, Divider, Typography, Alert } from "@mui/material";
import { Link as RouterLink, useLocation } from "react-router-dom";

import { useTheme } from "../../hooks/useTheme";
import { useAuth } from "../../features/auth/hooks/useAuth";
import DynamicForm from "../../components/common/Form/DynamicForm";
import DynamicSkeleton from "../../components/ui/Skeleton/DynamicSkeleton";
import { loginFormConfig } from "../../config/forms/authForms";
import { loginValidation } from "../../validation/authValidator";

function LoginPage() {
  const { theme } = useTheme();
  const { loginUser, isLoading, error, clearAuthError } = useAuth();
  const location = useLocation();

  const [loginError, setLoginError] = useState("");

  // Clear auth error on component mount and unmount
  useEffect(() => {
    clearAuthError();
    setLoginError("");

    return () => {
      clearAuthError();
    };
  }, [clearAuthError]);

  useEffect(() => {
    if (error) {
      setLoginError(error.message || "Login failed. Please try again.");
    }
  }, [error]);

  const handleLogin = async (data) => {
    try {
      // just to be sure
      setLoginError("");
      clearAuthError();

      await loginUser({
        email: data.email.toLowerCase(),
        password: data.password,
      }).unwrap();
    } catch (error) {
      setLoginError(error.message || "Login failed. Please try again.");
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
