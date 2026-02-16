import { useState, useEffect, useCallback } from "react";
import {
  Container,
  Typography,
  Box,
  Card,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Button,
  IconButton,
  Tabs,
  Tab,
  Chip,
  CircularProgress,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Divider,
  Stack,
} from "@mui/material";
import {
  CheckCircle,
  Cancel,
  Refresh,
  AccountBalance,
  Payment,
  Close,
} from "@mui/icons-material";
import { format } from "date-fns";

import payoutService from "../../features/payout/service/payoutService";
import { useSnackbar } from "../../hooks/useSnackbar";
import SnackbarContainer from "../../components/ui/SnackbarContainer";
import DynamicSkeleton from "../../components/ui/Skeleton/DynamicSkeleton";

/**
 * AdminPayoutPage Component
 *
 * PURPOSE: Admin interface for managing merchant bank verifications and payouts
 *
 * FEATURES:
 * - View pending bank verifications
 * - Verify merchant bank details
 * - View pending payouts
 * - Process payouts (approve/reject)
 */
const AdminPayoutPage = () => {
  const {
    snackbars,
    hideSnackbar,
    success: showSuccess,
    error: showError,
  } = useSnackbar();

  // Tab state
  const [activeTab, setActiveTab] = useState(0);

  // Pending verifications state
  const [verifications, setVerifications] = useState([]);
  const [verificationsLoading, setVerificationsLoading] = useState(true);
  const [verificationsPage, setVerificationsPage] = useState(0);
  const [verificationsRowsPerPage, setVerificationsRowsPerPage] = useState(10);
  const [verificationsTotal, setVerificationsTotal] = useState(0);

  // Pending payouts state
  const [payouts, setPayouts] = useState([]);
  const [payoutsLoading, setPayoutsLoading] = useState(true);
  const [payoutsPage, setPayoutsPage] = useState(0);
  const [payoutsRowsPerPage, setPayoutsRowsPerPage] = useState(10);
  const [payoutsTotal, setPayoutsTotal] = useState(0);

  // Detail dialog state (for mobile)
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [detailType, setDetailType] = useState(null); // 'verification' or 'payout'

  // Process dialog state
  const [processDialogOpen, setProcessDialogOpen] = useState(false);
  const [selectedPayout, setSelectedPayout] = useState(null);
  const [processAction, setProcessAction] = useState("approve");
  const [bankReference, setBankReference] = useState("");
  const [failureReason, setFailureReason] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  // Fetch pending verifications
  const fetchVerifications = useCallback(async () => {
    setVerificationsLoading(true);
    try {
      const response = await payoutService.getPendingBankVerifications({
        page: verificationsPage + 1,
        limit: verificationsRowsPerPage,
      });
      setVerifications(response.data.items || []);
      setVerificationsTotal(response.data.total || 0);
    } catch (err) {
      showError(err.response?.data?.message || "Failed to fetch verifications");
    } finally {
      setVerificationsLoading(false);
    }
  }, [verificationsPage, verificationsRowsPerPage, showError]);

  // Fetch pending payouts
  const fetchPayouts = useCallback(async () => {
    setPayoutsLoading(true);
    try {
      const response = await payoutService.getPendingPayouts({
        page: payoutsPage + 1,
        limit: payoutsRowsPerPage,
      });
      setPayouts(response.data.items || []);
      setPayoutsTotal(response.data.total || 0);
    } catch (err) {
      showError(err.response?.data?.message || "Failed to fetch payouts");
    } finally {
      setPayoutsLoading(false);
    }
  }, [payoutsPage, payoutsRowsPerPage, showError]);

  // Load data on mount and tab change
  useEffect(() => {
    if (activeTab === 0) {
      fetchVerifications();
    } else {
      fetchPayouts();
    }
  }, [activeTab, fetchVerifications, fetchPayouts]);

  // Handle verify bank details
  const handleVerifyBank = async (sellerId) => {
    setActionLoading(true);
    try {
      await payoutService.verifyBankDetails(sellerId);
      showSuccess("Bank details verified successfully");
      setDetailDialogOpen(false);
      fetchVerifications();
    } catch (err) {
      showError(err.response?.data?.message || "Failed to verify bank details");
    } finally {
      setActionLoading(false);
    }
  };

  // Handle process payout
  const handleProcessPayout = async () => {
    if (!selectedPayout) return;

    setActionLoading(true);
    try {
      const processData = {
        success: processAction === "approve",
        bankReference:
          processAction === "approve"
            ? {
                referenceNumber: bankReference,
                transactionId: `TXN-${Date.now()}`,
              }
            : undefined,
        failureReason: processAction === "reject" ? "bank_rejected" : undefined,
        failureMessage: processAction === "reject" ? failureReason : undefined,
      };

      await payoutService.processPayout(selectedPayout._id, processData);
      showSuccess(
        processAction === "approve"
          ? "Payout processed successfully"
          : "Payout rejected",
      );
      setProcessDialogOpen(false);
      setDetailDialogOpen(false);
      setSelectedPayout(null);
      setBankReference("");
      setFailureReason("");
      fetchPayouts();
    } catch (err) {
      showError(err.response?.data?.message || "Failed to process payout");
    } finally {
      setActionLoading(false);
    }
  };

  // Open detail dialog (mobile)
  const openDetailDialog = (item, type) => {
    setSelectedItem(item);
    setDetailType(type);
    setDetailDialogOpen(true);
  };

  // Open process dialog
  const openProcessDialog = (payout, action) => {
    setSelectedPayout(payout);
    setProcessAction(action);
    setProcessDialogOpen(true);
  };

  // Render verification card (mobile)
  const renderVerificationCard = (item) => (
    <Card
      key={item.sellerId}
      sx={{
        mb: 2,
        cursor: "pointer",
        "&:hover": { boxShadow: 3 },
      }}
      onClick={() => openDetailDialog(item, "verification")}
    >
      <Box sx={{ p: 2 }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
          <Typography variant="subtitle1" fontWeight={600}>
            {item.username}
          </Typography>
          <Chip label="Pending" color="warning" size="small" />
        </Box>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          {item.email}
        </Typography>
        <Typography variant="body2" gutterBottom>
          Shop: {item.shopName || "-"}
        </Typography>
        <Divider sx={{ my: 1 }} />
        <Box sx={{ display: "flex", justifyContent: "space-between" }}>
          <Typography variant="body2" color="text.secondary">
            {item.bankDetails.bankName}
          </Typography>
          <Typography variant="body2" fontWeight={500}>
            RM {item.availableBalance?.toFixed(2)}
          </Typography>
        </Box>
      </Box>
    </Card>
  );

  // Render payout card (mobile)
  const renderPayoutCard = (payout) => (
    <Card
      key={payout._id}
      sx={{
        mb: 2,
        cursor: "pointer",
        "&:hover": { boxShadow: 3 },
      }}
      onClick={() => openDetailDialog(payout, "payout")}
    >
      <Box sx={{ p: 2 }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
          <Typography variant="subtitle1" fontWeight={600}>
            {payout.username}
          </Typography>
          <Chip
            label={payout.status}
            color={payout.status === "pending" ? "warning" : "info"}
            size="small"
          />
        </Box>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          {payout.shopName || "-"}
        </Typography>
        <Divider sx={{ my: 1 }} />
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Typography variant="body2" color="text.secondary">
            {format(new Date(payout.createdAt), "PP")}
          </Typography>
          <Typography variant="h6" color="primary" fontWeight={600}>
            RM {payout.amount?.toFixed(2)}
          </Typography>
        </Box>
      </Box>
    </Card>
  );

  return (
    <Container maxWidth="xl" sx={{ py: { xs: 2, md: 4 } }}>
      <SnackbarContainer snackbars={snackbars} onClose={hideSnackbar} />

      {/* Page Header */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          mb: 3,
          flexWrap: "wrap",
          gap: 2,
        }}
      >
        <Box>
          <Typography variant="h4" gutterBottom>
            Payout Management
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Verify merchant bank accounts and process payouts
          </Typography>
        </Box>
        <Button
          variant="outlined"
          startIcon={<Refresh />}
          onClick={() =>
            activeTab === 0 ? fetchVerifications() : fetchPayouts()
          }
          size="small"
        >
          Refresh
        </Button>
      </Box>

      {/* Tabs Card */}
      <Card sx={{ mb: 3 }}>
        {/* Desktop Tabs */}
        <Box
          sx={{
            display: { xs: "none", md: "block" },
            borderBottom: 1,
            borderColor: "divider",
          }}
        >
          <Tabs value={activeTab} onChange={(e, v) => setActiveTab(v)}>
            <Tab
              icon={<AccountBalance />}
              label={`Bank Verifications (${verificationsTotal})`}
              iconPosition="start"
            />
            <Tab
              icon={<Payment />}
              label={`Pending Payouts (${payoutsTotal})`}
              iconPosition="start"
            />
          </Tabs>
        </Box>

        {/* Mobile Dropdown */}
        <Box sx={{ p: 2, display: { xs: "block", md: "none" } }}>
          <FormControl fullWidth size="small">
            <InputLabel>View</InputLabel>
            <Select
              value={activeTab}
              label="View"
              onChange={(e) => setActiveTab(e.target.value)}
            >
              <MenuItem value={0}>
                Bank Verifications ({verificationsTotal})
              </MenuItem>
              <MenuItem value={1}>Pending Payouts ({payoutsTotal})</MenuItem>
            </Select>
          </FormControl>
        </Box>

        {/* Bank Verifications Tab */}
        {activeTab === 0 && (
          <>
            {verificationsLoading ? (
              <Box sx={{ p: 3 }}>
                <DynamicSkeleton
                  type="table"
                  config={{ rows: 5, columns: 6 }}
                />
              </Box>
            ) : verifications.length === 0 ? (
              <Box sx={{ p: 4, textAlign: "center" }}>
                <Typography color="text.secondary">
                  No pending bank verifications
                </Typography>
              </Box>
            ) : (
              <>
                {/* Desktop Table */}
                <TableContainer sx={{ display: { xs: "none", md: "block" } }}>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Merchant</TableCell>
                        <TableCell>Shop Name</TableCell>
                        <TableCell>Bank Details</TableCell>
                        <TableCell>Balance</TableCell>
                        <TableCell>Updated</TableCell>
                        <TableCell align="right">Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {verifications.map((item) => (
                        <TableRow key={item.sellerId}>
                          <TableCell>
                            <Typography variant="body2" fontWeight={500}>
                              {item.username}
                            </Typography>
                            <Typography
                              variant="caption"
                              color="text.secondary"
                            >
                              {item.email}
                            </Typography>
                          </TableCell>
                          <TableCell>{item.shopName || "-"}</TableCell>
                          <TableCell>
                            <Typography variant="body2">
                              {item.bankDetails.bankName}
                            </Typography>
                            <Typography
                              variant="caption"
                              color="text.secondary"
                            >
                              {item.bankDetails.accountNumber} •{" "}
                              {item.bankDetails.accountHolderName}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            RM {item.availableBalance?.toFixed(2)}
                          </TableCell>
                          <TableCell>
                            {format(new Date(item.updatedAt), "PP")}
                          </TableCell>
                          <TableCell align="right">
                            <Tooltip title="Verify Bank Details">
                              <IconButton
                                color="success"
                                onClick={() => handleVerifyBank(item.sellerId)}
                                disabled={actionLoading}
                              >
                                <CheckCircle />
                              </IconButton>
                            </Tooltip>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>

                {/* Mobile Card View */}
                <Box sx={{ display: { xs: "block", md: "none" }, p: 2 }}>
                  {verifications.map(renderVerificationCard)}
                </Box>

                <TablePagination
                  component="div"
                  count={verificationsTotal}
                  page={verificationsPage}
                  onPageChange={(e, p) => setVerificationsPage(p)}
                  rowsPerPage={verificationsRowsPerPage}
                  onRowsPerPageChange={(e) => {
                    setVerificationsRowsPerPage(parseInt(e.target.value, 10));
                    setVerificationsPage(0);
                  }}
                  sx={{
                    ".MuiTablePagination-selectLabel": {
                      display: { xs: "none", sm: "block" },
                    },
                    ".MuiTablePagination-displayedRows": {
                      fontSize: { xs: "0.75rem", sm: "0.875rem" },
                    },
                  }}
                />
              </>
            )}
          </>
        )}

        {/* Pending Payouts Tab */}
        {activeTab === 1 && (
          <>
            {payoutsLoading ? (
              <Box sx={{ p: 3 }}>
                <DynamicSkeleton
                  type="table"
                  config={{ rows: 5, columns: 7 }}
                />
              </Box>
            ) : payouts.length === 0 ? (
              <Box sx={{ p: 4, textAlign: "center" }}>
                <Typography color="text.secondary">
                  No pending payouts
                </Typography>
              </Box>
            ) : (
              <>
                {/* Desktop Table */}
                <TableContainer sx={{ display: { xs: "none", md: "block" } }}>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Merchant</TableCell>
                        <TableCell>Shop Name</TableCell>
                        <TableCell>Amount</TableCell>
                        <TableCell>Bank</TableCell>
                        <TableCell>Status</TableCell>
                        <TableCell>Requested</TableCell>
                        <TableCell align="right">Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {payouts.map((payout) => (
                        <TableRow key={payout._id}>
                          <TableCell>
                            <Typography variant="body2" fontWeight={500}>
                              {payout.username}
                            </Typography>
                            <Typography
                              variant="caption"
                              color="text.secondary"
                            >
                              {payout.email}
                            </Typography>
                          </TableCell>
                          <TableCell>{payout.shopName || "-"}</TableCell>
                          <TableCell>
                            <Typography fontWeight={600}>
                              RM {payout.amount?.toFixed(2)}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            {payout.bankDetails?.bankName || "-"}
                            <br />
                            <Typography
                              variant="caption"
                              color="text.secondary"
                            >
                              {payout.bankDetails?.accountNumber}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={payout.status}
                              size="small"
                              color={
                                payout.status === "pending"
                                  ? "warning"
                                  : payout.status === "processing"
                                    ? "info"
                                    : "default"
                              }
                            />
                          </TableCell>
                          <TableCell>
                            {format(new Date(payout.createdAt), "PP p")}
                          </TableCell>
                          <TableCell align="right">
                            <Tooltip title="Approve">
                              <IconButton
                                color="success"
                                onClick={() =>
                                  openProcessDialog(payout, "approve")
                                }
                                disabled={actionLoading}
                              >
                                <CheckCircle />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Reject">
                              <IconButton
                                color="error"
                                onClick={() =>
                                  openProcessDialog(payout, "reject")
                                }
                                disabled={actionLoading}
                              >
                                <Cancel />
                              </IconButton>
                            </Tooltip>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>

                {/* Mobile Card View */}
                <Box sx={{ display: { xs: "block", md: "none" }, p: 2 }}>
                  {payouts.map(renderPayoutCard)}
                </Box>

                <TablePagination
                  component="div"
                  count={payoutsTotal}
                  page={payoutsPage}
                  onPageChange={(e, p) => setPayoutsPage(p)}
                  rowsPerPage={payoutsRowsPerPage}
                  onRowsPerPageChange={(e) => {
                    setPayoutsRowsPerPage(parseInt(e.target.value, 10));
                    setPayoutsPage(0);
                  }}
                  sx={{
                    ".MuiTablePagination-selectLabel": {
                      display: { xs: "none", sm: "block" },
                    },
                    ".MuiTablePagination-displayedRows": {
                      fontSize: { xs: "0.75rem", sm: "0.875rem" },
                    },
                  }}
                />
              </>
            )}
          </>
        )}
      </Card>

      {/* Detail Dialog (Mobile) */}
      <Dialog
        open={detailDialogOpen}
        onClose={() => setDetailDialogOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            m: { xs: 2, sm: 4 },
            maxHeight: { xs: "calc(100% - 32px)", sm: "calc(100% - 64px)" },
          },
        }}
      >
        <DialogTitle
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          {detailType === "verification"
            ? "Bank Verification Details"
            : "Payout Details"}
          <IconButton onClick={() => setDetailDialogOpen(false)} size="small">
            <Close />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          {selectedItem && detailType === "verification" && (
            <Stack spacing={2}>
              <Box>
                <Typography variant="caption" color="text.secondary">
                  Merchant
                </Typography>
                <Typography variant="body1" fontWeight={500}>
                  {selectedItem.username}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {selectedItem.email}
                </Typography>
              </Box>
              <Divider />
              <Box>
                <Typography variant="caption" color="text.secondary">
                  Shop Name
                </Typography>
                <Typography variant="body1">
                  {selectedItem.shopName || "-"}
                </Typography>
              </Box>
              <Divider />
              <Box>
                <Typography variant="caption" color="text.secondary">
                  Bank Details
                </Typography>
                <Typography variant="body1" fontWeight={500}>
                  {selectedItem.bankDetails.bankName}
                </Typography>
                <Typography variant="body2">
                  Account: {selectedItem.bankDetails.accountNumber}
                </Typography>
                <Typography variant="body2">
                  Holder: {selectedItem.bankDetails.accountHolderName}
                </Typography>
              </Box>
              <Divider />
              <Box>
                <Typography variant="caption" color="text.secondary">
                  Available Balance
                </Typography>
                <Typography variant="h6" color="primary">
                  RM {selectedItem.availableBalance?.toFixed(2)}
                </Typography>
              </Box>
            </Stack>
          )}

          {selectedItem && detailType === "payout" && (
            <Stack spacing={2}>
              <Box>
                <Typography variant="caption" color="text.secondary">
                  Merchant
                </Typography>
                <Typography variant="body1" fontWeight={500}>
                  {selectedItem.username}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {selectedItem.email}
                </Typography>
              </Box>
              <Divider />
              <Box>
                <Typography variant="caption" color="text.secondary">
                  Shop Name
                </Typography>
                <Typography variant="body1">
                  {selectedItem.shopName || "-"}
                </Typography>
              </Box>
              <Divider />
              <Box>
                <Typography variant="caption" color="text.secondary">
                  Payout Amount
                </Typography>
                <Typography variant="h5" color="primary" fontWeight={600}>
                  RM {selectedItem.amount?.toFixed(2)}
                </Typography>
              </Box>
              <Divider />
              <Box>
                <Typography variant="caption" color="text.secondary">
                  Bank Details
                </Typography>
                <Typography variant="body1">
                  {selectedItem.bankDetails?.bankName || "-"}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {selectedItem.bankDetails?.accountNumber}
                </Typography>
              </Box>
              <Divider />
              <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Status
                  </Typography>
                  <Box sx={{ mt: 0.5 }}>
                    <Chip
                      label={selectedItem.status}
                      color={
                        selectedItem.status === "pending" ? "warning" : "info"
                      }
                      size="small"
                    />
                  </Box>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Requested
                  </Typography>
                  <Typography variant="body2">
                    {format(new Date(selectedItem.createdAt), "PP p")}
                  </Typography>
                </Box>
              </Box>
            </Stack>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2, gap: 1 }}>
          {detailType === "verification" && selectedItem && (
            <Button
              variant="contained"
              color="success"
              startIcon={
                actionLoading ? <CircularProgress size={16} /> : <CheckCircle />
              }
              onClick={() => handleVerifyBank(selectedItem.sellerId)}
              disabled={actionLoading}
              fullWidth
            >
              Verify Bank Details
            </Button>
          )}
          {detailType === "payout" && selectedItem && (
            <>
              <Button
                variant="outlined"
                color="error"
                startIcon={<Cancel />}
                onClick={() => openProcessDialog(selectedItem, "reject")}
                disabled={actionLoading}
                sx={{ flex: 1 }}
              >
                Reject
              </Button>
              <Button
                variant="contained"
                color="success"
                startIcon={<CheckCircle />}
                onClick={() => openProcessDialog(selectedItem, "approve")}
                disabled={actionLoading}
                sx={{ flex: 1 }}
              >
                Approve
              </Button>
            </>
          )}
        </DialogActions>
      </Dialog>

      {/* Process Payout Dialog */}
      <Dialog
        open={processDialogOpen}
        onClose={() => setProcessDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {processAction === "approve"
            ? "Mark Payout as Completed"
            : "Reject Payout"}
        </DialogTitle>
        <DialogContent>
          {selectedPayout && (
            <Box sx={{ mt: 1 }}>
              <Alert
                severity={processAction === "approve" ? "info" : "warning"}
                sx={{ mb: 2 }}
              >
                {processAction === "approve" ? (
                  <>
                    <strong>Manual Transfer Required:</strong> Please transfer
                    RM {selectedPayout.amount?.toFixed(2)} to the merchant's
                    bank account before marking as completed.
                    <Box sx={{ mt: 1 }}>
                      <Typography variant="body2">
                        Bank: {selectedPayout.bankDetails?.bankName}
                      </Typography>
                      <Typography variant="body2">
                        Account: {selectedPayout.bankDetails?.accountNumber}
                      </Typography>
                      <Typography variant="body2">
                        Holder: {selectedPayout.bankDetails?.accountHolderName}
                      </Typography>
                    </Box>
                  </>
                ) : (
                  `You are about to reject a payout of RM ${selectedPayout.amount?.toFixed(2)} to ${selectedPayout.username}.`
                )}
              </Alert>

              {processAction === "approve" ? (
                <TextField
                  label="Bank Transfer Reference Number"
                  fullWidth
                  value={bankReference}
                  onChange={(e) => setBankReference(e.target.value)}
                  placeholder="e.g., FPX123456789 or IBG reference"
                  helperText="Enter the reference number from your bank transfer confirmation"
                  required
                />
              ) : (
                <TextField
                  label="Rejection Reason"
                  fullWidth
                  multiline
                  rows={3}
                  value={failureReason}
                  onChange={(e) => setFailureReason(e.target.value)}
                  placeholder="Explain why this payout is being rejected"
                  helperText="This will be shown to the merchant"
                />
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setProcessDialogOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            color={processAction === "approve" ? "success" : "error"}
            onClick={handleProcessPayout}
            disabled={
              actionLoading ||
              (processAction === "approve" && !bankReference) ||
              (processAction === "reject" && !failureReason)
            }
            startIcon={actionLoading && <CircularProgress size={16} />}
          >
            {processAction === "approve" ? "Mark as Completed" : "Reject"}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default AdminPayoutPage;
