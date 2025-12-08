import { useState, useEffect, useCallback } from "react";
import { useSnackbar } from "../../../hooks/useSnackbar";
import contactService from "../../../services/admin/contactService";

/**
 * useAdminContacts Custom Hook
 *
 * PURPOSE: Centralize contact/report management state and API logic for admin panel
 * FEATURES:
 * - Fetch contacts with advanced filters (type, status, priority, category, entityType)
 * - Contact details fetching
 * - Action handlers (update status, add response, add note, take action on reports)
 * - Report-specific functions (get entity reports, take moderation action)
 * - Dialog state management
 * - Loading and error handling
 *
 * PATTERN: Follows useAdminUsers pattern
 */
const useAdminContacts = () => {
  const { showSnackbar } = useSnackbar();

  // Contact list state
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalItems, setTotalItems] = useState(0);

  // Filter and pagination state
  const [filters, setFilters] = useState({
    type: "",
    status: "",
    priority: "",
    category: "", // For content_report filtering
    entityType: "", // For content_report filtering
    search: "",
  });
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(20);
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState("desc");

  // Dialog state
  const [selectedContact, setSelectedContact] = useState(null);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [actionDialogOpen, setActionDialogOpen] = useState(false);
  const [actionType, setActionType] = useState(null); // 'status', 'response', 'note', 'report_action'
  const [actionData, setActionData] = useState({
    status: "",
    response: "",
    note: "",
    actionTaken: "",
  });
  const [actionLoading, setActionLoading] = useState(false);

  // Entity reports state (for viewing all reports on a specific entity)
  const [entityReports, setEntityReports] = useState([]);
  const [entityReportsLoading, setEntityReportsLoading] = useState(false);
  const [entityReportsDialogOpen, setEntityReportsDialogOpen] = useState(false);

  /**
   * Fetch contacts with current filters
   */
  const fetchContacts = useCallback(async () => {
    try {
      setLoading(true);
      const response = await contactService.getAllContacts({
        ...filters,
        page: page + 1,
        limit: rowsPerPage,
        sortBy,
        sortOrder,
      });

      setContacts(response.contacts || []);
      setTotalItems(response.pagination?.totalItems || 0);
    } catch (error) {
      showSnackbar(
        error.response?.data?.message || "Failed to load contacts",
        "error"
      );
    } finally {
      setLoading(false);
    }
  }, [filters, page, rowsPerPage, sortBy, sortOrder, showSnackbar]);

  /**
   * Fetch detailed contact information
   */
  const fetchContactDetails = async (contactId) => {
    try {
      const response = await contactService.getContactById(contactId);
      setSelectedContact(response.contact);
      setDetailDialogOpen(true);
    } catch (error) {
      showSnackbar(
        error.response?.data?.message || "Failed to load contact details",
        "error"
      );
    }
  };

  /**
   * Fetch all reports for a specific entity
   */
  const fetchEntityReports = async (entityType, entityId) => {
    try {
      setEntityReportsLoading(true);
      const response = await contactService.getEntityReports(
        entityType,
        entityId
      );
      setEntityReports(response.reports || []);
      setEntityReportsDialogOpen(true);
    } catch (error) {
      showSnackbar(
        error.response?.data?.message || "Failed to load entity reports",
        "error"
      );
    } finally {
      setEntityReportsLoading(false);
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
   * Open action dialog
   */
  const openActionDialog = (contact, type) => {
    setSelectedContact(contact);
    setActionType(type);
    setActionDialogOpen(true);
    setActionData({
      status: contact.status || "",
      response: "",
      note: "",
      actionTaken: "",
    });
  };

  /**
   * Close action dialog
   */
  const closeActionDialog = () => {
    setActionDialogOpen(false);
    setSelectedContact(null);
    setActionType(null);
    setActionData({
      status: "",
      response: "",
      note: "",
      actionTaken: "",
    });
  };

  /**
   * Close entity reports dialog
   */
  const closeEntityReportsDialog = () => {
    setEntityReportsDialogOpen(false);
    setEntityReports([]);
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

  /**
   * Handle action submission
   */
  const handleActionSubmit = async () => {
    if (!selectedContact) return;

    try {
      setActionLoading(true);

      let response;
      switch (actionType) {
        case "status":
          if (!actionData.status) {
            showSnackbar("Please select a status", "warning");
            return;
          }
          response = await contactService.updateContactStatus(
            selectedContact._id,
            actionData.status
          );
          showSnackbar("Status updated successfully", "success");
          break;

        case "response":
          if (!actionData.response.trim()) {
            showSnackbar("Please enter a response", "warning");
            return;
          }
          response = await contactService.addAdminResponse(
            selectedContact._id,
            actionData.response
          );
          showSnackbar("Response added successfully", "success");
          break;

        case "note":
          if (!actionData.note.trim()) {
            showSnackbar("Please enter a note", "warning");
            return;
          }
          response = await contactService.addInternalNote(
            selectedContact._id,
            actionData.note
          );
          showSnackbar("Note added successfully", "success");
          break;

        case "report_action":
          if (!actionData.actionTaken) {
            showSnackbar("Please select an action", "warning");
            return;
          }
          response = await contactService.takeReportAction(
            selectedContact._id,
            actionData.actionTaken
          );
          showSnackbar("Action taken successfully", "success");
          break;

        default:
          showSnackbar("Invalid action type", "error");
          return;
      }

      // Update selected contact with response
      if (response?.contact) {
        setSelectedContact(response.contact);
      }

      // Refresh the list
      await fetchContacts();

      // Close dialog
      closeActionDialog();
    } catch (error) {
      showSnackbar(
        error.response?.data?.message || "Failed to perform action",
        "error"
      );
    } finally {
      setActionLoading(false);
    }
  };

  /**
   * Delete contact submission
   */
  const handleDeleteContact = async (contactId) => {
    try {
      await contactService.deleteContact(contactId);
      showSnackbar("Contact submission deleted successfully", "success");
      await fetchContacts();
      if (detailDialogOpen) {
        setDetailDialogOpen(false);
        setSelectedContact(null);
      }
    } catch (error) {
      showSnackbar(
        error.response?.data?.message || "Failed to delete contact",
        "error"
      );
    }
  };

  /**
   * Refresh contacts list
   */
  const refreshContacts = useCallback(() => {
    fetchContacts();
  }, [fetchContacts]);

  // Fetch contacts on mount and when dependencies change
  useEffect(() => {
    fetchContacts();
  }, [fetchContacts]);

  return {
    // Data
    contacts,
    loading,
    totalItems,
    selectedContact,
    entityReports,
    entityReportsLoading,

    // Filters and pagination
    filters,
    page,
    rowsPerPage,
    sortBy,
    sortOrder,
    updateFilter,
    handleSearch,
    handleChangePage,
    handleChangeRowsPerPage,
    handleSortChange,

    // Dialog state
    detailDialogOpen,
    setDetailDialogOpen,
    actionDialogOpen,
    actionType,
    actionData,
    actionLoading,
    entityReportsDialogOpen,

    // Actions
    fetchContactDetails,
    fetchEntityReports,
    openActionDialog,
    closeActionDialog,
    closeEntityReportsDialog,
    updateActionData,
    handleActionSubmit,
    handleDeleteContact,
    refreshContacts,
  };
};

export default useAdminContacts;
