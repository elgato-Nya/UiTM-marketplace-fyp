import React, { useState } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Chip,
  Divider,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import {
  Lock,
  Email,
  Business,
  Edit,
  Visibility,
  VisibilityOff,
} from "@mui/icons-material";
import { useTheme } from "../../../hooks/useTheme";
import DynamicForm from "../../../components/common/Form/DynamicForm";
import { businessEmailFormConfig } from "../../../config/forms/merchantForms";
import { businessEmailSchema } from "../../../validation/merchantValidator";
import { useMerchantVerification } from "../hooks/useMerchantVerification";
import VerificationStatusBadge from "./VerificationStatusBadge";

/**
 * EmailManagementSection Component
 *
 * PURPOSE: Display and manage 3-email system
 * FEATURES:
 * - Show primary email (private)
 * - Show verification email (private)
 * - Manage business email (public)
 * - Update business email
 */

function EmailManagementSection({ user, onEmailUpdate }) {
  const { theme } = useTheme();
  const { updateBusinessEmail, isLoading } = useMerchantVerification();
  const [openBusinessEmailDialog, setOpenBusinessEmailDialog] = useState(false);

  const primaryEmail = user?.email || "Not set";
  const verificationEmail = user?.merchantDetails?.verificationEmail;
  const businessEmail = user?.merchantDetails?.businessEmail;
  const isVerified = user?.merchantDetails?.isUiTMVerified;

  const handleBusinessEmailSubmit = async (data) => {
    const result = await updateBusinessEmail(data.businessEmail);
    if (result.success) {
      setOpenBusinessEmailDialog(false);
      if (onEmailUpdate) {
        onEmailUpdate();
      }
    }
  };

  return (
    <Box>
      <Typography
        variant="h6"
        gutterBottom
        display="flex"
        alignItems="center"
        gap={1}
      >
        <Email /> Email Management
      </Typography>
      <Typography
        variant="body2"
        color="text.secondary"
        gutterBottom
        sx={{ mb: 3 }}
      >
        Manage your email addresses for different purposes
      </Typography>

      <Grid container spacing={2}>
        {/* Primary Email (Private) */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Card variant="outlined">
            <CardContent>
              <Box display="flex" alignItems="center" gap={1} mb={1}>
                <Lock color="action" fontSize="small" />
                <Typography variant="subtitle2" fontWeight="bold">
                  Login Email
                </Typography>
                <Chip label="Private" size="small" color="error" />
              </Box>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                {primaryEmail}
              </Typography>
              <Divider sx={{ my: 1 }} />
              <Typography variant="caption" color="text.secondary">
                Used for login and password recovery. Only visible to you.
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* UiTM Verification Email (Private) */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Card variant="outlined">
            <CardContent>
              <Box display="flex" alignItems="center" gap={1} mb={1}>
                <Lock color="action" fontSize="small" />
                <Typography variant="subtitle2" fontWeight="bold">
                  Verification Email
                </Typography>
                <Chip label="Private" size="small" color="error" />
              </Box>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                {verificationEmail || "Not set"}
              </Typography>
              {isVerified && (
                <Box mb={1}>
                  <VerificationStatusBadge isVerified={true} size="small" />
                </Box>
              )}
              <Divider sx={{ my: 1 }} />
              <Typography variant="caption" color="text.secondary">
                Used to verify merchant status. Only visible to you.
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Business Email (Public) */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Card variant="outlined">
            <CardContent>
              <Box display="flex" alignItems="center" gap={1} mb={1}>
                <Business color="action" fontSize="small" />
                <Typography variant="subtitle2" fontWeight="bold">
                  Business Email
                </Typography>
                <Chip label="Public" size="small" color="success" />
              </Box>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                {businessEmail || "Not set"}
              </Typography>
              <Divider sx={{ my: 1 }} />
              <Typography
                variant="caption"
                color="text.secondary"
                gutterBottom
                display="block"
              >
                Customers see this in your shop profile
              </Typography>
              <Button
                size="small"
                variant="outlined"
                startIcon={<Edit />}
                onClick={() => setOpenBusinessEmailDialog(true)}
                fullWidth
                sx={{ mt: 1 }}
              >
                {businessEmail ? "Edit" : "Add"} Business Email
              </Button>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Business Email Edit Dialog */}
      <Dialog
        open={openBusinessEmailDialog}
        onClose={() => setOpenBusinessEmailDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Update Business Email</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <DynamicForm
              config={{
                ...businessEmailFormConfig,
                defaultValues: {
                  businessEmail: businessEmail || "",
                },
              }}
              validationSchema={businessEmailSchema}
              onSubmit={handleBusinessEmailSubmit}
              isLoading={isLoading}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenBusinessEmailDialog(false)}>
            Cancel
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default EmailManagementSection;
