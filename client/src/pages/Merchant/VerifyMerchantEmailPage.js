import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  Container,
  Box,
  Typography,
  CircularProgress,
  Card,
  CardContent,
  Button,
} from "@mui/material";
import { CheckCircle, Error, HourglassEmpty } from "@mui/icons-material";
import { useMerchantVerification } from "../../features/merchant/hooks/useMerchantVerification";
import { ROUTES } from "../../constants/routes";

/**
 * VerifyMerchantEmailPage Component
 *
 * PURPOSE: Handle email verification token from URL
 * ROUTE: /merchant/verify-email?token=xxx
 * FEATURES:
 * - Extract token from query params
 * - Call verification API
 * - Show success/error states
 * - Redirect after verification
 */

const VERIFICATION_STATES = {
  LOADING: "loading",
  SUCCESS: "success",
  ERROR: "error",
  NO_TOKEN: "no_token",
};

function VerifyMerchantEmailPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { verifyEmail, loading } = useMerchantVerification();

  const [state, setState] = useState(VERIFICATION_STATES.LOADING);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const token = searchParams.get("token");

    if (!token) {
      setState(VERIFICATION_STATES.NO_TOKEN);
      return;
    }

    // Auto-verify on mount
    handleVerification(token);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleVerification = async (token) => {
    try {
      setState(VERIFICATION_STATES.LOADING);
      await verifyEmail(token);
      setState(VERIFICATION_STATES.SUCCESS);

      // Redirect to merchant dashboard after 3 seconds
      setTimeout(() => {
        navigate("/merchant/store");
      }, 3000);
    } catch (error) {
      setState(VERIFICATION_STATES.ERROR);
      setErrorMessage(
        error.response?.data?.message ||
          "Verification failed. Token may be invalid or expired."
      );
    }
  };

  const renderContent = () => {
    switch (state) {
      case VERIFICATION_STATES.LOADING:
        return (
          <Box textAlign="center" py={8}>
            <CircularProgress size={60} />
            <Typography variant="h5" fontWeight="bold" mt={3} gutterBottom>
              Verifying Your Email...
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Please wait while we verify your UiTM email address
            </Typography>
            <HourglassEmpty
              sx={{ fontSize: 48, color: "primary.main", mt: 2, opacity: 0.5 }}
            />
          </Box>
        );

      case VERIFICATION_STATES.SUCCESS:
        return (
          <Box textAlign="center" py={8}>
            <CheckCircle sx={{ fontSize: 80, color: "success.main" }} />
            <Typography
              variant="h4"
              fontWeight="bold"
              color="success.main"
              mt={2}
              gutterBottom
            >
              🎉 Verification Successful!
            </Typography>
            <Typography variant="body1" color="text.secondary" paragraph>
              Your UiTM email has been verified successfully
            </Typography>
            <Typography variant="body2" color="text.secondary">
              You now have merchant access!
            </Typography>

            <Box
              mt={4}
              p={3}
              bgcolor="success.50"
              borderRadius={2}
              maxWidth={400}
              mx="auto"
            >
              <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                ✅ What's Next?
              </Typography>
              <Typography
                variant="caption"
                component="ul"
                sx={{ textAlign: "left", pl: 2 }}
              >
                <li>Create your first listing</li>
                <li>Manage your products</li>
                <li>Track your sales</li>
                <li>Access merchant analytics</li>
              </Typography>
            </Box>

            <Typography
              variant="caption"
              color="text.secondary"
              display="block"
              mt={3}
            >
              Redirecting to Merchant Dashboard in 3 seconds...
            </Typography>

            <Button
              variant="contained"
              size="large"
              onClick={() => navigate("/merchant/store")}
              sx={{ mt: 2 }}
            >
              Go to Merchant Dashboard
            </Button>
          </Box>
        );

      case VERIFICATION_STATES.ERROR:
        return (
          <Box textAlign="center" py={8}>
            <Error sx={{ fontSize: 80, color: "error.main" }} />
            <Typography
              variant="h4"
              fontWeight="bold"
              color="error.main"
              mt={2}
              gutterBottom
            >
              Verification Failed
            </Typography>
            <Typography variant="body1" color="text.secondary" paragraph>
              {errorMessage}
            </Typography>

            <Box
              mt={4}
              p={3}
              bgcolor="error.50"
              borderRadius={2}
              maxWidth={400}
              mx="auto"
            >
              <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                ⚠️ Possible Reasons:
              </Typography>
              <Typography
                variant="caption"
                component="ul"
                sx={{ textAlign: "left", pl: 2 }}
              >
                <li>Token expired (24 hour limit)</li>
                <li>Token already used</li>
                <li>Invalid or corrupted link</li>
                <li>Email already verified</li>
              </Typography>
            </Box>

            <Box
              mt={3}
              display="flex"
              flexDirection="column"
              gap={2}
              alignItems="center"
            >
              <Button
                variant="contained"
                size="large"
                onClick={() => navigate(ROUTES.MERCHANT.BECOME)}
              >
                Request New Verification Email
              </Button>
              <Button
                variant="text"
                size="small"
                onClick={() => navigate(ROUTES.HOME)}
              >
                Back to Home
              </Button>
            </Box>
          </Box>
        );

      case VERIFICATION_STATES.NO_TOKEN:
        return (
          <Box textAlign="center" py={8}>
            <Error sx={{ fontSize: 80, color: "warning.main" }} />
            <Typography
              variant="h4"
              fontWeight="bold"
              color="warning.main"
              mt={2}
              gutterBottom
            >
              Missing Verification Token
            </Typography>
            <Typography variant="body1" color="text.secondary" paragraph>
              No verification token found in the URL
            </Typography>

            <Box
              mt={4}
              p={3}
              bgcolor="warning.50"
              borderRadius={2}
              maxWidth={400}
              mx="auto"
            >
              <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                💡 How to Verify:
              </Typography>
              <Typography
                variant="caption"
                component="ol"
                sx={{ textAlign: "left", pl: 2 }}
              >
                <li>Go to "Become a Merchant" page</li>
                <li>Submit your UiTM email</li>
                <li>Check your UiTM inbox</li>
                <li>Click the verification link</li>
              </Typography>
            </Box>

            <Box
              mt={3}
              display="flex"
              flexDirection="column"
              gap={2}
              alignItems="center"
            >
              <Button
                variant="contained"
                size="large"
                onClick={() => navigate(ROUTES.MERCHANT.BECOME)}
              >
                Go to Merchant Application
              </Button>
              <Button
                variant="text"
                size="small"
                onClick={() => navigate(ROUTES.HOME)}
              >
                Back to Home
              </Button>
            </Box>
          </Box>
        );

      default:
        return null;
    }
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Card variant="outlined">
        <CardContent sx={{ p: 4 }}>{renderContent()}</CardContent>
      </Card>
    </Container>
  );
}

export default VerifyMerchantEmailPage;
