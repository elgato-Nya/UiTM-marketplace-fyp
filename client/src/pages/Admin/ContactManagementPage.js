import { useState } from "react";
import {
  Container,
  Box,
  Typography,
  Button,
  CircularProgress,
} from "@mui/material";
import { Refresh } from "@mui/icons-material";
import { useTheme } from "../../hooks/useTheme";
import { useAdminContacts } from "../../features/admin/hooks";
import ContactFilters from "../../features/admin/components/ContactFilters";
import ContactTable from "../../features/admin/components/ContactTable";
import ContactDetailDialog from "../../features/admin/components/ContactDetailDialog";
import ContactActionDialog from "../../features/admin/components/ContactActionDialog";

/**
 * ContactManagementPage Component
 *
 * PURPOSE: Admin interface for contact submissions and content report management
 *
 * FEATURES:
 * - Contact statistics overview
 * - Advanced filtering (type, status, priority, category, entityType)
 * - Sortable table display
 * - Detailed contact/report viewing
 * - Status updates, admin responses, internal notes
 * - Content report moderation actions
 * - Mobile-responsive layout
 *
 * CONTACT ACTIONS:
 * - View Details: Full submission information
 * - Update Status: Change submission status
 * - Add Response: Send response to submitter
 * - Add Note: Internal team notes
 * - Take Action: Content moderation actions (reports only)
 *
 * REPORT MODERATION ACTIONS:
 * - No Action Required
 * - Remove Content
 * - Remove Listing
 * - Warn User
 * - Suspend User
 * - Ban User
 *
 * ACCESSIBILITY:
 * - Semantic HTML structure
 * - Proper ARIA labels
 * - Keyboard navigation
 * - Screen reader friendly
 * - Focus management in dialogs
 *
 * RESPONSIVE:
 * - Mobile-first design
 * - Collapsible filters
 * - Horizontal scroll for table
 * - Stacked dialog content on mobile
 */
const ContactManagementPage = () => {
  const { theme } = useTheme();

  // Contact management hook
  const {
    contacts,
    loading,
    totalItems,
    filters,
    page,
    rowsPerPage,
    sortBy,
    sortOrder,
    selectedContact,
    detailDialogOpen,
    setDetailDialogOpen,
    actionDialogOpen,
    actionType,
    actionData,
    actionLoading,
    updateFilter,
    handleSearch,
    handleChangePage,
    handleChangeRowsPerPageChange,
    handleSortChange,
    fetchContactDetails,
    openActionDialog,
    closeActionDialog,
    updateActionData,
    handleActionSubmit,
    refreshContacts,
  } = useAdminContacts();

  /**
   * Handle row click to view details
   */
  const handleRowClick = (contact) => {
    fetchContactDetails(contact._id);
  };

  /**
   * Handle action button click from detail dialog
   */
  const handleActionClick = (contact, type) => {
    setDetailDialogOpen(false);
    openActionDialog(contact, type);
  };

  /**
   * Handle page refresh
   */
  const handlePageRefresh = () => {
    refreshContacts();
  };

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Page Header */}
      <Box
        component="section"
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          mb: 4,
          flexWrap: "wrap",
          gap: 2,
        }}
        aria-label="Page header"
      >
        <Box>
          <Typography
            variant="h4"
            component="h1"
            sx={{ fontWeight: 700, mb: 0.5 }}
          >
            Contact & Report Management
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Manage bug reports, enquiries, feedback, collaboration requests, and
            content moderation reports
          </Typography>
        </Box>

        <Button
          variant="outlined"
          startIcon={<Refresh />}
          onClick={handlePageRefresh}
          disabled={loading}
          aria-label="Refresh contacts"
        >
          Refresh
        </Button>
      </Box>

      {/* Filters */}
      <ContactFilters
        filters={filters}
        onFilterChange={updateFilter}
        onSearch={handleSearch}
      />

      {/* Total Count */}
      {!loading && (
        <Box sx={{ mb: 2 }}>
          <Typography variant="body2" color="text.secondary">
            {totalItems} {totalItems === 1 ? "submission" : "submissions"} found
          </Typography>
        </Box>
      )}

      {/* Contact Table */}
      <Box component="section" aria-label="Contact submissions table">
        <ContactTable
          contacts={contacts}
          loading={loading}
          totalItems={totalItems}
          page={page}
          rowsPerPage={rowsPerPage}
          sortBy={sortBy}
          sortOrder={sortOrder}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPageChange}
          onSort={handleSortChange}
          onRowClick={handleRowClick}
          onActionMenuOpen={(e, contact) => {
            e.stopPropagation();
            openActionDialog(contact, "status");
          }}
        />
      </Box>

      {/* Contact Detail Dialog */}
      <ContactDetailDialog
        open={detailDialogOpen}
        onClose={() => setDetailDialogOpen(false)}
        contact={selectedContact}
        onActionClick={handleActionClick}
      />

      {/* Action Dialog */}
      <ContactActionDialog
        open={actionDialogOpen}
        onClose={closeActionDialog}
        actionType={actionType}
        contact={selectedContact}
        actionData={actionData}
        onDataChange={updateActionData}
        onConfirm={handleActionSubmit}
        loading={actionLoading}
      />
    </Container>
  );
};

export default ContactManagementPage;
