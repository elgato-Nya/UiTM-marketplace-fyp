import React, { useEffect } from "react";
import {
  Container,
  Box,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
} from "@mui/material";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import {
  Store,
  VerifiedUser,
  Analytics,
  SupportAgent,
  TrendingUp,
  Security,
} from "@mui/icons-material";
import { useTheme } from "../../hooks/useTheme";
import { useAuth } from "../../features/auth/hooks/useAuth";
import MerchantVerificationCard from "../../features/merchant/components/MerchantVerificationCard";
import { ROUTES } from "../../constants/routes";
import { isUiTMEmail } from "../../utils/emailUtils";

/**
 * BecomeMerchantPage Component
 *
 * PURPOSE: Landing page for merchant application
 * ROUTE: /merchant/become
 * FEATURES:
 * - Show merchant benefits
 * - Merchant verification form
 * - Redirect if already verified
 */

function BecomeMerchantPage() {
  const { theme } = useTheme();
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const isVerified = user?.merchantDetails?.isUiTMVerified;
  const userEmail = user?.email || "";
  const isUiTMUser = isUiTMEmail(userEmail);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      navigate(ROUTES.AUTH.LOGIN, {
        state: { from: ROUTES.MERCHANT.BECOME },
      });
    }
  }, [isAuthenticated, navigate]);

  // Redirect to merchant dashboard if already verified
  useEffect(() => {
    if (isVerified) {
      navigate("/merchant/store");
    }
  }, [isVerified, navigate]);

  const benefits = [
    {
      icon: <Store fontSize="large" />,
      title: "Create Unlimited Listings",
      description: "Sell as many products as you want with no limits",
    },
    {
      icon: <VerifiedUser fontSize="large" />,
      title: "Get Verified Badge",
      description: "Stand out with a UiTM verified merchant badge",
    },
    {
      icon: <Analytics fontSize="large" />,
      title: "Access Analytics",
      description: "Track your sales, views, and customer insights",
    },
    {
      icon: <SupportAgent fontSize="large" />,
      title: "Priority Support",
      description: "Get faster help from our merchant support team",
    },
    {
      icon: <TrendingUp fontSize="large" />,
      title: "Grow Your Business",
      description: "Reach thousands of UiTM students and staff",
    },
    {
      icon: <Security fontSize="large" />,
      title: "Permanent Status",
      description: "Keep merchant status even after graduation",
    },
  ];

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box textAlign="center" mb={4}>
        <Typography variant="h3" fontWeight="bold" gutterBottom>
          🛍️ Become a Merchant
        </Typography>
        <Typography variant="h6" color="text.secondary" gutterBottom>
          Verify your UiTM email to start selling on our marketplace
        </Typography>
      </Box>

      <Grid container spacing={4}>
        {/* Left Side - Benefits */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Typography variant="h5" fontWeight="bold" gutterBottom>
            Merchant Benefits
          </Typography>
          <Typography variant="body2" color="text.secondary" paragraph>
            Join hundreds of UiTM students and staff selling on our platform
          </Typography>

          <Grid container spacing={2}>
            {benefits.map((benefit, index) => (
              <Grid size={{ xs: 12, sm: 6 }} key={index}>
                <Card variant="outlined" sx={{ height: "100%" }}>
                  <CardContent>
                    <Box display="flex" alignItems="center" gap={1} mb={1}>
                      {benefit.icon}
                      <Typography variant="subtitle2" fontWeight="bold">
                        {benefit.title}
                      </Typography>
                    </Box>
                    <Typography variant="caption" color="text.secondary">
                      {benefit.description}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Grid>

        {/* Right Side - Verification Card */}
        <Grid size={{ xs: 12, md: 6 }}>
          <MerchantVerificationCard
            user={user}
            isUiTMEmail={isUiTMUser}
            userEmail={userEmail}
            onVerificationSuccess={() => {
              // Verification submitted successfully
            }}
          />

          <Card variant="outlined" sx={{ mt: 2 }}>
            <CardContent>
              <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                📋 Verification Process
              </Typography>
              <Typography variant="caption" component="ol" sx={{ pl: 2 }}>
                <li>Submit your UiTM email address</li>
                <li>Check your UiTM inbox for verification email</li>
                <li>Click the verification link (expires in 24 hours)</li>
                <li>Get instant merchant access! 🎉</li>
              </Typography>

              <Box mt={2} p={2} bgcolor="info.50" borderRadius={1}>
                <Typography
                  variant="caption"
                  color="info.main"
                  fontWeight="bold"
                  display="block"
                >
                  💡 Quick Tip
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {isUiTMUser
                    ? "Great! Since you registered with a UiTM email, you can verify instantly by clicking the button above."
                    : "For fastest verification, use your student@uitm.edu.my or staff@uitm.edu.my email address."}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
}

export default BecomeMerchantPage;
