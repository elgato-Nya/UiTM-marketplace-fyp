import React, { useEffect, useState } from "react";
import {
  Container,
  Box,
  Typography,
  Paper,
  Grid,
  Button,
  Tabs,
  Tab,
  List,
  ListItem,
  ListItemText,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  Chip,
  Stack,
  CircularProgress,
} from "@mui/material";
import {
  AccountBalance,
  Payment,
  History,
  Settings,
  Add,
} from "@mui/icons-material";
import { format } from "date-fns";

import { useAuth } from "../../features/auth/hooks/useAuth";
import { useSnackbar } from "../../hooks/useSnackbar";
import DynamicSkeleton from "../../components/ui/Skeleton/DynamicSkeleton";
import SnackbarContainer from "../../components/ui/SnackbarContainer";

// Payout components
import BalanceCard from "../../features/payout/components/BalanceCard";
import TransactionList from "../../features/payout/components/TransactionList";
import PayoutStatusChip from "../../features/payout/components/PayoutStatusChip";

// Hooks
import { usePayout } from "../../features/payout/hooks/usePayout";
import { usePayoutActions } from "../../features/payout/hooks/usePayoutActions";

import {
  PAYOUT_SCHEDULE,
  PAYOUT_SCHEDULE_CONFIG,
  PAYOUT_LIMITS,
  MALAYSIAN_BANKS,
} from "../../constants/payoutConstant";

// Helper to format validation errors
const formatValidationErrors = (error) => {
  // Check if error has multiple validation errors
  if (error?.errors && Array.isArray(error.errors)) {
    return error.errors.map((e) => `• ${e.field}: ${e.message}`).join("\n");
  }
  // Check if error response has errors array
  if (
    error?.response?.data?.errors &&
    Array.isArray(error.response.data.errors)
  ) {
    return error.response.data.errors
      .map((e) => `• ${e.field}: ${e.message}`)
      .join("\n");
  }
  // Return simple error message
  return (
    error?.message || error?.response?.data?.message || "An error occurred"
  );
};

// Helper for safe date formatting
const safeFormatDate = (dateValue, formatStr = "PPp") => {
  if (!dateValue) return "-";
  const date = new Date(dateValue);
  if (isNaN(date.getTime())) return "-";
  return format(date, formatStr);
};

/**
 * PayoutPage Component
 *
 * PURPOSE: Seller payout management - balance, history, settings
 */
