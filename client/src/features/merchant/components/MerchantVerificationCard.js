import React, { useState } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Alert,
  Chip,
  Divider,
} from "@mui/material";
import {
  VerifiedUser,
  Email,
  CheckCircle,
  HourglassEmpty,
} from "@mui/icons-material";
import { useTheme } from "../../../hooks/useTheme";
import DynamicForm from "../../../components/common/Form/DynamicForm";
import EmailVerificationModal from "../../../components/common/Modal/EmailVerificationModal";
import { merchantVerificationFormConfig } from "../../../config/forms/merchantForms";
import { merchantVerificationSchema } from "../../../validation/merchantValidator";
import { useMerchantVerification } from "../hooks/useMerchantVerification";

/**
 * MerchantVerificationCard Component
 *
 * PURPOSE: Display and manage merchant verification status
 * FEATURES:
 * - Show verification status (verified, pending, not verified)
 * - Submit UiTM email for verification
 * - Auto-verify if registered with UiTM email
 * - Responsive design
 */

function MerchantVerificationCard({
  user,
  isUiTMEmail,
  userEmail,
  onVerificationSuccess,
}) {
  const { theme } = useTheme();
  const { submitVerification, isLoading } = useMerchantVerification();
  const [showForm, setShowForm] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [modalStatus, setModalStatus] = useState("idle");
  const [modalError, setModalError] = useState("");
  const [verificationEmail, setVerificationEmail] = useState("");

  const isVerified = user?.merchantDetails?.isUiTMVerified;
  const existingVerificationEmail = user?.merchantDetails?.verificationEmail;

  const handleSubmit = async (data) => {
    setModalStatus("loading");
    setModalOpen(true);
    setVerificationEmail(data.verificationEmail);

    const result = await submitVerification(data.verificationEmail);
    if (result.success) {
      setModalStatus("success");
      setSubmitted(true);
      setShowForm(false);
      if (onVerificationSuccess) {
        onVerificationSuccess(result.data);
      }
    } else {
      setModalError(result.error || "Verification failed");
      setModalStatus("error");
    }
  };

  const handleAutoVerify = async () => {
    if (isUiTMEmail && userEmail) {
      setModalStatus("loading");
      setModalOpen(true);
      setVerificationEmail(userEmail);

      const result = await submitVerification(userEmail);
      if (result.success) {
        setModalStatus("success");
        if (onVerificationSuccess) {
          onVerificationSuccess(result.data);
        }
      } else {
        setModalError(result.error || "Verification failed");
        setModalStatus("error");
      }
    }
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setTimeout(() => {
      setModalStatus("idle");
      setModalError("");
    }, 300);
  };

  // Already verified
  if (isVerified) {
    return (
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box display="flex" alignItems="center" gap={2} mb={2}>
            <CheckCircle color="success" sx={{ fontSize: 40 }} />
            <Box>
              <Typography variant="h6" gutterBottom>
                Merchant Status Verified ✅
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Your UiTM email has been verified
              </Typography>
            </Box>
          </Box>

          {verificationEmail && (
            <Alert severity="success" sx={{ mt: 2 }}>
              <Typography variant="body2">
                <strong>Verified Email:</strong> {verificationEmail}
              </Typography>
              <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                🔒 This email is private and only visible to you
              </Typography>
            </Alert>
          )}

          <Box mt={2}>
            <Chip
              icon={<VerifiedUser />}
              label="Permanent Merchant Status"
              color="success"
              size="small"
            />
          </Box>
        </CardContent>
      </Card>
    );
  }

  // Verification submitted - pending
  if (submitted) {
    return (
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box display="flex" alignItems="center" gap={2} mb={2}>
            <HourglassEmpty color="warning" sx={{ fontSize: 40 }} />
            <Box>
              <Typography variant="h6" gutterBottom>
                Verification Email Sent 📧
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Check your UiTM inbox and click the verification link
              </Typography>
            </Box>
          </Box>

          <Alert severity="info" sx={{ mt: 2 }}>
            <Typography variant="body2">
              <strong>Next Steps:</strong>
            </Typography>
            <Typography variant="caption" component="ul" sx={{ pl: 2, mt: 1 }}>
              <li>Check your UiTM email inbox</li>
              <li>Click the verification link in the email</li>
              <li>Link expires in 24 hours</li>
            </Typography>
          </Alert>

          <Button
            variant="text"
            size="small"
            onClick={() => {
              setSubmitted(false);
              setShowForm(true);
            }}
            sx={{ mt: 2 }}
          >
            Resend Verification
          </Button>
        </CardContent>
      </Card>
    );
  }

  // Not verified - show form or call-to-action
  return (
    <Card sx={{ mb: 3 }}>
      <CardContent>
        <Box display="flex" alignItems="center" gap={2} mb={2}>
          <Email color="primary" sx={{ fontSize: 40 }} />
          <Box>
            <Typography variant="h6" gutterBottom>
              Become a Verified Merchant 🏪
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Verify your UiTM email to unlock merchant features
            </Typography>
          </Box>
        </Box>

        <Divider sx={{ my: 2 }} />

        {/* Auto-verify option for users registered with UiTM email */}
        {isUiTMEmail && !showForm && (
          <Box>
            <Alert severity="success" sx={{ mb: 2 }}>
              <Typography variant="body2" fontWeight="bold" gutterBottom>
                ✅ UiTM Email Detected!
              </Typography>
              <Typography variant="caption">
                You registered with <strong>{userEmail}</strong>. You can
                instantly verify your merchant status!
              </Typography>
            </Alert>

            <Button
              variant="contained"
              fullWidth
              onClick={handleAutoVerify}
              disabled={isLoading}
              startIcon={<VerifiedUser />}
              sx={{ mb: 2 }}
            >
              {isLoading ? "Verifying..." : "Verify with My UiTM Email"}
            </Button>

            <Divider sx={{ my: 2 }}>
              <Typography variant="caption" color="text.secondary">
                OR
              </Typography>
            </Divider>

            <Button
              variant="text"
              fullWidth
              size="small"
              onClick={() => setShowForm(true)}
            >
              Use a Different UiTM Email
            </Button>
          </Box>
        )}

        {/* Regular verification for non-UiTM emails */}
        {!isUiTMEmail && !showForm && (
          <Box>
            <Alert severity="info" sx={{ mb: 2 }}>
              <Typography variant="body2" fontWeight="bold" gutterBottom>
                Why verify?
              </Typography>
              <Typography variant="caption" component="ul" sx={{ pl: 2, m: 0 }}>
                <li>Create unlimited listings</li>
                <li>Get verified merchant badge</li>
                <li>Access analytics dashboard</li>
                <li>Permanent status after graduation</li>
              </Typography>
            </Alert>

            <Button
              variant="contained"
              fullWidth
              onClick={() => setShowForm(true)}
              startIcon={<VerifiedUser />}
            >
              Start Verification
            </Button>
          </Box>
        )}

        {/* Verification form */}
        {showForm && (
          <Box>
            <DynamicForm
              config={merchantVerificationFormConfig}
              validationSchema={merchantVerificationSchema}
              onSubmit={handleSubmit}
              onCancel={() => setShowForm(false)}
              isLoading={isLoading}
            />
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ mt: 2, display: "block" }}
            >
              🔒 Your UiTM email will be kept private and used only for
              verification
            </Typography>
          </Box>
        )}
      </CardContent>

      {/* Email Verification Modal */}
      <EmailVerificationModal
        open={modalOpen}
        onClose={handleCloseModal}
        status={modalStatus}
        type="merchant"
        email={verificationEmail}
        error={modalError}
        onResend={() => {
          setModalStatus("loading");
          handleSubmit({ verificationEmail });
        }}
        isResending={isLoading}
      />
    </Card>
  );
}

export default MerchantVerificationCard;
