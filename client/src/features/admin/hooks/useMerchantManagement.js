import { useState, useEffect } from "react";
import { useSnackbar } from "../../../hooks/useSnackbar";
import adminMerchantService from "../../../services/admin/merchantService";

/**
 * useMerchantManagement Custom Hook
 *
 * PURPOSE: Centralize merchant management state and API logic
 * FEATURES:
 * - Fetch merchants with filters and pagination
 * - Merchant details fetching
 * - Action handlers (verify, reject, suspend, reactivate)
 * - Dialog state management
 * - Loading and error handling
 *
 * BENEFITS:
 * - Separation of concerns
 * - Reusable logic
 * - Cleaner component code
 * - Easier testing
 */
const useMerchantManagement = () => {
  const { showSnackbar } = useSnackbar();

  // Merchant list state
  const [merchants, setMerchants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalItems, setTotalItems] = useState(0);

  // Filter and pagination state
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(20);

  // Dialog state
  const [selectedMerchant, setSelectedMerchant] = useState(null);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [actionDialogOpen, setActionDialogOpen] = useState(false);
  const [actionType, setActionType] = useState(null);
  const [actionReason, setActionReason] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  /**
   * Fetch merchants with current filters
   */
  const fetchMerchants = async () => {
    try {
      setLoading(true);
      const response = await adminMerchantService.getMerchants({
        status: selectedStatus,
        search: searchTerm,
        page: page + 1,
        limit: rowsPerPage,
      });

      // BaseController spreads data directly
      setMerchants(response.merchants || []);
      setTotalItems(response.pagination?.totalItems || 0);
    } catch (error) {
      showSnackbar(
        error.response?.data?.message || "Failed to load merchants",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  /**
   * Fetch detailed merchant information
   */
  const fetchMerchantDetails = async (userId) => {
    try {
      const response = await adminMerchantService.getMerchantDetails(userId);
      setSelectedMerchant(response.merchant);
      setDetailDialogOpen(true);
    } catch (error) {
      showSnackbar(
        error.response?.data?.message || "Failed to load merchant details",
        "error"
      );
    }
  };

  /**
   * Handle status tab change
   */
  const handleStatusChange = (event, newValue) => {
    setSelectedStatus(newValue);
    setPage(0);
  };

  /**
   * Handle search input
   */
  const handleSearch = (event) => {
    setSearchTerm(event.target.value);
    setPage(0);
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
   * Open action dialog
   */
  const handleOpenAction = (merchant, type) => {
    setSelectedMerchant(merchant);
    setActionType(type);
    setActionReason("");
    setActionDialogOpen(true);
  };

  /**
   * Close action dialog
   */
  const handleCloseAction = () => {
    if (!actionLoading) {
      setActionDialogOpen(false);
      setActionReason("");
    }
  };

  /**
   * Close detail dialog
   */
  const handleCloseDetail = () => {
    setDetailDialogOpen(false);
    setSelectedMerchant(null);
  };

  /**
   * Perform merchant action (verify, reject, suspend, reactivate)
   */
  const handlePerformAction = async () => {
    if (!selectedMerchant) return;

    // Validate required reason for reject/suspend
    if (
      (actionType === "reject" || actionType === "suspend") &&
      !actionReason.trim()
    ) {
      showSnackbar("Please provide a reason", "warning");
      return;
    }

    try {
      setActionLoading(true);

      switch (actionType) {
        case "verify":
          await adminMerchantService.verifyMerchant(
            selectedMerchant._id,
            actionReason
          );
          showSnackbar("Merchant verified successfully", "success");
          break;

        case "reject":
          await adminMerchantService.rejectMerchant(
            selectedMerchant._id,
            actionReason
          );
          showSnackbar("Merchant rejected", "info");
          break;

        case "suspend":
          await adminMerchantService.suspendMerchant(
            selectedMerchant._id,
            actionReason
          );
          showSnackbar("Merchant suspended", "warning");
          break;

        case "reactivate":
          await adminMerchantService.reactivateMerchant(selectedMerchant._id);
          showSnackbar("Merchant reactivated", "success");
          break;

        default:
          break;
      }

      // Close dialogs and refresh list
      setActionDialogOpen(false);
      setDetailDialogOpen(false);
      setActionReason("");
      fetchMerchants();
    } catch (error) {
      showSnackbar(error.response?.data?.message || "Action failed", "error");
    } finally {
      setActionLoading(false);
    }
  };

  /**
   * Refresh merchant list
   */
  const handleRefresh = () => {
    fetchMerchants();
  };

  /**
   * Set action reason
   */
  const setReason = (reason) => {
    setActionReason(reason);
  };

  // Auto-fetch when filters change
  useEffect(() => {
    fetchMerchants();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedStatus, searchTerm, page, rowsPerPage]);

  return {
    // State
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

    // Handlers
    fetchMerchants,
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
  };
};

export default useMerchantManagement;
