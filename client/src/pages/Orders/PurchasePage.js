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
} from "@mui/material";
import { useSearchParams } from "react-router-dom";
import { ShoppingBag } from "@mui/icons-material";

import { useAuth } from "../../features/auth/hooks/useAuth";
import { useSnackbar } from "../../hooks/useSnackbar";
import { useTheme } from "../../hooks/useTheme";
import DynamicSkeleton from "../../components/ui/Skeleton/DynamicSkeleton";
import SnackbarContainer from "../../components/ui/SnackbarContainer";

// Order-specific components
import OrderListItem from "../../features/orders/components/OrderListItem";
import OrderDetailModal from "../../features/orders/components/OrderDetailModal";
import EmptyOrderState from "../../features/orders/components/EmptyOrderState";
import CancelOrderDialog from "../../features/orders/components/CancelOrderDialog";

// Hooks
import { useOrders } from "../../features/orders/hooks/useOrders";
import { useOrderActions } from "../../features/orders/hooks/useOrderActions";

function PurchasesPage() {
  const { isAuthenticated } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const { theme } = useTheme();

  const {
    orders,
    isLoading,
    error,
    pagination,
    filters,
    loadOrders,
    updateFilters,
    resetFilters,
    changePage,
  } = useOrders("buyer");

  const { cancelOrder } = useOrderActions();

  // Snackbar for toast notifications
  const {
    snackbars,
    hideSnackbar,
    success: showSuccess,
    error: showError,
  } = useSnackbar();

  // State management
  const [cancelConfirm, setCancelConfirm] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);

  // Load orders on mount (only if authenticated)
  useEffect(() => {
    if (isAuthenticated) {
      loadOrders();
    }
  }, [isAuthenticated]);

  // Handle URL params
  useEffect(() => {
    const statusParam = searchParams.get("status");
    if (statusParam && statusParam !== filters.status) {
      updateFilters({ ...filters, status: statusParam });
    }
  }, [searchParams]);

  // Handlers
  const handleViewDetails = (order) => {
    setSelectedOrder(order);
    setDetailModalOpen(true);
  };

  const handleCloseDetailModal = () => {
    setDetailModalOpen(false);
    setSelectedOrder(null);
  };

  const handleCancelOrder = (order) => {
    setCancelConfirm(order);
  };

  const confirmCancel = async (orderId, reason, description) => {
    setIsCancelling(true);
    try {
      const result = await cancelOrder(orderId, reason, description);
      if (result.error) {
        throw new Error(result.error);
      }
      showSuccess("Order cancelled successfully");
      loadOrders();
      setCancelConfirm(null);
      // Close detail modal if open
      if (detailModalOpen && selectedOrder?._id === orderId) {
        handleCloseDetailModal();
      }
    } catch (err) {
      showError(err.message || "Failed to cancel order");
    } finally {
      setIsCancelling(false);
    }
  };

  const handleCloseCancelDialog = () => {
    if (!isCancelling) {
      setCancelConfirm(null);
    }
  };

  const handlePageChange = (event, page) => {
    changePage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Authentication guard
  if (!isAuthenticated) {
    return (
      <DynamicSkeleton
        type="page"
        config={{
          contentType: "grid",
          showHeader: false,
          showSidebar: false,
        }}
      />
    );
  }

  // Loading state
  if (isLoading && !orders.length) {
    return (
      <DynamicSkeleton
        type="page"
        config={{
          contentType: "grid",
          showHeader: false,
          showSidebar: false,
        }}
      />
    );
  }

  return (
    <Container
      maxWidth="lg"
      sx={{
        py: { xs: 2, sm: 3, md: 4 },
        px: { xs: 0, sm: 3 },
        minHeight: "calc(100vh - 200px)",
      }}
    >
      {/* Page Header */}
      <Box
        sx={{
          display: "flex",
          flexDirection: "row",
          mb: { xs: 2, md: 4 },
        }}
      >
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "flex-start",
            ml: "2%",
          }}
        >
          <Box sx={{ display: "flex", flexDirection: "row", gap: 0.5 }}>
            <ShoppingBag
              sx={{
                fontSize: { xs: 28, sm: 32, md: 36 },
                color: "primary.main",
                my: "auto",
              }}
              aria-hidden="true"
            />
            <Typography
              variant="h4"
              component="h1"
              sx={{
                fontWeight: 700,
                fontSize: { xs: "1.5rem", sm: "2rem", md: "2.125rem" },
              }}
            >
              My Purchases
            </Typography>
          </Box>

          <Typography
            variant="body1"
            color="text.secondary"
            sx={{ fontSize: { xs: "0.875rem", sm: "1rem" } }}
          >
            View and manage your order history
          </Typography>
        </Box>
        {/* Order Count */}
        {!isLoading && orders.length > 0 && (
          <Box sx={{ ml: "auto", mr: "2%", my: "auto" }}>
            <Chip
              label={`${pagination.total || orders.length} ${
                (pagination.total || orders.length) === 1 ? "Order" : "Orders"
              }`}
              color="primary"
              variant="outlined"
              sx={{
                fontWeight: "bold",
                px: 1.5,
                py: 2.5,
                fontSize: { xs: "0.875rem", sm: "1rem" },
                borderWidth: 2.5,
              }}
            />
          </Box>
        )}
      </Box>

      {/* Main Content */}
      <Box component="section" aria-label="My purchases">
        {/* Empty State */}
        {!isLoading && orders.length === 0 && (
          <EmptyOrderState
            role="buyer"
            hasFilters={!!(filters.status || filters.paymentStatus)}
            onReset={resetFilters}
          />
        )}

        {/* Orders List */}
        {!isLoading && orders.length > 0 && (
          <Paper
            elevation={0}
            sx={{
              border: { xs: 0, sm: 1 },
              borderColor: "divider",
              borderRadius: { xs: 0, sm: 2 },
              overflow: "hidden",
            }}
          >
            <List
              component="nav"
              aria-label="List of purchase orders"
              sx={{ p: 0 }}
            >
              {orders.map((order) => (
                <OrderListItem
                  key={order._id}
                  order={order}
                  orderRole="buyer"
                  onViewDetails={handleViewDetails}
                  onCancel={handleCancelOrder}
                />
              ))}
            </List>
          </Paper>
        )}

        {/* Pagination */}
        {pagination.pages > 1 && (
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              mt: { xs: 3, sm: 4 },
              px: { xs: 2, sm: 0 },
            }}
          >
            <Stack spacing={2} alignItems="center">
              <Pagination
                count={pagination.pages}
                page={pagination.currentPage || 1}
                onChange={handlePageChange}
                color="primary"
                size={window.innerWidth < 600 ? "small" : "medium"}
                showFirstButton
                showLastButton
                aria-label="Order pagination"
              />
              <Typography variant="caption" color="text.secondary">
                Showing page {pagination.currentPage || 1} of {pagination.pages}
              </Typography>
            </Stack>
          </Box>
        )}
      </Box>

      {/* Order Detail Modal */}
      <OrderDetailModal
        open={detailModalOpen}
        onClose={handleCloseDetailModal}
        order={selectedOrder}
        userRole="buyer"
        onCancel={handleCancelOrder}
      />

      {/* Cancel Order Dialog with Reason Input */}
      <CancelOrderDialog
        open={Boolean(cancelConfirm)}
        onClose={handleCloseCancelDialog}
        onConfirm={confirmCancel}
        order={cancelConfirm}
        loading={isCancelling}
      />

      {/* Snackbar Notifications */}
      <SnackbarContainer snackbars={snackbars} onClose={hideSnackbar} />
    </Container>
  );
}

export default PurchasesPage;
