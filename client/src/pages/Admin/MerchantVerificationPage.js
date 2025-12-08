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
  TextField,
  InputAdornment,
  Tabs,
  Tab,
  Avatar,
  CircularProgress,
  Tooltip,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from "@mui/material";
import {
  Search,
  CheckCircle,
  Cancel,
  Block,
  Refresh,
  Visibility,
} from "@mui/icons-material";
import { useTheme } from "../../hooks/useTheme";
import { format } from "date-fns";
import useMerchantManagement from "../../features/admin/hooks/useMerchantManagement";
import MerchantStatusBadge from "../../features/admin/components/MerchantStatusBadge";
import ShopStatusBadge from "../../features/admin/components/ShopStatusBadge";
import MerchantDetailDialog from "../../features/admin/components/MerchantDetailDialog";
import MerchantActionDialog from "../../features/admin/components/MerchantActionDialog";

/**
 * MerchantVerificationPage Component
 *
 * PURPOSE: Admin interface for managing merchant verifications
 *
 * FEATURES:
 * - List merchants with filters (pending/unverified/verified/rejected/suspended)
 * - Search by shop name, username, email
 * - View merchant details
 * - Approve/reject/suspend/reactivate merchants
 * - Pagination
 *
 * MERCHANT STATUS FLOW:
 * - pending: Merchant registered but hasn't completed shop setup
 * - unverified: Merchant completed shop setup, awaiting admin review
 * - verified: Admin approved
 * - rejected: Admin rejected
 *
 * SHOP STATUS:
 * - pending_verification: Awaiting verification
 * - active: Operating normally
 * - suspended: Temporarily suspended by admin
 * - closed: Permanently closed
 *
 * ACCESSIBILITY:
 * - Proper ARIA labels and roles
 * - Semantic HTML elements (<nav> for tabs, <main> for content)
 * - Keyboard navigation support
 * - Screen reader friendly
 *
 * RESPONSIVE:
 * - Mobile-first design
 * - Responsive table layout
 */
