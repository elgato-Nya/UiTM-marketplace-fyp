import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import {
  Box,
  Container,
  Typography,
  TextField,
  Button,
  Paper,
  Alert,
  CircularProgress,
  InputAdornment,
  IconButton,
} from "@mui/material";
import {
  Visibility,
  VisibilityOff,
  CheckCircle,
  Error as ErrorIcon,
} from "@mui/icons-material";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import api from "../../services/api";

const resetPasswordSchema = yup.object().shape({
  newPassword: yup
    .string()
    .min(8, "Password must be at least 8 characters")
    .matches(/[a-z]/, "Password must contain at least one lowercase letter")
    .matches(/[A-Z]/, "Password must contain at least one uppercase letter")
    .matches(/[0-9]/, "Password must contain at least one number")
    .required("Password is required"),
  confirmPassword: yup
    .string()
    .oneOf([yup.ref("newPassword"), null], "Passwords must match")
    .required("Please confirm your password"),
});

const ResetPasswordPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [tokenValidating, setTokenValidating] = useState(true);
  const [tokenValid, setTokenValid] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [countdown, setCountdown] = useState(5);

  const token = searchParams.get("token");
  const email = searchParams.get("email");

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(resetPasswordSchema),
  });

  // Validate token on mount
  useEffect(() => {
    const validateToken = async () => {
      if (!token || !email) {
        setError("Invalid reset link. Please request a new password reset.");
        setTokenValidating(false);
        setTokenValid(false);
        return;
      }

      try {
        await api.post("/auth/validate-reset-token", {
          email: decodeURIComponent(email),
          token: token,
        });

        setTokenValid(true);
      } catch (err) {
        setError(
          err.response?.data?.message ||
            "This reset link has expired or is invalid. Please request a new one."
        );
        setTokenValid(false);
      } finally {
        setTokenValidating(false);
      }
    };

    validateToken();
  }, [token, email]);

  // Countdown and redirect after success
  useEffect(() => {
    if (success) {
      let count = 5;
      const interval = setInterval(() => {
        count -= 1;
        setCountdown(count);
        if (count === 0) {
          clearInterval(interval);
          navigate("/auth/login");
        }
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [success, navigate]);

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    setError("");

    try {
      await api.post("/auth/reset-password", {
        email: decodeURIComponent(email),
        token: token,
        newPassword: data.newPassword,
      });

      setSuccess(true);
    } catch (err) {
      const errorMessage =
        err.response?.data?.message ||
        "Failed to reset password. Please try again or request a new reset link.";
      setError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Loading state
  if (tokenValidating) {
    return (
      <Container maxWidth="sm">
        <Box
          sx={{
            minHeight: "100vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Paper elevation={3} sx={{ p: 4, textAlign: "center" }}>
            <CircularProgress size={60} sx={{ mb: 2 }} />
            <Typography variant="h6">Validating reset link...</Typography>
          </Paper>
        </Box>
      </Container>
    );
  }

  // Success state
  if (success) {
    return (
      <Container maxWidth="sm">
        <Box
          sx={{
            minHeight: "100vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Paper elevation={3} sx={{ p: 4, textAlign: "center" }}>
            <CheckCircle
              sx={{
                fontSize: 80,
                color: "success.main",
                mb: 2,
              }}
            />
            <Typography variant="h5" gutterBottom color="success.main">
              Password Reset Successful!
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
              Your password has been successfully reset. You can now login with
              your new password.
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Redirecting to login in {countdown} seconds...
            </Typography>
            <Button
              variant="contained"
              color="primary"
              onClick={() => navigate("/auth/login")}
            >
              Go to Login Now
            </Button>
          </Paper>
        </Box>
      </Container>
    );
  }

  // Invalid token state
  if (!tokenValid) {
    return (
      <Container maxWidth="sm">
        <Box
          sx={{
            minHeight: "100vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Paper elevation={3} sx={{ p: 4, textAlign: "center" }}>
            <ErrorIcon
              sx={{
                fontSize: 80,
                color: "error.main",
                mb: 2,
              }}
            />
            <Typography variant="h5" gutterBottom color="error.main">
              Invalid Reset Link
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              {error}
            </Typography>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              <Button
                variant="contained"
                onClick={() => navigate("/auth/forgot-password")}
              >
                Request New Reset Link
              </Button>
              <Button
                variant="outlined"
                onClick={() => navigate("/auth/login")}
              >
                Back to Login
              </Button>
            </Box>
          </Paper>
        </Box>
      </Container>
    );
  }

  // Reset form
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
        <Paper elevation={3} sx={{ p: 4, width: "100%", borderRadius: 2 }}>
          <Typography variant="h4" gutterBottom align="center">
            Reset Password
          </Typography>
          <Typography
            variant="body1"
            color="text.secondary"
            align="center"
            sx={{ mb: 4 }}
          >
            Enter your new password below.
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          <form onSubmit={handleSubmit(onSubmit)}>
            <TextField
              fullWidth
              label="New Password"
              type={showPassword ? "text" : "password"}
              {...register("newPassword")}
              error={!!errors.newPassword}
              helperText={errors.newPassword?.message}
              disabled={isSubmitting}
              sx={{ mb: 3 }}
              autoFocus
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowPassword(!showPassword)}
                      edge="end"
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            <TextField
              fullWidth
              label="Confirm New Password"
              type={showConfirmPassword ? "text" : "password"}
              {...register("confirmPassword")}
              error={!!errors.confirmPassword}
              helperText={errors.confirmPassword?.message}
              disabled={isSubmitting}
              sx={{ mb: 3 }}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                      edge="end"
                    >
                      {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            <Alert severity="info" sx={{ mb: 3 }}>
              <Typography variant="body2">
                <strong>Password requirements:</strong>
                <br />• At least 8 characters
                <br />• One uppercase letter
                <br />• One lowercase letter
                <br />• One number
              </Typography>
            </Alert>

            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              disabled={isSubmitting}
              sx={{ mb: 2 }}
            >
              {isSubmitting ? <CircularProgress size={24} /> : "Reset Password"}
            </Button>

            <Box sx={{ textAlign: "center" }}>
              <Button
                component={Link}
                to="/auth/login"
                sx={{ textTransform: "none" }}
              >
                Back to Login
              </Button>
            </Box>
          </form>
        </Paper>
      </Box>
    </Container>
  );
};

export default ResetPasswordPage;
