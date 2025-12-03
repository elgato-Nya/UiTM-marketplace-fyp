import React, { useEffect, useState } from "react";
import {
  Container,
  Box,
  Typography,
  Grid,
  Paper,
  Divider,
  Alert,
  Breadcrumbs,
  Link,
  Chip,
  Button,
  Card,
  CardContent,
  Table,
  TableBody,
  TableRow,
  TableCell,
  Avatar,
  IconButton,
  Tooltip,
} from "@mui/material";
import {
  ShoppingBag,
  Person,
  LocationOn,
  Payment,
  LocalShipping,
  Receipt,
  Cancel,
  Edit,
} from "@mui/icons-material";
import { useParams, useNavigate, Link as RouterLink } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";

import { useAuth } from "../../features/auth/hooks/useAuth";
import { useSnackbar } from "../../hooks/useSnackbar";
import { useTheme } from "../../hooks/useTheme";
import { ROUTES } from "../../constants/routes";
import DynamicSkeleton from "../../components/ui/Skeleton/DynamicSkeleton";
import SnackbarContainer from "../../components/ui/SnackbarContainer";
import ConfirmDialog from "../../components/common/Dialog/ConfirmDialog";
import { BackButton } from "../../components/common/Navigation";

// Order components
import OrderStatusBadge from "../../features/orders/components/OrderStatusBadge";
import OrderTimeline from "../../features/orders/components/OrderTimeline";

// Store & Utils
import { fetchOrderById } from "../../features/orders/store/orderSlice";
import { useOrderActions } from "../../features/orders/hooks/useOrderActions";
import {
  formatOrderDate,
  formatCurrency,
  calculateOrderSummary,
  canCancelOrder,
  canUpdateStatus,
} from "../../features/orders/utils/orderHelper";
import {
  ORDER_STATUS,
  PAYMENT_METHOD,
  DELIVERY_METHOD,
} from "../../constants/orderConstant";

/**
 * OrderDetailPage Component
 * Shows comprehensive order details including:
 * - Order info and status
 * - Items list
 * - Buyer/Seller information
 * - Delivery address
 * - Payment details
 * - Status timeline
 * - Action buttons
 */
