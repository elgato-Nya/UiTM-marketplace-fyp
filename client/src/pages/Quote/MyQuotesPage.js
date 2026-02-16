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
  CircularProgress,
} from "@mui/material";
import { QuestionAnswer } from "@mui/icons-material";

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

import {
  QUOTE_STATUS,
  QUOTE_STATUS_CONFIG,
} from "../../constants/quoteConstant";

/**
 * MyQuotesPage Component
 *
 * PURPOSE: Display buyer's quote requests with filtering and actions
 * PATTERN: Similar to PurchasesPage
 */
function MyQuotesPage() {
  const { isAuthenticated } = useAuth();

  const {
    quotes,
    isLoading,
    pagination,
    filters,
    loadQuotes,
    updateFilters,
    resetFilters,
    changePage,
  } = useQuotes("buyer");

  const { isSubmitting, acceptQuote, rejectQuote, cancelQuote } =
    useQuoteActions();

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
    if (isAuthenticated) {
      loadQuotes();
    }
  }, [isAuthenticated, loadQuotes]);

  // Handlers
  const handleViewDetails = (quote) => {
    setSelectedQuote(quote);
    setDetailModalOpen(true);
  };

  const handleCloseModal = () => {
    setDetailModalOpen(false);
    setSelectedQuote(null);
  };

  const handleAcceptQuote = async (quoteId) => {
    const result = await acceptQuote(quoteId);
    if (result.success) {
      showSuccess("Quote accepted! Proceed to payment.");
      loadQuotes();
      handleCloseModal();
    } else {
      showError(result.error);
    }
  };

  const handleRejectQuote = async (quoteId, rejectData) => {
    const result = await rejectQuote(quoteId, rejectData);
    if (result.success) {
      showSuccess("Quote rejected");
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

  const handleStatusFilter = (event) => {
    updateFilters({ status: event.target.value || null });
    loadQuotes({ status: event.target.value || null });
  };

  const handlePageChange = (event, page) => {
    changePage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const hasFilters = filters.status || filters.priority;

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <SnackbarContainer snackbars={snackbars} onClose={hideSnackbar} />

      {/* Show loading inside the page instead of full skeleton */}
      {!isAuthenticated && (
        <Box sx={{ display: "flex", justifyContent: "center", py: 10 }}>
          <CircularProgress />
        </Box>
      )}

      {isAuthenticated && (
        <>
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
              <QuestionAnswer color="primary" />
              My Quote Requests
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mt: 1 }}>
              View and manage your service quote requests
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
              role="buyer"
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
                      role="buyer"
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
            role="buyer"
            onAccept={handleAcceptQuote}
            onReject={handleRejectQuote}
            onCancel={handleCancelQuote}
            isSubmitting={isSubmitting}
          />
        </>
      )}
    </Container>
  );
}

export default MyQuotesPage;
