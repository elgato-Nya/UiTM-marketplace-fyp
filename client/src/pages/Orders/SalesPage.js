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
import { Storefront } from "@mui/icons-material";

import { useAuth } from "../../features/auth/hooks/useAuth";
import { useSnackbar } from "../../hooks/useSnackbar";
import DynamicSkeleton from "../../components/ui/Skeleton/DynamicSkeleton";
import SnackbarContainer from "../../components/ui/SnackbarContainer";

import OrderListItem from "../../features/orders/components/OrderListItem";
import OrderDetailModal from "../../features/orders/components/OrderDetailModal";
import EmptyOrderState from "../../features/orders/components/EmptyOrderState";
import UpdateOrderStatusDialog from "../../features/orders/components/UpdateOrderStatusDialog";
import OrderStatusFilter from "../../features/orders/components/OrderStatusFilter";

import { useOrders } from "../../features/orders/hooks/useOrders";
import { useOrderActions } from "../../features/orders/hooks/useOrderActions";

function SalesPage() {
  const { isAuthenticated } = useAuth();
  const [searchParams] = useSearchParams(); // Removed unused setSearchParams

  const {
    orders,
    isLoading,
    pagination,
    filters,
    loadOrders,
    updateFilters,
    resetFilters,
    changePage,
  } = useOrders("seller");

  const { updateOrderStatus } = useOrderActions();

  const {
    snackbars,
    hideSnackbar,
    success: showSuccess,
    error: showError,
  } = useSnackbar();

  const [updateDialogOpen, setUpdateDialogOpen] = useState(false);
  const [orderToUpdate, setOrderToUpdate] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [statusCounts, setStatusCounts] = useState({});

  useEffect(() => {
    if (isAuthenticated) {
      loadOrders();
    }
  }, [isAuthenticated, loadOrders]); // Added missing dependencies

  useEffect(() => {
    const statusParam = searchParams.get("status");
    if (statusParam && statusParam !== filters.status) {
      updateFilters({ ...filters, status: statusParam });
    }
  }, [searchParams, filters, updateFilters]); // Added missing dependencies

  // Calculate status counts from loaded orders
  useEffect(() => {
    if (orders && orders.length > 0) {
      const counts = orders.reduce((acc, order) => {
        const status = order.status || "pending";
        acc[status] = (acc[status] || 0) + 1;
        return acc;
      }, {});
      // Add "all" count
      counts[""] = orders.length;
      setStatusCounts(counts);
    } else {
      setStatusCounts({});
    }
  }, [orders]);

  const handleViewDetails = (order) => {
    setSelectedOrder(order);
    setDetailModalOpen(true);
  };

  const handleCloseDetailModal = () => {
    setDetailModalOpen(false);
    setSelectedOrder(null);
  };

  const handleUpdateStatus = (order) => {
    setOrderToUpdate(order);
    setUpdateDialogOpen(true);
  };

  const handleCloseUpdateDialog = () => {
    if (!isUpdating) {
      setUpdateDialogOpen(false);
      setOrderToUpdate(null);
    }
  };

  const handleConfirmUpdate = async (orderId, newStatus, notes) => {
    setIsUpdating(true);
    try {
      const result = await updateOrderStatus(orderId, newStatus, notes);
      if (result.error) {
        throw new Error(result.error);
      }
      showSuccess(`Order status updated to ${newStatus} successfully`);
      loadOrders();
      setUpdateDialogOpen(false);
      setOrderToUpdate(null);
      // Close detail modal if open
      if (detailModalOpen && selectedOrder?._id === orderId) {
        handleCloseDetailModal();
      }
    } catch (err) {
      showError(err.message || "Failed to update order status");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleStatusFilterChange = (newStatus) => {
    updateFilters({ ...filters, status: newStatus || undefined });
    // Update URL params
    if (newStatus) {
      setSearchParams({ status: newStatus });
    } else {
      setSearchParams({});
    }
  };

  const handlePageChange = (event, page) => {
    changePage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (!isAuthenticated) {
    return (
      <DynamicSkeleton
        type="page"
        config={{
          contentType: "table",
          showHeader: false,
          showSidebar: false,
        }}
      />
    );
  }

  if (isLoading && !orders.length) {
    return (
      <DynamicSkeleton
        type="page"
        config={{
          contentType: "table",
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
      component="main"
    >
      {/* Page Header */}
      <Box
        sx={{
          mb: { xs: 2, sm: 3, md: 4 },
          px: { xs: 2, sm: 0 },
        }}
        component="header"
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 2,
            mb: 1,
          }}
        >
          <Storefront
            sx={{
              fontSize: { xs: 28, sm: 32, md: 36 },
              color: "primary.main",
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
            My Sales
          </Typography>
        </Box>
        <Typography
          variant="body1"
          color="text.secondary"
          sx={{ fontSize: { xs: "0.875rem", sm: "1rem" } }}
        >
          Manage your sales and orders
        </Typography>

        {/* Order Count */}
        {!isLoading && orders.length > 0 && (
          <Box sx={{ mt: 2 }}>
            <Chip
              label={`${pagination.total || orders.length} ${
                (pagination.total || orders.length) === 1 ? "Order" : "Orders"
              }`}
              color="primary"
              variant="outlined"
              size="small"
            />
          </Box>
        )}
      </Box>

      {/* Status Filter Tabs */}
      {!isLoading && pagination.total > 0 && (
        <Box sx={{ px: { xs: 2, sm: 0 } }}>
          <OrderStatusFilter
            currentStatus={filters.status || ""}
            onStatusChange={handleStatusFilterChange}
            statusCounts={statusCounts}
          />
        </Box>
      )}

      {/* Main Content */}
      <Box component="section" aria-label="My sales">
        {/* Empty State */}
        {!isLoading && orders.length === 0 && (
          <EmptyOrderState
            role="seller"
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
              aria-label="List of sales orders"
              sx={{ p: 0 }}
            >
              {orders.map((order) => (
                <OrderListItem
                  key={order._id}
                  order={order}
                  orderRole="seller"
                  onViewDetails={handleViewDetails}
                  onCancel={handleUpdateStatus}
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
        userRole="seller"
        onUpdateStatus={handleUpdateStatus}
      />

      {/* Update Status Dialog */}
      <UpdateOrderStatusDialog
        open={updateDialogOpen}
        onClose={handleCloseUpdateDialog}
        onConfirm={handleConfirmUpdate}
        order={orderToUpdate}
        loading={isUpdating}
      />

      <SnackbarContainer snackbars={snackbars} onClose={hideSnackbar} />
    </Container>
  );
}

export default SalesPage;
