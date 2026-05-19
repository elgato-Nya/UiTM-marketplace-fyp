import { useEffect, useRef, useState } from "react";
import { Box, Typography, Link } from "@mui/material";
import { Link as RouterLink, useNavigate, useLocation } from "react-router-dom";

import { useTheme } from "../../hooks/useTheme";
import { useAuth } from "../../features/auth/hooks/useAuth";
import { useSnackbar } from "../../hooks/useSnackbar";
import { register } from "../../features/auth/store/authSlice";
import DynamicForm from "../../components/common/Form/DynamicForm";
import RegistrationSuccessModal from "../../components/common/Modal/RegistrationSuccessModal";
import { registerFormConfig } from "../../config/forms/authForms";
import { registerValidator } from "../../validation/authValidator";
import { ROUTES } from "../../constants/routes";
import { isUiTMEmail } from "../../utils/emailUtils";

const formatAuthDisplayError = (
  rawError,
  fallbackMessage = "Unable to complete registration. Please try again."
) => {
  if (!rawError) return null;

  const message =
    rawError?.message ||
    rawError?.error?.message ||
    fallbackMessage;

  const safeValidationErrors = Array.isArray(rawError?.validationErrors)
    ? rawError.validationErrors
        .map((err) => {
          const field = err?.field || err?.path || err?.param || "unknown";
          const errMessage = err?.message || err?.msg;
          if (!errMessage) return null;
          return { field, message: String(errMessage).trim() };
        })
        .filter(Boolean)
        .filter((err, index, arr) => {
          return (
            arr.findIndex(
              (candidate) =>
                candidate.field === err.field &&
                candidate.message.toLowerCase() === err.message.toLowerCase()
            ) === index
          );
        })
    : null;

  const safeMessage = String(message || fallbackMessage).trim();

  return {
    message: safeMessage,
    validationErrors:
      safeValidationErrors && safeValidationErrors.length > 0
        ? safeValidationErrors
        : null,
  };
};

function RegisterPage() {
  const { theme } = useTheme();
  const { registerUser, error, isLoading, clearAuthError } = useAuth();
  const { showSnackbar } = useSnackbar();
  const navigate = useNavigate();
  const location = useLocation();

  const [registerError, setRegisterError] = useState(null);
  const [registeredEmail, setRegisteredEmail] = useState("");
  const isReadyForErrorSyncRef = useRef(false);

  // Modal state - simplified
  const [modalOpen, setModalOpen] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);

  // Clear errors on mount, unmount, and location change
  useEffect(() => {
    isReadyForErrorSyncRef.current = false;
    clearAuthError();
    setRegisterError(null);

    const syncGuardTimer = setTimeout(() => {
      isReadyForErrorSyncRef.current = true;
    }, 0);

    return () => {
      clearTimeout(syncGuardTimer);
      clearAuthError();
      setRegisterError(null);
    };
  }, [clearAuthError, location.pathname]);

  useEffect(() => {
    if (!isReadyForErrorSyncRef.current) return;

    if (error && error.message) {
      setRegisterError(formatAuthDisplayError(error));
      // Close modal and show error in form
      setModalOpen(false);
      setIsRegistering(false);
    }
  }, [error]);

  const handleRegister = async (data) => {
    try {
      setRegisterError(null);
      clearAuthError();
      setIsRegistering(true);
      setModalOpen(true);

      const registrationData = {
        email: data.email.toLowerCase(),
        password: data.password,
        profile: {
          username: data.profile.username,
          phoneNumber: data.profile.phoneNumber,
          ...(isUiTMEmail(data.email) && {
            campus: data.profile.campus,
            faculty: data.profile.faculty,
          }),
        },
      };

      setRegisteredEmail(registrationData.email);
      const result = await registerUser(registrationData);

      // Check if registration was successful
      if (register.fulfilled.match(result)) {
        setIsRegistering(false);
        // Modal will now show success state

        // Navigate to login after 3 seconds
        setTimeout(() => {
          navigate(ROUTES.AUTH.LOGIN, {
            state: {
              message:
                "Registration successful! Please verify your email and then log in.",
              email: registrationData.email,
            },
          });
        }, 3000);
      } else if (result.payload?.message) {
        // Handle registration failure
        const safeError = formatAuthDisplayError(result.payload);
        setRegisterError(safeError);
        setModalOpen(false);
        setIsRegistering(false);
        showSnackbar(safeError?.message || "Registration failed", "error");
      }
    } catch (err) {
      const safeError = formatAuthDisplayError(err);
      setRegisterError(safeError);
      setModalOpen(false);
      setIsRegistering(false);
      showSnackbar(safeError?.message || "Registration failed", "error");
    }
  };

  const handleCloseModal = () => {
    // Only allow closing after success (not during loading)
    if (!isRegistering) {
      setModalOpen(false);
      // Navigate to login
      navigate(ROUTES.AUTH.LOGIN, {
        state: {
          message:
            "Registration successful! Please verify your email and then log in.",
          email: registeredEmail,
        },
      });
    }
  };

  return (
    <Box>
      <Typography
        variant="h4"
        component="h1"
        sx={{
          fontWeight: 700,
          mb: { xs: 1, sm: 1.5 },
          fontSize: { xs: "1.5rem", sm: "2rem" },
          textAlign: "center",
        }}
      >
        Create Account
      </Typography>
      <Typography
        variant="body2"
        color="text.secondary"
        sx={{ mb: { xs: 2.5, sm: 3 }, textAlign: "center" }}
      >
        Join MarKet today
      </Typography>

      <DynamicForm
        config={registerFormConfig}
        validationSchema={registerValidator}
        onSubmit={handleRegister}
        isLoading={isLoading}
        error={registerError}
        mapServerErrors={false}
      />

      {/* Sign in link */}
      <Box sx={{ textAlign: "center", mt: { xs: 3, sm: 4 } }}>
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ fontSize: { xs: "0.875rem", sm: "0.9375rem" } }}
        >
          Already have an account?{" "}
          <Link
            component={RouterLink}
            to={ROUTES.AUTH.LOGIN}
            sx={{
              color: theme.palette.primary.main,
              textDecoration: "none",
              fontWeight: 600,
              "&:hover": {
                textDecoration: "underline",
              },
            }}
          >
            Sign in
          </Link>
        </Typography>
      </Box>

      <Box sx={{ textAlign: "center", mt: { xs: 2.5, sm: 3 } }}>
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ fontSize: { xs: "0.7rem", sm: "0.75rem" } }}
        >
          By creating an account, you agree to our{" "}
          <Link href={ROUTES.TERMS} color="primary">
            Terms of Service
          </Link>{" "}
          and{" "}
          <Link href={ROUTES.PRIVACY} color="primary">
            Privacy Policy
          </Link>
        </Typography>
      </Box>

      {/* Registration Success Modal */}
      <RegistrationSuccessModal
        open={modalOpen}
        onClose={handleCloseModal}
        email={registeredEmail}
        isLoading={isRegistering}
      />
    </Box>
  );
}

export default RegisterPage;
