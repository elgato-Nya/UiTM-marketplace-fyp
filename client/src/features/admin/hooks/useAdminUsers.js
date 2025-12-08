import { useState, useEffect, useCallback } from "react";
import { useSnackbar } from "../../../hooks/useSnackbar";
import adminUserService from "../../../services/admin/userService";

/**
 * useAdminUsers Custom Hook
 *
 * PURPOSE: Centralize user management state and API logic for admin panel
 * FEATURES:
 * - Fetch users with advanced filters and pagination
 * - User details fetching
 * - Action handlers (suspend, activate, update roles, verify, reset password)
 * - Bulk operations support
 * - Dialog state management
 * - Loading and error handling
 *
 * PATTERN: Follows useMerchantManagement pattern
 */
const useAdminUsers = () => {
  const { showSnackbar } = useSnackbar();

  // User list state
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalItems, setTotalItems] = useState(0);

  // Filter and pagination state
  const [filters, setFilters] = useState({
    role: "all",
    status: "all",
    campus: "",
    verified: undefined,
    search: "",
  });
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(20);
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState("desc");

  // Selection state for bulk operations
  const [selectedUserIds, setSelectedUserIds] = useState([]);

  // Dialog state
  const [selectedUser, setSelectedUser] = useState(null);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [actionDialogOpen, setActionDialogOpen] = useState(false);
  const [actionType, setActionType] = useState(null);
  const [actionData, setActionData] = useState({
    reason: "",
    roles: [],
  });
  const [actionLoading, setActionLoading] = useState(false);

  // Bulk operation dialog
  const [bulkDialogOpen, setBulkDialogOpen] = useState(false);
  const [bulkAction, setBulkAction] = useState(null);
  const [bulkReason, setBulkReason] = useState("");

  /**
   * Fetch users with current filters
   */
  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      const response = await adminUserService.getAllUsers({
        ...filters,
        page: page + 1,
        limit: rowsPerPage,
        sortBy,
        sortOrder,
      });

      setUsers(response.users || []);
      setTotalItems(response.pagination?.totalItems || 0);
    } catch (error) {
      showSnackbar(
        error.response?.data?.message || "Failed to load users",
        "error"
      );
    } finally {
      setLoading(false);
    }
  }, [filters, page, rowsPerPage, sortBy, sortOrder, showSnackbar]);

  /**
   * Fetch detailed user information
   */
  const fetchUserDetails = async (userId) => {
    try {
      const response = await adminUserService.getUserById(userId);
      // API returns nested structure: {success, message, user: {success, data: {...}}}
      const userData = response.user?.data || response.user;
      setSelectedUser(userData);
      setDetailDialogOpen(true);
    } catch (error) {
      showSnackbar(
        error.response?.data?.message || "Failed to load user details",
        "error"
      );
    }
  };

  /**
   * Update filter value
   */
  const updateFilter = (filterKey, value) => {
    setFilters((prev) => ({
      ...prev,
      [filterKey]: value,
    }));
    setPage(0); // Reset to first page on filter change
  };

  /**
   * Handle search input
   */
  const handleSearch = (event) => {
    updateFilter("search", event.target.value);
  };

  /**
   * Handle page change
   */
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  /**
   * Handle rows per page change
   */
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  /**
   * Handle sort change
   */
  const handleSortChange = (field) => {
    if (sortBy === field) {
      // Toggle sort order
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      // New field, default to descending
      setSortBy(field);
      setSortOrder("desc");
    }
    setPage(0);
  };

  /**
   * Handle user selection (for bulk operations)
   */
  const handleSelectUser = (userId) => {
    setSelectedUserIds((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId]
    );
  };

  /**
   * Handle select all users
   */
  const handleSelectAll = (event) => {
    if (event.target.checked) {
      setSelectedUserIds(users.map((user) => user._id));
    } else {
      setSelectedUserIds([]);
    }
  };

  /**
   * Clear selection
   */
  const clearSelection = () => {
    setSelectedUserIds([]);
  };

  /**
   * Open action dialog
   */
  const handleOpenAction = (user, type) => {
    setSelectedUser(user);
    setActionType(type);
    setActionData({
      reason: "",
      roles: user?.roles || [],
    });
    setActionDialogOpen(true);
  };

  /**
   * Close action dialog
   */
  const handleCloseAction = () => {
    if (!actionLoading) {
      setActionDialogOpen(false);
      setActionData({ reason: "", roles: [] });
    }
  };

  /**
   * Close detail dialog
   */
  const handleCloseDetail = () => {
    setDetailDialogOpen(false);
    setSelectedUser(null);
  };

  /**
   * Open bulk action dialog
   */
  const handleOpenBulkAction = (action) => {
    if (selectedUserIds.length === 0) {
      showSnackbar("Please select at least one user", "warning");
      return;
    }
    if (selectedUserIds.length > 50) {
      showSnackbar(
        "Cannot perform bulk operations on more than 50 users at once",
        "warning"
      );
      return;
    }
    setBulkAction(action);
    setBulkReason("");
    setBulkDialogOpen(true);
  };

  /**
   * Close bulk action dialog
   */
  const handleCloseBulkAction = () => {
    if (!actionLoading) {
      setBulkDialogOpen(false);
      setBulkReason("");
    }
  };

  /**
   * Perform user action (suspend, activate, update roles, verify, reset password)
   */
  const handlePerformAction = async () => {
    if (!selectedUser) return;

    // Validate required reason for suspend
    if (actionType === "suspend" && !actionData.reason.trim()) {
      showSnackbar("Please provide a reason for suspension", "warning");
      return;
    }

    // Validate roles for updateRoles action
    if (actionType === "updateRoles" && actionData.roles.length === 0) {
      showSnackbar("Please select at least one role", "warning");
      return;
    }

    try {
      setActionLoading(true);

      switch (actionType) {
        case "suspend":
          await adminUserService.updateUserStatus(
            selectedUser._id,
            true,
            actionData.reason
          );
          showSnackbar("User suspended successfully", "success");
          break;

        case "activate":
          await adminUserService.updateUserStatus(
            selectedUser._id,
            false,
            actionData.reason
          );
          showSnackbar("User activated successfully", "success");
          break;

        case "updateRoles":
          await adminUserService.updateUserRoles(
            selectedUser._id,
            actionData.roles
          );
          showSnackbar("User roles updated successfully", "success");
          break;

        case "verify":
          await adminUserService.verifyUserEmail(selectedUser._id);
          showSnackbar("User email verified successfully", "success");
          break;

        case "resetPassword":
          const response = await adminUserService.resetUserPassword(
            selectedUser._id
          );
          showSnackbar(
            `Password reset successful. Temporary password: ${response.tempPassword}`,
            "success"
          );
          break;

        default:
          break;
      }

      // Close dialogs and refresh list
      setActionDialogOpen(false);
      setDetailDialogOpen(false);
      setActionData({ reason: "", roles: [] });
      fetchUsers();
    } catch (error) {
      showSnackbar(error.response?.data?.message || "Action failed", "error");
    } finally {
      setActionLoading(false);
    }
  };

  /**
   * Perform bulk operation
   */
  const handlePerformBulkAction = async () => {
    // Validate reason for suspend action
    if (bulkAction === "suspend" && !bulkReason.trim()) {
      showSnackbar("Please provide a reason for suspension", "warning");
      return;
    }

    try {
      setActionLoading(true);

      const response = await adminUserService.bulkUpdateUsers({
        userIds: selectedUserIds,
        action: bulkAction,
        reason: bulkReason,
      });

      // Show results
      const { successful, failed } = response;
      if (failed > 0) {
        showSnackbar(
          `Bulk operation completed. ${successful} succeeded, ${failed} failed.`,
          "warning"
        );
      } else {
        showSnackbar(
          `Bulk operation completed successfully. ${successful} users updated.`,
          "success"
        );
      }

      // Close dialog, clear selection, and refresh
      setBulkDialogOpen(false);
      setBulkReason("");
      clearSelection();
      fetchUsers();
    } catch (error) {
      showSnackbar(
        error.response?.data?.message || "Bulk operation failed",
        "error"
      );
    } finally {
      setActionLoading(false);
    }
  };

  /**
   * Refresh user list
   */
  const handleRefresh = () => {
    fetchUsers();
  };

  /**
   * Update action data
   */
  const updateActionData = (key, value) => {
    setActionData((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  // Auto-fetch when filters or pagination changes
  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  return {
    // State
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

    // Handlers
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
  };
};

export default useAdminUsers;