function PayoutPage() {
  const { isAuthenticated, isMerchant, isLoading: isAuthLoading } = useAuth();

  const {
    balance,
    payoutSettings,
    bankDetails,
    canRequestPayout,
    daysUntilForcedPayout,
    nextScheduledPayout,
    transactions,
    payoutHistory,
    isLoading: isDataLoading,
  } = usePayout();

  const {
    isSubmitting,
    updateSettings,
    updateBankDetails,
    requestPayout,
    cancelPayout,
  } = usePayoutActions();

  const {
    snackbars,
    hideSnackbar,
    success: showSuccess,
    error: showError,
  } = useSnackbar();

  // State
  const [activeTab, setActiveTab] = useState(0);
  const [payoutDialogOpen, setPayoutDialogOpen] = useState(false);
  const [settingsDialogOpen, setSettingsDialogOpen] = useState(false);
  const [bankDialogOpen, setBankDialogOpen] = useState(false);
  const [payoutAmount, setPayoutAmount] = useState("");

  const [settingsForm, setSettingsForm] = useState({
    schedule: payoutSettings?.schedule || "manual",
    autoPayoutEnabled: payoutSettings?.autoPayoutEnabled || false,
    minimumPayoutAmount: payoutSettings?.minimumPayoutAmount || 10,
  });

  const [bankForm, setBankForm] = useState({
    bankName: "",
    bankCode: "",
    accountNumber: "",
    accountHolderName: "",
  });

  // Sync settings form when data loads
  useEffect(() => {
    if (payoutSettings) {
      setSettingsForm({
        schedule: payoutSettings.schedule || "manual",
        autoPayoutEnabled: payoutSettings.autoPayoutEnabled || false,
        minimumPayoutAmount: payoutSettings.minimumPayoutAmount || 10,
      });
    }
  }, [payoutSettings]);

  // Handlers
  const handleRequestPayout = async () => {
    const amount = payoutAmount ? parseFloat(payoutAmount) : null;
    const result = await requestPayout({ amount });

    if (result.success) {
      showSuccess("Payout requested successfully");
      setPayoutDialogOpen(false);
      setPayoutAmount("");
    } else {
      showError(formatValidationErrors(result));
    }
  };

  const handleUpdateSettings = async () => {
    const result = await updateSettings(settingsForm);

    if (result.success) {
      showSuccess("Payout settings updated");
      setSettingsDialogOpen(false);
    } else {
      showError(formatValidationErrors(result));
    }
  };

  const handleUpdateBankDetails = async () => {
    const result = await updateBankDetails(bankForm);

    if (result.success) {
      showSuccess("Bank details updated");
      setBankDialogOpen(false);
      setBankForm({
        bankName: "",
        bankCode: "",
        accountNumber: "",
        accountHolderName: "",
      });
    } else {
      showError(formatValidationErrors(result));
    }
  };

  const handleCancelPayout = async (payoutId) => {
    const result = await cancelPayout(payoutId);

    if (result.success) {
      showSuccess("Payout cancelled");
    } else {
      showError(formatValidationErrors(result));
    }
  };

  // Handle bank selection from dropdown
  const handleBankSelect = (selectedCode) => {
    const selectedBank = MALAYSIAN_BANKS.find((b) => b.code === selectedCode);
    if (selectedBank) {
      setBankForm((prev) => ({
        ...prev,
        bankCode: selectedBank.code,
        bankName: selectedBank.name,
      }));
    }
  };

  // Show skeleton during auth loading or initial loading
  if (isAuthLoading || !isAuthenticated) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <DynamicSkeleton
          type="page"
          config={{
            contentType: "dashboard",
            showHeader: false,
            showSidebar: false,
          }}
        />
      </Container>
    );
  }

  // Show skeleton during data loading (only if auth is complete)
  if (isDataLoading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <DynamicSkeleton
          type="page"
          config={{
            contentType: "dashboard",
            showHeader: false,
            showSidebar: false,
          }}
        />
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <SnackbarContainer snackbars={snackbars} onClose={hideSnackbar} />

      {/* Header */}
      <Box
        sx={{
          mb: 4,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          flexWrap: "wrap",
          gap: 2,
        }}
      >
        <Box>
          <Typography
            variant="h4"
            component="h1"
            sx={{
              fontWeight: 700,
              display: "flex",
              alignItems: "center",
              gap: 1,
            }}
          >
            <Payment color="primary" />
            Payouts
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mt: 1 }}>
            Manage your earnings and payouts
          </Typography>
        </Box>

        <Stack direction="row" spacing={2} alignItems="center">
          <Button
            variant="outlined"
            startIcon={<Settings />}
            onClick={() => setSettingsDialogOpen(true)}
          >
            Settings
          </Button>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => setPayoutDialogOpen(true)}
            disabled={!canRequestPayout}
            title={
              !canRequestPayout
                ? !bankDetails?.isVerified
                  ? "Bank account must be verified first"
                  : balance?.available < PAYOUT_LIMITS.MIN_PAYOUT_AMOUNT
                    ? `Minimum balance of RM ${PAYOUT_LIMITS.MIN_PAYOUT_AMOUNT} required`
                    : "Unable to request payout"
                : ""
            }
          >
            Request Payout
          </Button>
        </Stack>
      </Box>

      {/* Payout requirements notice */}
      {!canRequestPayout && (
        <Alert severity="warning" sx={{ mb: 3 }}>
          <Typography variant="subtitle2" gutterBottom>
            To request a payout, you need:
          </Typography>
          <Box component="ul" sx={{ m: 0, pl: 2 }}>
            <Box
              component="li"
              sx={{
                color: bankDetails?.accountNumber ? "success.main" : "inherit",
              }}
            >
              Bank account details added{" "}
              {bankDetails?.accountNumber ? "✓" : "✗"}
            </Box>
            <Box
              component="li"
              sx={{
                color: bankDetails?.isVerified ? "success.main" : "inherit",
              }}
            >
              Bank account verified by admin{" "}
              {bankDetails?.isVerified ? "✓" : "✗ (pending review)"}
            </Box>
            <Box
              component="li"
              sx={{
                color:
                  balance?.available >= PAYOUT_LIMITS.MIN_PAYOUT_AMOUNT
                    ? "success.main"
                    : "inherit",
              }}
            >
              Minimum balance of RM {PAYOUT_LIMITS.MIN_PAYOUT_AMOUNT}{" "}
              {balance?.available >= PAYOUT_LIMITS.MIN_PAYOUT_AMOUNT
                ? "✓"
                : `✗ (current: RM ${balance?.available?.toFixed(2) || "0.00"})`}
            </Box>
          </Box>
        </Alert>
      )}

      {/* Forced payout warning */}
      {daysUntilForcedPayout !== null && daysUntilForcedPayout <= 7 && (
        <Alert severity="warning" sx={{ mb: 3 }}>
          Your balance will be automatically paid out in {daysUntilForcedPayout}{" "}
          days if not requested. Please ensure your bank details are up to date.
        </Alert>
      )}

      {/* Bank verification notice */}
      {!bankDetails?.isVerified && bankDetails?.accountNumber && (
        <Alert severity="info" sx={{ mb: 3 }}>
          Your bank details are pending verification. An admin will review and
          verify your account shortly. You will be able to request payouts once
          verified.
        </Alert>
      )}

      {!bankDetails?.accountNumber && (
        <Alert
          severity="info"
          sx={{ mb: 3 }}
          action={
            <Button
              color="inherit"
              size="small"
              onClick={() => setBankDialogOpen(true)}
            >
              Add Bank Details
            </Button>
          }
        >
          Please add your bank details to enable payouts.
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* Balance Card */}
        <Grid size={{ xs: 12, md: 4 }}>
          <BalanceCard
            balance={balance}
            payoutSettings={payoutSettings}
            canRequestPayout={canRequestPayout}
            nextScheduledPayout={nextScheduledPayout}
            isLoading={isDataLoading}
          />

          {/* Bank Details Card */}
          <Paper
            elevation={0}
            sx={{
              mt: 3,
              p: 2,
              border: 1,
              borderColor: "divider",
              borderRadius: 2,
            }}
          >
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                mb: 2,
              }}
            >
              <Typography variant="subtitle2" color="text.secondary">
                Bank Account
              </Typography>
              <Button size="small" onClick={() => setBankDialogOpen(true)}>
                {bankDetails?.accountNumber ? "Update" : "Add"}
              </Button>
            </Box>

            {bankDetails?.accountNumber ? (
              <Box>
                <Typography variant="body2" fontWeight={500}>
                  {bankDetails.bankName}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {bankDetails.accountNumber}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {bankDetails.accountHolderName}
                </Typography>
                <Chip
                  label={
                    bankDetails.isVerified ? "Verified" : "Pending Verification"
                  }
                  color={bankDetails.isVerified ? "success" : "warning"}
                  size="small"
                  sx={{ mt: 1 }}
                />
              </Box>
            ) : (
              <Typography variant="body2" color="text.secondary">
                No bank account linked
              </Typography>
            )}
          </Paper>
        </Grid>

        {/* Transactions / History */}
        <Grid size={{ xs: 12, md: 8 }}>
          <Paper
            elevation={0}
            sx={{
              border: 1,
              borderColor: "divider",
              borderRadius: 2,
            }}
          >
            <Tabs
              value={activeTab}
              onChange={(e, v) => setActiveTab(v)}
              sx={{ borderBottom: 1, borderColor: "divider" }}
            >
              <Tab
                icon={<History />}
                label="Transactions"
                iconPosition="start"
              />
              <Tab
                icon={<AccountBalance />}
                label="Payout History"
                iconPosition="start"
              />
            </Tabs>

            <Box sx={{ p: 2 }}>
              {activeTab === 0 && (
                <TransactionList
                  transactions={transactions?.items || []}
                  emptyMessage="No transactions yet"
                />
              )}

              {activeTab === 1 && (
                <List disablePadding>
                  {payoutHistory?.payouts?.length === 0 ? (
                    <Box sx={{ py: 4, textAlign: "center" }}>
                      <Typography color="text.secondary">
                        No payout history yet
                      </Typography>
                    </Box>
                  ) : (
                    payoutHistory?.payouts?.map((payout) => (
                      <ListItem
                        key={payout._id}
                        sx={{
                          borderBottom: 1,
                          borderColor: "divider",
                          "&:last-child": { borderBottom: 0 },
                        }}
                        secondaryAction={
                          payout.canCancel && (
                            <Button
                              size="small"
                              color="error"
                              onClick={() => handleCancelPayout(payout._id)}
                              disabled={isSubmitting}
                            >
                              Cancel
                            </Button>
                          )
                        }
                      >
                        <ListItemText
                          primary={
                            <Box
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                gap: 1,
                              }}
                            >
                              <Typography variant="body2" fontWeight={600}>
                                RM {payout.amount?.toFixed(2)}
                              </Typography>
                              <PayoutStatusChip status={payout.status} />
                            </Box>
                          }
                          secondary={
                            <Typography
                              variant="caption"
                              color="text.secondary"
                            >
                              {safeFormatDate(payout.createdAt)}
                              {payout.bankReference?.referenceNumber &&
                                ` • Ref: ${payout.bankReference.referenceNumber}`}
                            </Typography>
                          }
                        />
                      </ListItem>
                    ))
                  )}
                </List>
              )}
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* Request Payout Dialog */}
      <Dialog
        open={payoutDialogOpen}
        onClose={() => setPayoutDialogOpen(false)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>Request Payout</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Available balance:{" "}
            <strong>RM {balance?.available?.toFixed(2)}</strong>
          </Typography>
          <TextField
            label="Amount (RM)"
            type="number"
            fullWidth
            value={payoutAmount}
            onChange={(e) => setPayoutAmount(e.target.value)}
            placeholder={`Leave empty to withdraw all (Min: RM ${PAYOUT_LIMITS.MIN_PAYOUT_AMOUNT})`}
            inputProps={{
              min: PAYOUT_LIMITS.MIN_PAYOUT_AMOUNT,
              step: 0.01,
            }}
            helperText={`Minimum payout: RM ${PAYOUT_LIMITS.MIN_PAYOUT_AMOUNT}`}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPayoutDialogOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleRequestPayout}
            disabled={isSubmitting}
            startIcon={isSubmitting && <CircularProgress size={16} />}
          >
            Request
          </Button>
        </DialogActions>
      </Dialog>

      {/* Settings Dialog */}
      <Dialog
        open={settingsDialogOpen}
        onClose={() => setSettingsDialogOpen(false)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>Payout Settings</DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 1 }}>
            <FormControl fullWidth>
              <InputLabel>Payout Schedule</InputLabel>
              <Select
                value={settingsForm.schedule}
                label="Payout Schedule"
                onChange={(e) =>
                  setSettingsForm((prev) => ({
                    ...prev,
                    schedule: e.target.value,
                  }))
                }
              >
                {Object.entries(PAYOUT_SCHEDULE_CONFIG).map(([key, config]) => (
                  <MenuItem key={key} value={key}>
                    {config.icon} {config.label} - {config.description}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <TextField
              label="Minimum Payout Amount (RM)"
              type="number"
              fullWidth
              value={settingsForm.minimumPayoutAmount}
              onChange={(e) =>
                setSettingsForm((prev) => ({
                  ...prev,
                  minimumPayoutAmount:
                    parseFloat(e.target.value) ||
                    PAYOUT_LIMITS.MIN_PAYOUT_AMOUNT,
                }))
              }
              inputProps={{
                min: PAYOUT_LIMITS.MIN_PAYOUT_AMOUNT,
                max: PAYOUT_LIMITS.MAX_PAYOUT_SETTINGS_AMOUNT,
              }}
              helperText={`Must be between RM ${PAYOUT_LIMITS.MIN_PAYOUT_AMOUNT} and RM ${PAYOUT_LIMITS.MAX_PAYOUT_SETTINGS_AMOUNT}`}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSettingsDialogOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleUpdateSettings}
            disabled={isSubmitting}
            startIcon={isSubmitting && <CircularProgress size={16} />}
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>

      {/* Bank Details Dialog */}
      <Dialog
        open={bankDialogOpen}
        onClose={() => setBankDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Bank Account Details</DialogTitle>
        <DialogContent>
          <Alert severity="info" sx={{ mb: 2, mt: 1 }}>
            Please select your Malaysian bank from the list. Only Malaysian
            banks are supported for payout.
          </Alert>
          <Stack spacing={2}>
            <FormControl fullWidth>
              <InputLabel>Select Bank</InputLabel>
              <Select
                value={bankForm.bankCode}
                label="Select Bank"
                onChange={(e) => handleBankSelect(e.target.value)}
              >
                {MALAYSIAN_BANKS.map((bank) => (
                  <MenuItem key={bank.code} value={bank.code}>
                    {bank.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              label="Bank SWIFT Code"
              fullWidth
              value={bankForm.bankCode}
              InputProps={{ readOnly: true }}
              helperText="Automatically filled when you select a bank"
            />
            <TextField
              label="Account Number"
              fullWidth
              value={bankForm.accountNumber}
              onChange={(e) =>
                setBankForm((prev) => ({
                  ...prev,
                  accountNumber: e.target.value.replace(/\D/g, ""),
                }))
              }
              placeholder="Enter 10-16 digit account number"
              helperText="Malaysian bank accounts are typically 10-16 digits"
              inputProps={{ maxLength: 16 }}
            />
            <TextField
              label="Account Holder Name"
              fullWidth
              value={bankForm.accountHolderName}
              onChange={(e) =>
                setBankForm((prev) => ({
                  ...prev,
                  accountHolderName: e.target.value,
                }))
              }
              helperText="Must match exactly as shown on your bank account"
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setBankDialogOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleUpdateBankDetails}
            disabled={
              isSubmitting ||
              !bankForm.bankName ||
              !bankForm.bankCode ||
              !bankForm.accountNumber ||
              bankForm.accountNumber.length < 10 ||
              !bankForm.accountHolderName
            }
            startIcon={isSubmitting && <CircularProgress size={16} />}
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}

export default PayoutPage;