const MerchantVerificationPage = () => {
  const { theme } = useTheme();

  // Use custom hook for all state and logic
  const {
    merchants,
    loading,
    totalItems,
    selectedStatus,
    searchTerm,
    page,
    rowsPerPage,
    selectedMerchant,
    detailDialogOpen,
    actionDialogOpen,
    actionType,
    actionReason,
    actionLoading,
    fetchMerchantDetails,
    handleStatusChange,
    handleSearch,
    handleChangePage,
    handleChangeRowsPerPage,
    handleOpenAction,
    handleCloseAction,
    handleCloseDetail,
    handlePerformAction,
    handleRefresh,
    setReason,
  } = useMerchantManagement();

  /**
   * Helper function to determine actual merchant status
   * If merchant has no shopName, they're "pending" (haven't set up shop)
   * Otherwise, use their verificationStatus
   */
  const getMerchantStatus = (merchant) => {
    if (!merchant.merchantDetails?.shopName) {
      return "pending";
    }
    return merchant.merchantDetails?.verificationStatus || "unverified";
  };

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Page Header */}
      <Box
        sx={{ display: "flex", justifyContent: "space-between", mb: 3 }}
        component="header"
        aria-label="Page header"
      >
        <Box>
          <Typography variant="h4" gutterBottom>
            Merchant Verification
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Review and manage merchant accounts
          </Typography>
        </Box>
        <Button
          variant="outlined"
          startIcon={<Refresh />}
          onClick={handleRefresh}
          aria-label="Refresh merchant list"
          size="small"
          sx={{ height: "fit-content" }}
        >
          Refresh
        </Button>
      </Box>

      {/* Filters Card */}
      <Card sx={{ mb: 3 }} component="section" aria-label="Filters">
        {/* Desktop Tabs - Hidden on mobile */}
        <Box
          sx={{
            borderBottom: 1,
            borderColor: "divider",
            display: { xs: "none", md: "block" },
          }}
        >
          <Tabs
            value={selectedStatus}
            onChange={handleStatusChange}
            variant="scrollable"
            scrollButtons="auto"
            aria-label="Merchant status filter tabs"
            component="nav"
          >
            <Tab label="All" value="all" aria-label="Show all merchants" />
            <Tab
              label="Pending"
              value="pending"
              aria-label="Filter by pending merchants"
            />
            <Tab
              label="Unverified"
              value="unverified"
              aria-label="Filter by unverified merchants"
            />
            <Tab
              label="Verified"
              value="verified"
              aria-label="Filter by verified merchants"
            />
            <Tab
              label="Rejected"
              value="rejected"
              aria-label="Filter by rejected merchants"
            />
            <Tab
              label="Suspended"
              value="suspended"
              aria-label="Filter by suspended merchants"
            />
          </Tabs>
        </Box>

        {/* Mobile Dropdown - Hidden on desktop */}
        <Box sx={{ p: 2, display: { xs: "block", md: "none" } }}>
          <FormControl fullWidth size="small">
            <InputLabel id="status-filter-label">Filter by Status</InputLabel>
            <Select
              labelId="status-filter-label"
              id="status-filter"
              value={selectedStatus}
              label="Filter by Status"
              onChange={(e) => handleStatusChange(e, e.target.value)}
              aria-label="Filter merchants by status"
            >
              <MenuItem value="all">All Merchants</MenuItem>
              <MenuItem value="pending">Pending Setup</MenuItem>
              <MenuItem value="unverified">Unverified</MenuItem>
              <MenuItem value="verified">Verified</MenuItem>
              <MenuItem value="rejected">Rejected</MenuItem>
              <MenuItem value="suspended">Suspended</MenuItem>
            </Select>
          </FormControl>
        </Box>

        {/* Search Bar */}
        <Box sx={{ p: 2, pt: { xs: 1, md: 2 } }}>
          <TextField
            fullWidth
            placeholder="Search by shop name..."
            value={searchTerm}
            onChange={handleSearch}
            size="small"
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <Search />
                  </InputAdornment>
                ),
              },
            }}
            aria-label="Search merchants by shop name"
          />
        </Box>
      </Card>

      {/* Merchants Table */}
      <Card component="main" aria-label="Merchant list">
        {loading ? (
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              minHeight: 400,
            }}
            role="status"
            aria-label="Loading merchants"
          >
            <CircularProgress />
          </Box>
        ) : merchants.length === 0 ? (
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              minHeight: 400,
              flexDirection: "column",
            }}
            role="status"
            aria-label="No merchants found"
          >
            <Typography variant="h6" color="text.secondary" gutterBottom>
              No merchants found
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Try adjusting your filters or search term
            </Typography>
          </Box>
        ) : (
          <>
            {/* Desktop Table View */}
            <TableContainer sx={{ display: { xs: "none", md: "block" } }}>
              <Table aria-label="Merchant verification table">
                <TableHead>
                  <TableRow>
                    <TableCell>Merchant</TableCell>
                    <TableCell>Shop Name</TableCell>
                    <TableCell>Email</TableCell>
                    <TableCell>Verification Status</TableCell>
                    <TableCell>Shop Status</TableCell>
                    <TableCell>Registered</TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {merchants.map((merchant) => (
                    <TableRow
                      key={merchant._id}
                      hover
                      aria-label={`Merchant: ${merchant.profile?.username}`}
                    >
                      {/* Merchant Avatar & Username */}
                      <TableCell>
                        <Box
                          sx={{ display: "flex", alignItems: "center", gap: 2 }}
                        >
                          <Avatar
                            src={merchant.profile?.avatar}
                            alt={`${merchant.profile?.username}'s avatar`}
                          >
                            {merchant.profile?.username?.[0]?.toUpperCase()}
                          </Avatar>
                          <Typography variant="body2">
                            {merchant.profile?.username}
                          </Typography>
                        </Box>
                      </TableCell>

                      {/* Shop Name */}
                      <TableCell>
                        <Typography variant="body2">
                          {merchant.merchantDetails?.shopName || "N/A"}
                        </Typography>
                      </TableCell>

                      {/* Email */}
                      <TableCell>
                        <Typography variant="body2" sx={{ maxWidth: 200 }}>
                          {merchant.email}
                        </Typography>
                      </TableCell>

                      {/* Verification Status */}
                      <TableCell>
                        <MerchantStatusBadge
                          status={getMerchantStatus(merchant)}
                        />
                      </TableCell>

                      {/* Shop Status */}
                      <TableCell>
                        <ShopStatusBadge
                          status={merchant.merchantDetails?.shopStatus}
                        />
                      </TableCell>

                      {/* Registered Date */}
                      <TableCell>
                        <Typography variant="body2">
                          {format(new Date(merchant.createdAt), "MMM dd, yyyy")}
                        </Typography>
                      </TableCell>

                      {/* Actions */}
                      <TableCell align="right">
                        <Box
                          sx={{
                            display: "flex",
                            gap: 0.5,
                            justifyContent: "flex-end",
                          }}
                        >
                          {/* View Details */}
                          <Tooltip title="View Details">
                            <IconButton
                              size="small"
                              onClick={() => fetchMerchantDetails(merchant._id)}
                              aria-label={`View details for ${merchant.profile?.username}`}
                            >
                              <Visibility fontSize="small" />
                            </IconButton>
                          </Tooltip>

                          {/* Unverified Actions */}
                          {getMerchantStatus(merchant) === "unverified" && (
                            <>
                              <Tooltip title="Approve">
                                <IconButton
                                  size="small"
                                  onClick={() =>
                                    handleOpenAction(merchant, "verify")
                                  }
                                  color="success"
                                  aria-label={`Approve ${merchant.profile?.username}`}
                                >
                                  <CheckCircle fontSize="small" />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="Reject">
                                <IconButton
                                  size="small"
                                  onClick={() =>
                                    handleOpenAction(merchant, "reject")
                                  }
                                  color="error"
                                  aria-label={`Reject ${merchant.profile?.username}`}
                                >
                                  <Cancel fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            </>
                          )}

                          {/* Active Shop Actions */}
                          {merchant.merchantDetails?.shopStatus ===
                            "active" && (
                            <Tooltip title="Suspend">
                              <IconButton
                                size="small"
                                onClick={() =>
                                  handleOpenAction(merchant, "suspend")
                                }
                                color="warning"
                                aria-label={`Suspend ${merchant.profile?.username}`}
                              >
                                <Block fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          )}

                          {/* Suspended Shop Actions */}
                          {merchant.merchantDetails?.shopStatus ===
                            "suspended" && (
                            <Tooltip title="Reactivate">
                              <IconButton
                                size="small"
                                onClick={() =>
                                  handleOpenAction(merchant, "reactivate")
                                }
                                color="success"
                                aria-label={`Reactivate ${merchant.profile?.username}`}
                              >
                                <CheckCircle fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          )}
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>

            {/* Mobile Card View */}
            <Box sx={{ display: { xs: "block", md: "none" }, p: 2 }}>
              {merchants.map((merchant) => (
                <Card
                  key={merchant._id}
                  sx={{
                    mb: 2,
                    cursor: "pointer",
                    "&:hover": {
                      boxShadow: 3,
                    },
                  }}
                  onClick={() => fetchMerchantDetails(merchant._id)}
                  aria-label={`View details for ${merchant.profile?.username}`}
                >
                  <Box sx={{ p: 2 }}>
                    {/* Header with Avatar and Name */}
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 2,
                        mb: 2,
                      }}
                    >
                      <Avatar
                        src={merchant.profile?.avatar}
                        alt={`${merchant.profile?.username}'s avatar`}
                        sx={{ width: 48, height: 48 }}
                      >
                        {merchant.profile?.username?.[0]?.toUpperCase()}
                      </Avatar>
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography variant="subtitle1" noWrap>
                          {merchant.profile?.username}
                        </Typography>
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          noWrap
                        >
                          {merchant.merchantDetails?.shopName || "No shop"}
                        </Typography>
                      </Box>
                    </Box>

                    {/* Status Badges */}
                    <Box
                      sx={{
                        display: "flex",
                        gap: 1,
                        mb: 1,
                        flexWrap: "wrap",
                      }}
                    >
                      <MerchantStatusBadge
                        status={getMerchantStatus(merchant)}
                      />
                      <ShopStatusBadge
                        status={merchant.merchantDetails?.shopStatus}
                      />
                    </Box>

                    {/* Registration Date */}
                    <Typography variant="caption" color="text.secondary">
                      Registered{" "}
                      {format(new Date(merchant.createdAt), "MMM dd, yyyy")}
                    </Typography>
                  </Box>
                </Card>
              ))}
            </Box>

            {/* Pagination */}
            <TablePagination
              component="div"
              count={totalItems}
              page={page}
              onPageChange={handleChangePage}
              rowsPerPage={rowsPerPage}
              onRowsPerPageChange={handleChangeRowsPerPage}
              rowsPerPageOptions={[10, 20, 50, 100]}
              aria-label="Merchant table pagination"
              sx={{
                ".MuiTablePagination-toolbar": {
                  flexWrap: "wrap",
                  minHeight: { xs: "auto", sm: 52 },
                  px: { xs: 1, sm: 2 },
                },
                ".MuiTablePagination-selectLabel": {
                  display: { xs: "none", sm: "block" },
                  m: 0,
                },
                ".MuiTablePagination-displayedRows": {
                  fontSize: { xs: "0.75rem", sm: "0.875rem" },
                  m: 0,
                },
                ".MuiTablePagination-actions": {
                  ml: { xs: 0.5, sm: 2 },
                },
              }}
            />
          </>
        )}
      </Card>

      {/* Detail Dialog */}
      <MerchantDetailDialog
        open={detailDialogOpen}
        onClose={handleCloseDetail}
        merchant={selectedMerchant}
        onApprove={(merchant) => handleOpenAction(merchant, "verify")}
        onReject={(merchant) => handleOpenAction(merchant, "reject")}
      />

      {/* Action Confirmation Dialog */}
      <MerchantActionDialog
        open={actionDialogOpen}
        onClose={handleCloseAction}
        actionType={actionType}
        merchant={selectedMerchant}
        reason={actionReason}
        onReasonChange={setReason}
        onConfirm={handlePerformAction}
        loading={actionLoading}
      />
    </Container>
  );
};

export default MerchantVerificationPage;
