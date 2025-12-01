import React, { useEffect, useState } from "react";
import { Box, Button, Divider, Typography } from "@mui/material";
import { Link as RouterLink, useNavigate } from "react-router-dom";

import { useTheme } from "../../hooks/useTheme";
import { useAuth } from "../../features/auth/hooks/useAuth";
import { register } from "../../features/auth/store/authSlice";
import DynamicForm from "../../components/common/Form/DynamicForm";
import DynamicSkeleton from "../../components/ui/Skeleton/DynamicSkeleton";
import { registerFormConfig } from "../../config/forms/authForms";
import { registerValidator } from "../../validation/authValidator";
import { ROUTES } from "../../constants/routes";

function RegisterPage() {
  const { theme } = useTheme();
  const { registerUser, error, isLoading, clearAuthError } = useAuth();
  const navigate = useNavigate();

  const [registerError, setRegisterError] = useState("");

  useEffect(() => {
    clearAuthError();
    setRegisterError("");

    return () => {
      clearAuthError();
    };
  }, [clearAuthError]);

  useEffect(() => {
    if (error) {
      setRegisterError(
        error.message || "Registration failed. Please try again."
      );
    }
  }, [error]);

  const handleRegister = async (data) => {
    try {
      setRegisterError("");
      clearAuthError();

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

      const result = await registerUser(registrationData);

      // Check if registration was successful
      if (register.fulfilled.match(result)) {
        alert("Registration successful! Please log in with your credentials.");
        navigate(ROUTES.AUTH.LOGIN, {
          state: { message: "Registration successful! Please log in." },
        });
      } else {
        // Handle registration failure
        const errorMessage =
          result.payload?.message || "Registration failed. Please try again.";
        setRegisterError(errorMessage);
      }
    } catch (error) {
      console.error("Registration error:", error);
      setRegisterError(
        error.message || "Registration failed. Please try again."
      );
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
