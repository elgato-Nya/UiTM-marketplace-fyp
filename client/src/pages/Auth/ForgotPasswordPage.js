import React, { useState } from "react";
import { useNavigate, Link as RouterLink } from "react-router-dom";
import {
  Box,
  Typography,
  TextField,
  Button,
  Link,
  CircularProgress,
} from "@mui/material";
import { ArrowBack } from "@mui/icons-material";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import api from "../../services/api";
import EmailVerificationModal from "../../components/common/Modal/EmailVerificationModal";
import { useTheme } from "../../hooks/useTheme";
import { ROUTES } from "../../constants/routes";

const forgotPasswordSchema = yup.object().shape({
  email: yup
    .string()
    .email("Please enter a valid email address")
    .required("Email is required"),
});

const ForgotPasswordPage = () => {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [modalStatus, setModalStatus] = useState("idle");
  const [modalError, setModalError] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors },
    getValues,
  } = useForm({
    resolver: yupResolver(forgotPasswordSchema),
  });

  // Helper function to parse technical errors into user-friendly messages
  const parseErrorMessage = (error) => {
    const serverError = error.response?.data?.error;
    let errorMessage =
      serverError?.message ||
      error.response?.data?.message ||
      error.message ||
      "";

    // Parse technical error messages into user-friendly text
    if (
      errorMessage.includes("ECONNRESET") ||
      errorMessage.includes("read ECONNRESET")
    ) {
      return "Connection was interrupted. Please check your internet connection and try again.";
    }
    if (
      errorMessage.includes("ETIMEDOUT") ||
      errorMessage.includes("timed out")
    ) {
      return "Request timed out. The server might be experiencing issues. Please try again.";
    }
    if (
      errorMessage.includes("ENOTFOUND") ||
      errorMessage.includes("not found")
    ) {
      return "Unable to reach the server. Please check your internet connection.";
    }
    if (
      errorMessage.includes("ECONNREFUSED") ||
      errorMessage.includes("connection refused")
    ) {
      return "Unable to connect to the server. Please try again later.";
    }

    return (
      errorMessage || "Unable to send password reset email. Please try again."
    );
  };

  const onSubmit = async (data) => {
    setIsSubmitting(true);

    try {
      const response = await api.post("/auth/forgot-password", {
        email: data.email,
      });

      // Check if rate limited
      if (response.data?.rateLimited) {
        const message =
          response.data?.message ||
          "Email was already sent, please wait for 5 minutes before requesting again";
        setModalError(message);
        setModalStatus("error");
        setModalOpen(true);
        return;
      }

      // Success - show success modal, will redirect to login on close
      setModalStatus("success");
      setModalOpen(true);
    } catch (err) {
      // Handle network errors
      if (err.code === "ECONNABORTED" || err.code === "ERR_NETWORK") {
        setModalError(
          "Network error. Please check your connection and try again."
        );
        setModalStatus("error");
        setModalOpen(true);
        return;
      }

      // Handle cancelled requests
      if (err.message === "canceled" || err.message?.includes("cancel")) {
        setModalError("Request was cancelled. Please try again.");
        setModalStatus("error");
        setModalOpen(true);
        return;
      }

      // Handle timeouts
      if (err.code === "ECONNABORTED" || err.message?.includes("timeout")) {
        setModalError(
          "Request timed out. The server might be experiencing issues. Please try again."
        );
        setModalStatus("error");
        setModalOpen(true);
        return;
      }

      // Parse technical errors into user-friendly messages
      const errorMessage = parseErrorMessage(err);
      setModalError(errorMessage);
      setModalStatus("error");
      setModalOpen(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResendEmail = async () => {
    setIsSubmitting(true);

    try {
      const response = await api.post("/auth/forgot-password", {
        email: getValues("email"),
      });

      if (response.data?.rateLimited) {
        const message =
          response.data?.message ||
          "Email was already sent, please wait for 5 minutes before requesting again";
        setModalError(message);
        setModalStatus("error");
        setModalOpen(true);
        return;
      }

      setModalStatus("success");
      setModalOpen(true);
    } catch (err) {
      if (err.code === "ECONNABORTED" || err.code === "ERR_NETWORK") {
        setModalError(
          "Network error. Please check your connection and try again."
        );
        setModalStatus("error");
        setModalOpen(true);
        return;
      }

      if (err.message === "canceled" || err.message?.includes("cancel")) {
        setModalError("Request was cancelled. Please try again.");
        setModalStatus("error");
        setModalOpen(true);
        return;
      }

      if (err.code === "ECONNABORTED" || err.message?.includes("timeout")) {
        setModalError(
          "Request timed out. The server might be experiencing issues. Please try again."
        );
        setModalStatus("error");
        setModalOpen(true);
        return;
      }

      const errorMessage = parseErrorMessage(err);
      setModalError(errorMessage);
      setModalStatus("error");
      setModalOpen(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCloseModal = () => {
    setModalOpen(false);

    // If success, redirect to login page
    if (modalStatus === "success") {
      setTimeout(() => {
        navigate(ROUTES.AUTH.LOGIN);
      }, 300);
    } else {
      // For errors, just reset modal state
      setTimeout(() => {
        setModalStatus("idle");
        setModalError("");
      }, 300);
    }
  };

  return (
    <Box>
      <Typography
        variant="h4"
        component="h1"
        sx={{
          mb: { xs: 1, sm: 1.5 },
          fontWeight: 600,
          fontSize: { xs: "1.75rem", sm: "2rem" },
          color: theme.palette.text.primary,
        }}
      >
        Forgot Password?
      </Typography>

      <Typography
        variant="body2"
        sx={{
          mb: { xs: 3, sm: 4 },
          color: theme.palette.text.secondary,
          fontSize: { xs: "0.875rem", sm: "0.938rem" },
        }}
      >
        Enter your email address and we'll send you a link to reset your
        password.
      </Typography>

      <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
        <TextField
          fullWidth
          label="Email Address"
          type="email"
          {...register("email")}
          error={!!errors.email}
          helperText={errors.email?.message}
          disabled={isSubmitting}
          autoFocus
          sx={{ mb: { xs: 2, sm: 3 } }}
        />

        <Button
          type="submit"
          fullWidth
          variant="contained"
          size="large"
          disabled={isSubmitting}
          sx={{
            mb: { xs: 2, sm: 2.5 },
            py: { xs: 1.25, sm: 1.5 },
            textTransform: "none",
            fontSize: { xs: "0.938rem", sm: "1rem" },
            fontWeight: 500,
          }}
        >
          {isSubmitting ? <CircularProgress size={24} /> : "Send Reset Link"}
        </Button>

        <Box sx={{ textAlign: "center" }}>
          <Link
            component={RouterLink}
            to={ROUTES.AUTH.LOGIN}
            variant="body2"
            sx={{
              color: theme.palette.primary.main,
              textDecoration: "none",
              display: "inline-flex",
              alignItems: "center",
              gap: 0.5,
              fontSize: { xs: "0.85rem", sm: "0.875rem" },
              "&:hover": { textDecoration: "underline" },
            }}
          >
            <ArrowBack sx={{ fontSize: 18 }} />
            Back to Login
          </Link>
        </Box>
      </Box>

      {/* Email Verification Modal */}
      <EmailVerificationModal
        open={modalOpen}
        onClose={handleCloseModal}
        status={modalStatus}
        type="forgot-password"
        email={getValues("email")}
        error={modalError}
        onResend={handleResendEmail}
        isResending={isSubmitting}
      />
    </Box>
  );
};

export default ForgotPasswordPage;
