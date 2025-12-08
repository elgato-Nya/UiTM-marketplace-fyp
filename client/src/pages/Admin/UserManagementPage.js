import { useState } from "react";
import {
  Container,
  Box,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  TextField,
  FormGroup,
  FormControlLabel,
  Checkbox,
  CircularProgress,
  Skeleton,
} from "@mui/material";
import { Refresh } from "@mui/icons-material";
import { useTheme } from "../../hooks/useTheme";
import { useAdminUsers, useUserStats } from "../../features/admin/hooks";
import UserStatsCards from "../../features/admin/components/UserStatsCards";
import UserFilters from "../../features/admin/components/UserFilters";
import BulkActions from "../../features/admin/components/BulkActions";
import UserTable from "../../features/admin/components/UserTable";
import UserActionMenu from "../../features/admin/components/UserActionMenu";
import UserDetailModal from "../../features/admin/components/UserDetailModal";

/**
 * UserManagementPage Component
 *
 * PURPOSE: Admin interface for comprehensive user management
 *
 * FEATURES:
 * - User statistics dashboard
 * - Advanced filtering (role, status, campus, verified, search)
 * - Sortable table with multi-row selection
 * - Individual user actions (suspend, activate, roles, verify, reset password)
 * - Bulk operations (max 50 users)
 * - Detailed user information modal
 * - Mobile-responsive layout
 *
 * USER ACTIONS:
 * - View Details: Full user information
 * - Suspend: Temporarily suspend user (requires reason)
 * - Activate: Reactivate suspended user
 * - Update Roles: Modify user roles (consumer/merchant/admin)
 * - Verify Email: Manually verify user email
 * - Reset Password: Generate temporary password
 *
 * BULK ACTIONS:
 * - Bulk Suspend (max 50, requires reason)
 * - Bulk Activate (max 50)
 * - Bulk Verify Emails (max 50)
 *
 * ACCESSIBILITY:
 * - Semantic HTML (section, article)
 * - Proper ARIA labels and roles
 * - Keyboard navigation support
 * - Screen reader friendly
 * - Focus management in dialogs
 *
 * RESPONSIVE:
 * - Mobile-first design
 * - Collapsible filters on mobile
 * - Stacked layout on small screens
 * - Horizontal scroll for table
 */
