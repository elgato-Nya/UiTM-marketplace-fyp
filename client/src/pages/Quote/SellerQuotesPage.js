import React, { useEffect, useState } from "react";
import {
  Container,
  Box,
  Typography,
  List,
  Paper,
  Pagination,
  Chip,
  Stack,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import { RequestQuote } from "@mui/icons-material";

import { useAuth } from "../../features/auth/hooks/useAuth";
import { useSnackbar } from "../../hooks/useSnackbar";
import DynamicSkeleton from "../../components/ui/Skeleton/DynamicSkeleton";
import SnackbarContainer from "../../components/ui/SnackbarContainer";

// Quote components
import QuoteListItem from "../../features/quote/components/QuoteListItem";
import QuoteDetailModal from "../../features/quote/components/QuoteDetailModal";
import EmptyQuoteState from "../../features/quote/components/EmptyQuoteState";

// Hooks
import { useQuotes } from "../../features/quote/hooks/useQuotes";
import { useQuoteActions } from "../../features/quote/hooks/useQuoteActions";

import { QUOTE_STATUS_CONFIG } from "../../constants/quoteConstant";

/**
 * SellerQuotesPage Component
 *
 * PURPOSE: Display seller's received quote requests with actions
 * PATTERN: Similar to SalesPage
 */
function SellerQuotesPage() {
  const { isAuthenticated, isMerchant, isLoading: isAuthLoading } = useAuth();

  const {
    quotes,
    isLoading: isDataLoading,
    pagination,
    filters,
    loadQuotes,
    updateFilters,
    resetFilters,
    changePage,
  } = useQuotes("seller");

  const {
    isSubmitting,
    provideQuote,
    cancelQuote,
    startService,
    completeService,
  } = useQuoteActions();

  const {
    snackbars,
    hideSnackbar,
    success: showSuccess,
    error: showError,
  } = useSnackbar();

  // State
  const [selectedQuote, setSelectedQuote] = useState(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);

  // Load quotes on mount
  useEffect(() => {
    if (isAuthenticated && isMerchant) {
      loadQuotes();
    }
  }, [isAuthenticated, isMerchant, loadQuotes]);

  // Handlers
  const handleViewDetails = (quote) => {
    setSelectedQuote(quote);
    setDetailModalOpen(true);
  };

  const handleCloseModal = () => {
    setDetailModalOpen(false);
    setSelectedQuote(null);
  };

  const handleProvideQuote = async (quoteId, quoteData) => {
    const result = await provideQuote(quoteId, quoteData);
    if (result.success) {
      showSuccess("Quote sent to customer");
      loadQuotes();
      handleCloseModal();
    } else {
      showError(result.error);
    }
  };

  const handleCancelQuote = async (quoteId, cancelData) => {
    const result = await cancelQuote(quoteId, cancelData);
    if (result.success) {
      showSuccess("Quote request cancelled");
      loadQuotes();
      handleCloseModal();
    } else {
      showError(result.error);
    }
  };

  const handleStartService = async (quoteId) => {
    const result = await startService(quoteId);
    if (result.success) {
      showSuccess("Service started");
      loadQuotes();
      handleCloseModal();
    } else {
      showError(result.error);
    }
  };

  const handleCompleteService = async (quoteId) => {
    const result = await completeService(quoteId);
    if (result.success) {
      showSuccess("Service marked as complete");
      loadQuotes();
      handleCloseModal();
    } else {
      showError(result.error);
    }
  };

  const handleStatusFilter = (event) => {
    updateFilters({ status: event.target.value || null });
    loadQuotes({ status: event.target.value || null });
  };

  const handlePageChange = (event, page) => {
    changePage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Loading state - Show skeleton during auth loading or initial data loading
  if (isAuthLoading || !isAuthenticated) {
    return (
      <DynamicSkeleton
        type="page"
        config={{
          contentType: "list",
          showHeader: false,
          showSidebar: false,
        }}
      />
    );
  }

  // Show skeleton during data loading (only if auth is complete)
  if (isDataLoading && !quotes.length) {
    return (
      <DynamicSkeleton
        type="page"
        config={{
          contentType: "list",
          showHeader: false,
          showSidebar: false,
        }}
      />
    );
  }

  const hasFilters = filters.status || filters.priority;

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <SnackbarContainer snackbars={snackbars} onClose={hideSnackbar} />

      {/* Header */}
      <Box sx={{ mb: 4 }}>
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
          <RequestQuote color="primary" />
          Quote Requests
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mt: 1 }}>
          Manage quote requests from customers
        </Typography>
      </Box>

      {/* Filters */}
      <Paper
        elevation={0}
        sx={{
          p: 2,
          mb: 3,
          border: 1,
          borderColor: "divider",
          borderRadius: 2,
        }}
      >
        <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel id="status-filter-label">Status</InputLabel>
            <Select
              labelId="status-filter-label"
              value={filters.status || ""}
              label="Status"
              onChange={handleStatusFilter}
            >
              <MenuItem value="">All Status</MenuItem>
              {Object.entries(QUOTE_STATUS_CONFIG).map(([key, config]) => (
                <MenuItem key={key} value={key}>
                  {config.icon} {config.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {hasFilters && (
            <Chip
              label="Clear Filters"
              onDelete={() => {
                resetFilters();
                loadQuotes();
              }}
              color="primary"
              variant="outlined"
            />
          )}
        </Stack>
      </Paper>

      {/* Quote List */}
      {quotes.length === 0 ? (
        <EmptyQuoteState
          role="seller"
          hasFilters={hasFilters}
          onReset={() => {
            resetFilters();
            loadQuotes();
          }}
        />
      ) : (
        <>
          <Paper
            elevation={0}
            sx={{
              border: 1,
              borderColor: "divider",
              borderRadius: 2,
              overflow: "hidden",
            }}
          >
            <List disablePadding>
              {quotes.map((quote) => (
                <QuoteListItem
                  key={quote._id}
                  quote={quote}
                  role="seller"
                  onViewDetails={handleViewDetails}
                />
              ))}
            </List>
          </Paper>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
              <Pagination
                count={pagination.totalPages}
                page={pagination.currentPage}
                onChange={handlePageChange}
                color="primary"
                showFirstButton
                showLastButton
              />
            </Box>
          )}
        </>
      )}

      {/* Detail Modal */}
      <QuoteDetailModal
        quote={selectedQuote}
        open={detailModalOpen}
        onClose={handleCloseModal}
        role="seller"
        onProvideQuote={handleProvideQuote}
        onCancel={handleCancelQuote}
        onStartService={handleStartService}
        onCompleteService={handleCompleteService}
        isSubmitting={isSubmitting}
      />
    </Container>
  );
}

export default SellerQuotesPage;
