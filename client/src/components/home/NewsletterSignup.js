import React, { useState } from "react";
import {
  Box,
  Container,
  Typography,
  TextField,
  Button,
  Paper,
  InputAdornment,
  Alert,
  CircularProgress,
} from "@mui/material";
import { Email, Send } from "@mui/icons-material";

import { useTheme } from "../../hooks/useTheme";

function NewsletterSignup() {
  const { theme, isAccessible } = useTheme();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("Please enter a valid email address");
      return;
    }

    setLoading(true);
    setError("");

    try {
      // TODO: Implement actual newsletter subscription API
      await new Promise((resolve) => setTimeout(resolve, 1500));

      setSuccess(true);
      setEmail("");

      // Reset success message after 5 seconds
      setTimeout(() => setSuccess(false), 5000);
    } catch (err) {
      setError("Failed to subscribe. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        bgcolor: theme.palette.primary.main,
        color: "white",
        py: 4,
        mb: 4,
      }}
    >
      <Container maxWidth="md" sx={{ px: { xs: 2, sm: 3 } }}>
        <Box sx={{ textAlign: "center", mb: 3 }}>
          <Typography
            variant="h5"
            component="h2"
            sx={{
              fontWeight: "bold",
              mb: 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 1,
            }}
          >
            <Email sx={{ fontSize: 28 }} />
            Stay Updated
          </Typography>
          <Typography variant="body1" sx={{ opacity: 0.9 }}>
            Subscribe for exclusive deals and campus updates
          </Typography>
        </Box>

        <Paper
          component="form"
          onSubmit={handleSubmit}
          elevation={isAccessible ? 0 : 4}
          sx={{
            p: 1.5,
            display: "flex",
            flexDirection: { xs: "column", sm: "row" },
            gap: 1.5,
            bgcolor: "white",
            border: isAccessible
              ? `2px solid ${theme.palette.primary.dark}`
              : "none",
            borderRadius: 2,
          }}
        >
          <TextField
            fullWidth
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={loading}
            size="small"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Email color="action" fontSize="small" />
                </InputAdornment>
              ),
            }}
            sx={{
              flex: 1,
              "& .MuiOutlinedInput-root": {
                bgcolor: "white",
              },
            }}
          />
          <Button
            type="submit"
            variant="contained"
            disabled={loading || !email}
            endIcon={
              loading ? (
                <CircularProgress size={16} color="inherit" />
              ) : (
                <Send fontSize="small" />
              )
            }
            sx={{
              bgcolor: theme.palette.secondary.main,
              color: theme.palette.secondary.contrastText,
              minWidth: { xs: "100%", sm: 120 },
              px: 3,
              "&:hover": {
                bgcolor: theme.palette.secondary.dark,
              },
              "&:disabled": {
                bgcolor: theme.palette.action.disabledBackground,
              },
            }}
          >
            Subscribe
          </Button>
        </Paper>

        {/* Success/Error Messages */}
        {success && (
          <Alert
            severity="success"
            sx={{ mt: 2, bgcolor: "white" }}
            onClose={() => setSuccess(false)}
          >
            Thank you for subscribing!
          </Alert>
        )}

        {error && (
          <Alert
            severity="error"
            sx={{ mt: 2, bgcolor: "white" }}
            onClose={() => setError("")}
          >
            {error}
          </Alert>
        )}

        <Typography
          variant="caption"
          sx={{
            textAlign: "center",
            mt: 2,
            opacity: 0.8,
            display: "block",
          }}
        >
          We respect your privacy. Unsubscribe anytime.
        </Typography>
      </Container>
    </Box>
  );
}

export default NewsletterSignup;