const UserManagementPage = () => {
  const { theme } = useTheme();

  // User management hook
  const {
    users,
    loading,
    totalItems,
    filters,
    page,
    rowsPerPage,
    sortBy,
    sortOrder,
    selectedUserIds,
    selectedUser,
    detailDialogOpen,
    actionDialogOpen,
    actionType,
    actionData,
    actionLoading,
    bulkDialogOpen,
    bulkAction,
    bulkReason,
    fetchUsers,
    fetchUserDetails,
    updateFilter,
    handleSearch,
    handleChangePage,
    handleChangeRowsPerPage,
    handleSortChange,
    handleSelectUser,
    handleSelectAll,
    clearSelection,
    handleOpenAction,
    handleCloseAction,
    handleCloseDetail,
    handleOpenBulkAction,
    handleCloseBulkAction,
    handlePerformAction,
    handlePerformBulkAction,
    handleRefresh,
    updateActionData,
    setBulkReason,
  } = useAdminUsers();

  // User statistics hook
  const {
    stats,
    isLoading: statsLoading,
    refresh: refreshStats,
  } = useUserStats();

  // Action menu state
  const [actionMenuAnchor, setActionMenuAnchor] = useState(null);
  const [actionMenuUser, setActionMenuUser] = useState(null);

  /**
   * Open action menu for a user
   */
  const handleActionMenuOpen = (event, user) => {
    setActionMenuAnchor(event.currentTarget);
    setActionMenuUser(user);
  };

  /**
   * Close action menu
   */
  const handleActionMenuClose = () => {
    setActionMenuAnchor(null);
    setActionMenuUser(null);
  };

  /**
   * Handle page refresh
   */
  const handlePageRefresh = () => {
    handleRefresh();
    refreshStats();
  };

  /**
   * Render action dialog content based on action type
   */
  const renderActionDialogContent = () => {
    if (!selectedUser || !actionType) return null;

    switch (actionType) {
      case "suspend":
        return (
          <>
            <DialogContentText>
              You are about to suspend{" "}
              <strong>{selectedUser.profile?.username}</strong>. The user will
              not be able to access the platform until reactivated.
            </DialogContentText>
            <TextField
              autoFocus
              required
              fullWidth
              multiline
              rows={4}
              label="Suspension Reason"
              placeholder="Provide a detailed reason for suspension (minimum 10 characters)..."
              value={actionData.reason}
              onChange={(e) => updateActionData("reason", e.target.value)}
              error={
                actionData.reason.length > 0 && actionData.reason.length < 10
              }
              helperText={
                actionData.reason.length > 0 && actionData.reason.length < 10
                  ? "Reason must be at least 10 characters"
                  : `${actionData.reason.length}/500 characters`
              }
              inputProps={{
                maxLength: 500,
                "aria-label": "Suspension reason",
              }}
              sx={{ mt: 2 }}
            />
          </>
        );

      case "activate":
        return (
          <DialogContentText>
            You are about to reactivate{" "}
            <strong>{selectedUser.profile?.username}</strong>. The user will
            regain full access to the platform.
          </DialogContentText>
        );

      case "updateRoles":
        return (
          <>
            <DialogContentText>
              Update roles for <strong>{selectedUser.profile?.username}</strong>
              . Select all roles that should be assigned to this user.
            </DialogContentText>
            <FormGroup sx={{ mt: 2 }}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={actionData.roles.includes("consumer")}
                    onChange={(e) => {
                      const newRoles = e.target.checked
                        ? [...actionData.roles, "consumer"]
                        : actionData.roles.filter((r) => r !== "consumer");
                      updateActionData("roles", newRoles);
                    }}
                    inputProps={{ "aria-label": "Consumer role checkbox" }}
                  />
                }
                label="Consumer"
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={actionData.roles.includes("merchant")}
                    onChange={(e) => {
                      const newRoles = e.target.checked
                        ? [...actionData.roles, "merchant"]
                        : actionData.roles.filter((r) => r !== "merchant");
                      updateActionData("roles", newRoles);
                    }}
                    inputProps={{ "aria-label": "Merchant role checkbox" }}
                  />
                }
                label="Merchant"
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={actionData.roles.includes("admin")}
                    onChange={(e) => {
                      const newRoles = e.target.checked
                        ? [...actionData.roles, "admin"]
                        : actionData.roles.filter((r) => r !== "admin");
                      updateActionData("roles", newRoles);
                    }}
                    inputProps={{ "aria-label": "Admin role checkbox" }}
                  />
                }
                label="Admin"
              />
            </FormGroup>
          </>
        );

      case "verify":
        return (
          <DialogContentText>
            You are about to manually verify the email for{" "}
            <strong>{selectedUser.profile?.username}</strong>. This will mark
            their email as verified without requiring them to click a
            verification link.
          </DialogContentText>
        );

      case "resetPassword":
        return (
          <DialogContentText>
            You are about to reset the password for{" "}
            <strong>{selectedUser.profile?.username}</strong>. A temporary
            password will be generated and displayed. Make sure to save it
            securely and share it with the user through a secure channel.
          </DialogContentText>
        );

      default:
        return null;
    }
  };

  /**
   * Get action dialog title
   */
  const getActionDialogTitle = () => {
    const titles = {
      suspend: "Suspend User",
      activate: "Activate User",
      updateRoles: "Update User Roles",
      verify: "Verify Email",
      resetPassword: "Reset Password",
    };
    return titles[actionType] || "User Action";
  };

  /**
   * Get action button text
   */
  const getActionButtonText = () => {
    const texts = {
      suspend: "Suspend",
      activate: "Activate",
      updateRoles: "Update Roles",
      verify: "Verify",
      resetPassword: "Reset Password",
    };
    return texts[actionType] || "Confirm";
  };

  /**
   * Get bulk action dialog title
   */
  const getBulkActionDialogTitle = () => {
    const titles = {
      suspend: "Bulk Suspend Users",
      activate: "Bulk Activate Users",
      verify: "Bulk Verify Emails",
    };
    return titles[bulkAction] || "Bulk Action";
  };

  return (
    <Container maxWidth="xl" sx={{ py: { xs: 2, sm: 3, md: 4 } }}>
      {/* Page Header */}
      <Box
        component="header"
        sx={{
          display: "flex",
          flexDirection: { xs: "column", sm: "row" },
          justifyContent: "space-between",
          alignItems: { xs: "flex-start", sm: "center" },
          gap: 2,
          mb: 3,
        }}
        aria-label="Page header"
      >
        <Box>
          <Typography variant="h4" gutterBottom sx={{ fontWeight: 600 }}>
            User Management
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Manage users, roles, and account statuses
          </Typography>
        </Box>
        <Button
          variant="outlined"
          startIcon={<Refresh />}
          onClick={handlePageRefresh}
          aria-label="Refresh user list and statistics"
          size="small"
          sx={{ height: "fit-content" }}
        >
          Refresh
        </Button>
      </Box>

      {/* Statistics Cards */}
      <section aria-label="User statistics">
        {statsLoading ? (
          <Box sx={{ mb: 3 }}>
            <Skeleton variant="text" width={200} height={32} sx={{ mb: 2 }} />
            <Box sx={{ display: "flex", gap: 3, flexWrap: "wrap" }}>
              {[1, 2, 3, 4].map((i) => (
                <Skeleton
                  key={i}
                  variant="rectangular"
                  sx={{ flex: "1 1 200px", height: 140, borderRadius: 1 }}
                />
              ))}
            </Box>
          </Box>
        ) : (
          <UserStatsCards stats={stats} isLoading={statsLoading} />
        )}
      </section>

      {/* Filters */}
      <UserFilters
        filters={filters}
        onFilterChange={updateFilter}
        onSearch={handleSearch}
      />

      {/* Bulk Actions Toolbar */}
      <BulkActions
        selectedCount={selectedUserIds.length}
        onSuspendSelected={() => handleOpenBulkAction("suspend")}
        onActivateSelected={() => handleOpenBulkAction("activate")}
        onVerifySelected={() => handleOpenBulkAction("verify")}
        onClearSelection={clearSelection}
        maxLimit={50}
      />

      {/* Users Table */}
      <section aria-label="Users table">
        <UserTable
          users={users}
          loading={loading}
          totalItems={totalItems}
          page={page}
          rowsPerPage={rowsPerPage}
          sortBy={sortBy}
          sortOrder={sortOrder}
          selectedIds={selectedUserIds}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          onSort={handleSortChange}
          onSelectUser={handleSelectUser}
          onSelectAll={handleSelectAll}
          onActionMenuOpen={handleActionMenuOpen}
        />
      </section>

      {/* Action Menu */}
      <UserActionMenu
        anchorEl={actionMenuAnchor}
        open={Boolean(actionMenuAnchor)}
        user={actionMenuUser}
        onClose={handleActionMenuClose}
        onViewDetails={() => {
          if (actionMenuUser) {
            fetchUserDetails(actionMenuUser._id);
          }
          handleActionMenuClose();
        }}
        onSuspend={() => {
          if (actionMenuUser) {
            handleOpenAction(actionMenuUser, "suspend");
          }
          handleActionMenuClose();
        }}
        onActivate={() => {
          if (actionMenuUser) {
            handleOpenAction(actionMenuUser, "activate");
          }
          handleActionMenuClose();
        }}
        onUpdateRoles={() => {
          if (actionMenuUser) {
            handleOpenAction(actionMenuUser, "updateRoles");
          }
          handleActionMenuClose();
        }}
        onVerifyEmail={() => {
          if (actionMenuUser) {
            handleOpenAction(actionMenuUser, "verify");
          }
          handleActionMenuClose();
        }}
        onResetPassword={() => {
          if (actionMenuUser) {
            handleOpenAction(actionMenuUser, "resetPassword");
          }
          handleActionMenuClose();
        }}
      />

      {/* User Detail Modal */}
      <UserDetailModal
        open={detailDialogOpen}
        onClose={handleCloseDetail}
        user={selectedUser}
      />

      {/* Action Dialog */}
      <Dialog
        open={actionDialogOpen}
        onClose={handleCloseAction}
        maxWidth="sm"
        fullWidth
        aria-labelledby="action-dialog-title"
        aria-describedby="action-dialog-description"
      >
        <DialogTitle id="action-dialog-title">
          {getActionDialogTitle()}
        </DialogTitle>
        <DialogContent>
          <Box id="action-dialog-description">
            {renderActionDialogContent()}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={handleCloseAction}
            disabled={actionLoading}
            aria-label="Cancel action"
          >
            Cancel
          </Button>
          <Button
            onClick={handlePerformAction}
            variant="contained"
            disabled={actionLoading}
            color={actionType === "suspend" ? "error" : "primary"}
            startIcon={actionLoading && <CircularProgress size={16} />}
            aria-label={`Confirm ${getActionButtonText()}`}
          >
            {actionLoading ? "Processing..." : getActionButtonText()}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Bulk Action Dialog */}
      <Dialog
        open={bulkDialogOpen}
        onClose={handleCloseBulkAction}
        maxWidth="sm"
        fullWidth
        aria-labelledby="bulk-action-dialog-title"
        aria-describedby="bulk-action-dialog-description"
      >
        <DialogTitle id="bulk-action-dialog-title">
          {getBulkActionDialogTitle()}
        </DialogTitle>
        <DialogContent>
          <Box id="bulk-action-dialog-description">
            <DialogContentText>
              You are about to perform this action on{" "}
              <strong>{selectedUserIds.length}</strong> selected user
              {selectedUserIds.length > 1 ? "s" : ""}.
            </DialogContentText>

            {bulkAction === "suspend" && (
              <TextField
                autoFocus
                required
                fullWidth
                multiline
                rows={4}
                label="Suspension Reason"
                placeholder="Provide a detailed reason for bulk suspension (minimum 10 characters)..."
                value={bulkReason}
                onChange={(e) => setBulkReason(e.target.value)}
                error={bulkReason.length > 0 && bulkReason.length < 10}
                helperText={
                  bulkReason.length > 0 && bulkReason.length < 10
                    ? "Reason must be at least 10 characters"
                    : `${bulkReason.length}/500 characters`
                }
                inputProps={{
                  maxLength: 500,
                  "aria-label": "Bulk suspension reason",
                }}
                sx={{ mt: 2 }}
              />
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={handleCloseBulkAction}
            disabled={actionLoading}
            aria-label="Cancel bulk action"
          >
            Cancel
          </Button>
          <Button
            onClick={handlePerformBulkAction}
            variant="contained"
            disabled={actionLoading}
            color={bulkAction === "suspend" ? "error" : "primary"}
            startIcon={actionLoading && <CircularProgress size={16} />}
            aria-label={`Confirm bulk ${bulkAction}`}
          >
            {actionLoading
              ? "Processing..."
              : `${bulkAction === "suspend" ? "Suspend" : bulkAction === "activate" ? "Activate" : "Verify"} ${selectedUserIds.length} User${selectedUserIds.length > 1 ? "s" : ""}`}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default UserManagementPage;
