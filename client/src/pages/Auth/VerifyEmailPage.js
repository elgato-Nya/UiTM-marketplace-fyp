import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  Box,
  Container,
  Typography,
  CircularProgress,
  Button,
  Paper,
} from "@mui/material";
import { CheckCircle, Error, Email } from "@mui/icons-material";
import api from "../../services/api";
import { ROUTES } from "../../constants/routes";

const VerifyEmailPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState("verifying"); // verifying, success, error
  const [message, setMessage] = useState("Verifying your email...");
  const [countdown, setCountdown] = useState(5);

  const token = searchParams.get("token");
  const email = searchParams.get("email");

  useEffect(() => {
    const verifyEmail = async () => {
      if (!token || !email) {
        setStatus("error");
        setMessage(
          "Invalid verification link. Please check your email and try again."
        );
        return;
      }

      try {
        const response = await api.post("/auth/verify-email", {
          email: decodeURIComponent(email),
          token: token,
        });

        setStatus("success");
        setMessage(
          response.data.message ||
            "Email verified successfully! Redirecting to login..."
        );

        // Start countdown
        let count = 5;
        const interval = setInterval(() => {
          count -= 1;
          setCountdown(count);
          if (count === 0) {
            clearInterval(interval);
            navigate(ROUTES.AUTH.LOGIN);
          }
        }, 1000);

        return () => clearInterval(interval);
      } catch (error) {
        setStatus("error");
        const errorMsg =
          error.response?.data?.message ||
          "Failed to verify email. The link may have expired.";
        setMessage(errorMsg);
      }
    };

    verifyEmail();
  }, [token, email, navigate]);

  const handleResendVerification = async () => {
    try {
      setStatus("verifying");
      setMessage("Sending new verification email...");

      await api.post("/auth/resend-verification", {
        email: decodeURIComponent(email),
      });

      setStatus("success");
      setMessage("Verification email sent! Please check your inbox.");
    } catch (error) {
      setStatus("error");
      setMessage(
        error.response?.data?.message || "Failed to resend verification email."
      );
    }
  };

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
          {status === "verifying" && (
            <>
              <CircularProgress size={60} sx={{ mb: 3 }} />
              <Typography variant="h5" gutterBottom>
                Verifying Your Email
              </Typography>
              <Typography variant="body1" color="text.secondary">
                {message}
              </Typography>
            </>
          )}

          {status === "success" && (
            <>
              <CheckCircle
                sx={{
                  fontSize: 80,
                  color: "success.main",
                  mb: 2,
                }}
              />
              <Typography variant="h5" gutterBottom color="success.main">
                Email Verified!
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
                {message}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Redirecting in {countdown} seconds...
              </Typography>
              <Button
                variant="contained"
                color="primary"
                onClick={() => navigate(ROUTES.AUTH.LOGIN)}
                sx={{ mt: 3 }}
              >
                Go to Login Now
              </Button>
            </>
          )}

          {status === "error" && (
            <>
              <Error
                sx={{
                  fontSize: 80,
                  color: "error.main",
                  mb: 2,
                }}
              />
              <Typography variant="h5" gutterBottom color="error.main">
                Verification Failed
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                {message}
              </Typography>

              <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                {email && (
                  <Button
                    variant="contained"
                    color="primary"
                    startIcon={<Email />}
                    onClick={handleResendVerification}
                  >
                    Resend Verification Email
                  </Button>
                )}
                <Button
                  variant="outlined"
                  onClick={() => navigate(ROUTES.AUTH.LOGIN)}
                >
                  Back to Login
                </Button>
              </Box>
            </>
          )}
        </Paper>
      </Box>
    </Container>
  );
};

export default VerifyEmailPage;