function OrderDetailPage() {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { theme } = useTheme();
  const { user } = useAuth();
  const {
    snackbars,
    hideSnackbar,
    success: showSuccess,
    error: showError,
  } = useSnackbar();

  // Redux state
  const { currentOrder, isLoading, error } = useSelector(
    (state) => state.orders
  );

  // Local state
  const [cancelConfirm, setCancelConfirm] = useState(null);
  const [updateConfirm, setUpdateConfirm] = useState(null);

  // Custom hooks
  const { cancelOrder, updateOrderStatus } = useOrderActions();

  /**
   * Load order on mount
   */
  useEffect(() => {
    if (orderId) {
      dispatch(fetchOrderById({ orderId, params: {} }));
    }
  }, [orderId, dispatch]);

  /**
   * Determine user's role in this order
   */
  const getUserRole = () => {
    if (!currentOrder || !user) return null;
    return currentOrder.buyer._id === user._id ? "buyer" : "seller";
  };

  const userRole = getUserRole();

  /**
   * Handle cancel order
   */
  const handleCancelOrder = (order) => {
    setCancelConfirm(order);
  };

  const confirmCancel = async () => {
    if (cancelConfirm) {
      try {
        const result = await cancelOrder(cancelConfirm._id);
        if (result.error) {
          throw result.error;
        }
        showSuccess("Order cancelled successfully");
        dispatch(fetchOrderById({ orderId: cancelConfirm._id, params: {} }));
        setCancelConfirm(null);
      } catch (err) {
        showError(err.message || "Failed to cancel order");
        setCancelConfirm(null);
      }
    }
  };

  /**
   * Handle update status
   */
  const handleUpdateStatus = (order) => {
    setUpdateConfirm(order);
  };

  const confirmUpdate = async () => {
    if (updateConfirm) {
      try {
        const result = await updateOrderStatus(updateConfirm._id, "confirmed");
        if (result.error) {
          throw result.error;
        }
        showSuccess("Order status updated successfully");
        dispatch(fetchOrderById({ orderId: updateConfirm._id, params: {} }));
        setUpdateConfirm(null);
      } catch (err) {
        showError(err.message || "Failed to update order status");
        setUpdateConfirm(null);
      }
    }
  };

  /**
   * Calculate order summary
   */
  const orderSummary = currentOrder
    ? calculateOrderSummary(currentOrder)
    : null;

  /**
   * Loading State
   */
  if (isLoading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <DynamicSkeleton type="page" showHeader showSidebar={false} />
      </Container>
    );
  }

  /**
   * Error State
   */
  if (error) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error">{error}</Alert>
        <BackButton sx={{ mt: 2 }} />
      </Container>
    );
  }

  /**
   * Not Found State
   */
  if (!currentOrder) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert
          severity="warning"
          action={
            <Button
              color="inherit"
              size="small"
              onClick={() => navigate(ROUTES.ORDERS.PURCHASES)}
            >
              View Orders
            </Button>
          }
        >
          Order not found
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box component="article" aria-label="Order details page">
        {/* Breadcrumbs */}
        <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 2 }}>
          <Link
            component={RouterLink}
            to={userRole === "buyer" ? "/orders/purchases" : "/orders/sales"}
            underline="hover"
            color="inherit"
          >
            {userRole === "buyer" ? "My Purchases" : "My Sales"}
          </Link>
          <Typography color="text.primary">
            Order #{currentOrder.orderNumber}
          </Typography>
        </Breadcrumbs>

        {/* Header */}
        <Box
          sx={{
            mb: 4,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            gap: 2,
            flexWrap: "wrap",
          }}
        >
          <Box>
            <BackButton sx={{ mb: 2 }} />
            <Typography
              variant="h4"
              component="h1"
              gutterBottom
              fontWeight={600}
            >
              Order #{currentOrder.orderNumber}
            </Typography>
            <Box
              sx={{
                display: "flex",
                gap: 2,
                alignItems: "center",
                flexWrap: "wrap",
              }}
            >
              <OrderStatusBadge status={currentOrder.status} size="medium" />
              <Typography variant="body2" color="text.secondary">
                Placed on {formatOrderDate(currentOrder.createdAt, "PPp")}
              </Typography>
            </Box>
          </Box>

          {/* Action Buttons */}
          <Box
            sx={{ display: "flex", gap: 1 }}
            role="group"
            aria-label="Order actions"
          >
            {canUpdateStatus(currentOrder, userRole) && (
              <Tooltip title="Update status" arrow>
                <IconButton
                  onClick={() => handleUpdateStatus(currentOrder)}
                  sx={{
                    color: "text.secondary",
                    "&:hover": {
                      color: theme.palette.primary.main,
                      backgroundColor: theme.palette.primary.main + "10",
                    },
                  }}
                  aria-label="Update order status"
                >
                  <Edit />
                </IconButton>
              </Tooltip>
            )}
            {canCancelOrder(currentOrder) && (
              <Tooltip title="Cancel order" arrow>
                <IconButton
                  onClick={() => handleCancelOrder(currentOrder)}
                  sx={{
                    color: "text.secondary",
                    "&:hover": {
                      color: theme.palette.error.main,
                      backgroundColor: theme.palette.error.main + "10",
                    },
                  }}
                  aria-label="Cancel order"
                >
                  <Cancel />
                </IconButton>
              </Tooltip>
            )}
          </Box>
        </Box>

        {/* Main Content Grid */}
        <Grid container spacing={3}>
          {/* Left Column - Order Details */}
          <Grid sizes={{ xs: 12, md: 8 }}>
            {/* Items List */}
            <Paper
              elevation={0}
              sx={{ p: 3, mb: 3, border: 1, borderColor: "divider" }}
            >
              <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                <ShoppingBag sx={{ mr: 1, color: "primary.main" }} />
                <Typography variant="h6" fontWeight={600}>
                  Order Items
                </Typography>
              </Box>
              <Divider sx={{ mb: 2 }} />

              {currentOrder.items.map((item, index) => (
                <Box key={index}>
                  <Box sx={{ display: "flex", gap: 2, py: 2 }}>
                    {/* Product Image */}
                    <Avatar
                      src={
                        item.listing?.images?.[0] || "/placeholder-image.png"
                      }
                      alt={item.listing?.title}
                      variant="rounded"
                      sx={{ width: 80, height: 80 }}
                    />

                    {/* Product Details */}
                    <Box sx={{ flexGrow: 1 }}>
                      <Typography variant="subtitle1" fontWeight={500}>
                        {item.listing?.title || "Product"}
                      </Typography>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ mt: 0.5 }}
                      >
                        Quantity: {item.quantity}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Price: {formatCurrency(item.price)}
                      </Typography>
                    </Box>

                    {/* Item Total */}
                    <Box sx={{ textAlign: "right" }}>
                      <Typography variant="subtitle1" fontWeight={600}>
                        {formatCurrency(item.price * item.quantity)}
                      </Typography>
                    </Box>
                  </Box>
                  {index < currentOrder.items.length - 1 && <Divider />}
                </Box>
              ))}
            </Paper>

            {/* Status Timeline */}
            <Paper
              elevation={0}
              sx={{ p: 3, border: 1, borderColor: "divider" }}
            >
              <Typography variant="h6" fontWeight={600} gutterBottom>
                Order Timeline
              </Typography>
              <Divider sx={{ mb: 3 }} />
              <OrderTimeline
                statusHistory={currentOrder.statusHistory}
                currentStatus={currentOrder.status}
                orientation="vertical"
              />
            </Paper>
          </Grid>

          {/* Right Column - Additional Info */}
          <Grid size={{ xs: 12, md: 4 }}>
            {/* Order Summary */}
            <Card
              elevation={0}
              sx={{ mb: 3, border: 1, borderColor: "divider" }}
            >
              <CardContent>
                <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                  <Receipt sx={{ mr: 1, color: "primary.main" }} />
                  <Typography variant="h6" fontWeight={600}>
                    Order Summary
                  </Typography>
                </Box>
                <Divider sx={{ mb: 2 }} />

                <Table size="small">
                  <TableBody>
                    <TableRow>
                      <TableCell>Subtotal</TableCell>
                      <TableCell align="right">
                        {formatCurrency(orderSummary?.subtotal || 0)}
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Delivery Fee</TableCell>
                      <TableCell align="right">
                        {formatCurrency(currentOrder.deliveryFee || 0)}
                      </TableCell>
                    </TableRow>
                    {currentOrder.tax > 0 && (
                      <TableRow>
                        <TableCell>Tax</TableCell>
                        <TableCell align="right">
                          {formatCurrency(currentOrder.tax)}
                        </TableCell>
                      </TableRow>
                    )}
                    <TableRow>
                      <TableCell>
                        <strong>Total</strong>
                      </TableCell>
                      <TableCell align="right">
                        <Typography
                          variant="h6"
                          color="primary"
                          fontWeight={600}
                        >
                          {formatCurrency(currentOrder.totalAmount)}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            {/* Buyer/Seller Info */}
            <Card
              elevation={0}
              sx={{ mb: 3, border: 1, borderColor: "divider" }}
            >
              <CardContent>
                <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                  <Person sx={{ mr: 1, color: "primary.main" }} />
                  <Typography variant="h6" fontWeight={600}>
                    {userRole === "buyer" ? "Seller" : "Buyer"} Information
                  </Typography>
                </Box>
                <Divider sx={{ mb: 2 }} />

                {userRole === "buyer" ? (
                  <>
                    <Typography variant="body2" gutterBottom>
                      <strong>Name:</strong> {currentOrder.seller?.name}
                    </Typography>
                    <Typography variant="body2">
                      <strong>Email:</strong> {currentOrder.seller?.email}
                    </Typography>
                  </>
                ) : (
                  <>
                    <Typography variant="body2" gutterBottom>
                      <strong>Name:</strong> {currentOrder.buyer?.name}
                    </Typography>
                    <Typography variant="body2">
                      <strong>Email:</strong> {currentOrder.buyer?.email}
                    </Typography>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Delivery Address */}
            <Card
              elevation={0}
              sx={{ mb: 3, border: 1, borderColor: "divider" }}
            >
              <CardContent>
                <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                  <LocationOn sx={{ mr: 1, color: "primary.main" }} />
                  <Typography variant="h6" fontWeight={600}>
                    Delivery Address
                  </Typography>
                </Box>
                <Divider sx={{ mb: 2 }} />

                <Typography variant="body2" gutterBottom>
                  {currentOrder.deliveryAddress?.fullName}
                </Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  {currentOrder.deliveryAddress?.addressLine1}
                </Typography>
                {currentOrder.deliveryAddress?.addressLine2 && (
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    gutterBottom
                  >
                    {currentOrder.deliveryAddress.addressLine2}
                  </Typography>
                )}
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  {currentOrder.deliveryAddress?.city},{" "}
                  {currentOrder.deliveryAddress?.state}{" "}
                  {currentOrder.deliveryAddress?.postalCode}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {currentOrder.deliveryAddress?.country}
                </Typography>
                {currentOrder.deliveryAddress?.phone && (
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mt: 1 }}
                  >
                    <strong>Phone:</strong> {currentOrder.deliveryAddress.phone}
                  </Typography>
                )}
              </CardContent>
            </Card>

            {/* Payment & Delivery Info */}
            <Card elevation={0} sx={{ border: 1, borderColor: "divider" }}>
              <CardContent>
                <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                  <Payment sx={{ mr: 1, color: "primary.main" }} />
                  <Typography variant="h6" fontWeight={600}>
                    Payment & Delivery
                  </Typography>
                </Box>
                <Divider sx={{ mb: 2 }} />

                <Typography variant="body2" gutterBottom>
                  <strong>Payment Method:</strong>{" "}
                  {PAYMENT_METHOD[currentOrder.paymentMethod] ||
                    currentOrder.paymentMethod}
                </Typography>
                <Typography variant="body2" gutterBottom>
                  <strong>Payment Status:</strong>{" "}
                  <Chip
                    label={currentOrder.paymentStatus}
                    size="small"
                    color={
                      currentOrder.paymentStatus === "paid"
                        ? "success"
                        : "warning"
                    }
                  />
                </Typography>
                <Typography variant="body2" gutterBottom>
                  <strong>Delivery Method:</strong>{" "}
                  {DELIVERY_METHOD[currentOrder.deliveryMethod] ||
                    currentOrder.deliveryMethod}
                </Typography>
                {currentOrder.trackingNumber && (
                  <Typography variant="body2" sx={{ mt: 1 }}>
                    <strong>Tracking Number:</strong>{" "}
                    {currentOrder.trackingNumber}
                  </Typography>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Cancel Order Confirmation */}
        <ConfirmDialog
          open={Boolean(cancelConfirm)}
          onClose={() => setCancelConfirm(null)}
          onConfirm={confirmCancel}
          title="Cancel Order"
          content={`Are you sure you want to cancel order ${cancelConfirm?.orderNumber}? This action cannot be undone.`}
          confirmText="Cancel Order"
          confirmColor="error"
        />

        {/* Update Status Confirmation */}
        <ConfirmDialog
          open={Boolean(updateConfirm)}
          onClose={() => setUpdateConfirm(null)}
          onConfirm={confirmUpdate}
          title="Update Order Status"
          content={`Are you sure you want to update the status of order ${updateConfirm?.orderNumber}?`}
          confirmText="Update Status"
          confirmColor="primary"
        />

        {/* Snackbar Notifications */}
        <SnackbarContainer snackbars={snackbars} onClose={hideSnackbar} />
      </Box>
    </Container>
  );
}

export default OrderDetailPage;
