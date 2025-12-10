import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  Box,
  Container,
  Typography,
  TextField,
  Button,
  Paper,
  Alert,
  CircularProgress,
} from "@mui/material";
import { Email, ArrowBack } from "@mui/icons-material";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import api from "../../services/api";
import { EmailVerificationModal } from "../../components/common/Modal";

const forgotPasswordSchema = yup.object().shape({
  email: yup
    .string()
    .email("Please enter a valid email address")
    .required("Email is required"),
});

const ForgotPasswordPage = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [modalStatus, setModalStatus] = useState("idle");
  const [modalError, setModalError] = useState("");

  // Clear error when component unmounts
  React.useEffect(() => {
    return () => {
      setError("");
    };
  }, []);

  const {
    register,
    handleSubmit,
    formState: { errors },
    getValues,
  } = useForm({
    resolver: yupResolver(forgotPasswordSchema),
  });

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    setError("");
    setModalStatus("loading");
    setModalOpen(true);

    try {
      await api.post("/auth/forgot-password", {
        email: data.email,
      });

      setSubmitted(true);
      setModalStatus("success");
    } catch (err) {
      const serverError = err.response?.data?.error;
      const errorMessage =
        serverError?.message ||
        err.response?.data?.message ||
        "Failed to send password reset email. Please try again.";
      setError(errorMessage);
      setModalError(errorMessage);
      setModalStatus("error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResendEmail = async () => {
    setIsSubmitting(true);
    setError("");
    setModalStatus("loading");

    try {
      await api.post("/auth/forgot-password", {
        email: getValues("email"),
      });

      setError("");
      setSubmitted(true);
      setModalStatus("success");
    } catch (err) {
      const serverError = err.response?.data?.error;
      const errorMessage =
        serverError?.message ||
        err.response?.data?.message ||
        "Failed to resend email. Please wait a moment and try again.";
      setError(errorMessage);
      setModalError(errorMessage);
      setModalStatus("error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setTimeout(() => {
      setModalStatus("idle");
      setModalError("");
    }, 300);
  };

  if (submitted) {
    return (
      <Container maxWidth="sm">
        <Box
          sx={{
            minHeight: "100vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            py: 4,
          }}
        >
          <Paper
            elevation={3}
            sx={{
              p: 4,
              width: "100%",
              textAlign: "center",
              borderRadius: 2,
            }}
          >
            <Email
              sx={{
                fontSize: 80,
                color: "primary.main",
                mb: 2,
              }}
            />
            <Typography variant="h5" gutterBottom>
              Check Your Email
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              If an account exists with <strong>{getValues("email")}</strong>,
              you will receive a password reset link shortly.
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              The link will expire in 15 minutes for security reasons.
            </Typography>

            <Alert severity="info" sx={{ mb: 3, textAlign: "left" }}>
              <Typography variant="body2">
                <strong>Didn't receive the email?</strong>
                <br />
                • Check your spam/junk folder
                <br />
                • Make sure you entered the correct email
                <br />• Wait a few minutes before trying again
              </Typography>
            </Alert>

            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              <Button
                variant="outlined"
                onClick={handleResendEmail}
                disabled={isSubmitting}
              >
                {isSubmitting ? <CircularProgress size={24} /> : "Resend Email"}
              </Button>
              <Button
                variant="text"
                startIcon={<ArrowBack />}
                onClick={() => navigate("/auth/login")}
              >
                Back to Login
              </Button>
            </Box>

            {error && (
              <Alert severity="error" sx={{ mt: 2 }}>
                {error}
              </Alert>
            )}
          </Paper>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="sm">
      <Box
        sx={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          py: 4,
        }}
      >
        <Paper
          elevation={3}
          sx={{
            p: 4,
            width: "100%",
            borderRadius: 2,
          }}
        >
          <Typography variant="h4" gutterBottom align="center">
            Forgot Password?
          </Typography>
          <Typography
            variant="body1"
            color="text.secondary"
            align="center"
            sx={{ mb: 4 }}
          >
            Enter your email address and we'll send you a link to reset your
            password.
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          <form onSubmit={handleSubmit(onSubmit)}>
            <TextField
              fullWidth
              label="Email Address"
              type="email"
              {...register("email")}
              error={!!errors.email}
              helperText={errors.email?.message}
              disabled={isSubmitting}
              sx={{ mb: 3 }}
              autoFocus
            />

            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              disabled={isSubmitting}
              sx={{ mb: 2 }}
            >
              {isSubmitting ? (
                <CircularProgress size={24} />
              ) : (
                "Send Reset Link"
              )}
            </Button>

            <Box sx={{ textAlign: "center" }}>
              <Button
                component={Link}
                to="/auth/login"
                startIcon={<ArrowBack />}
                sx={{ textTransform: "none" }}
              >
                Back to Login
              </Button>
            </Box>
          </form>
        </Paper>

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
    </Container>
  );
};

export default ForgotPasswordPage;
