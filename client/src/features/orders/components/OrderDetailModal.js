import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Typography,
  Button,
  Divider,
  IconButton,
  Stack,
  useMediaQuery,
  Slide,
} from "@mui/material";
import { Close, Cancel, Edit } from "@mui/icons-material";
import { useTheme } from "../../../hooks/useTheme";
import OrderStatusBadge from "./OrderStatusBadge";
import ConfirmDialog from "../../../components/common/Dialog/ConfirmDialog";
import {
  formatOrderDate,
  calculateOrderSummary,
  canCancelOrder,
  canUpdateStatus,
} from "../utils/orderHelper";

// Import sub-components
import OrderItemsSection from "./OrderDetails/OrderItemsSection";
import OrderPartyInfoCard from "./OrderDetails/OrderPartyInfoCard";
import OrderAddressCard from "./OrderDetails/OrderAddressCard";
import OrderSummaryCard from "./OrderDetails/OrderSummaryCard";
import OrderPaymentDeliveryCard from "./OrderDetails/OrderPaymentDeliveryCard";
import OrderTimelineSection from "./OrderDetails/OrderTimelineSection";

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

/**
 * OrderDetailModal Component
 *
 * PURPOSE: Display comprehensive order details in an accessible modal dialog
 * FEATURES:
 * - Full-screen on mobile for better UX
 * - Semantic HTML with proper ARIA attributes
 * - Keyboard navigation support
 * - Complete order information display
 * - Action buttons for cancel/update
 * - Responsive layout
 *
 * @param {boolean} open - Dialog open state
 * @param {function} onClose - Callback to close modal
 * @param {Object} order - Order data object
 * @param {string} userRole - 'buyer' or 'seller'
 * @param {function} onCancel - Optional callback for canceling order
 * @param {function} onUpdateStatus - Optional callback for updating status
 */
function OrderDetailModal({
  open,
  onClose,
  order,
  userRole = "buyer",
  onCancel,
  onUpdateStatus,
}) {
  const { theme } = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const [updateConfirm, setUpdateConfirm] = useState(false);

  if (!order) return null;

  const isBuyer = userRole === "buyer";
  const otherParty = isBuyer ? order.seller : order.buyer;
  const canCancel = canCancelOrder(order, userRole);
  const canUpdate = canUpdateStatus(order, userRole);
  const orderSummary = calculateOrderSummary(order);

  const handleCancelClick = () => {
    // Call parent's onCancel which will open CancelOrderDialog
    if (onCancel) {
      onCancel(order);
    }
  };

  const handleUpdateClick = () => {
    setUpdateConfirm(true);
  };

  const handleConfirmUpdate = () => {
    setUpdateConfirm(false);
    if (onUpdateStatus) {
      onUpdateStatus(order);
    }
    onClose();
  };

  return (
    <>
      <Dialog
        open={open}
        onClose={onClose}
        TransitionComponent={Transition}
        fullScreen={isMobile}
        maxWidth="md"
        fullWidth
        aria-labelledby="order-detail-dialog-title"
        aria-describedby="order-detail-dialog-description"
        sx={{
          "& .MuiDialog-paper": {
            borderRadius: isMobile ? 0 : 2,
          },
        }}
      >
        {/* Header */}
        <DialogTitle
          id="order-detail-dialog-title"
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            pb: 2,
            borderBottom: 1,
            borderColor: "divider",
          }}
        >
          <Box>
            <Typography variant="h5" component="h2" fontWeight={600}>
              Order #{order.orderNumber}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              Placed on {formatOrderDate(order.createdAt, "PPp")}
            </Typography>
          </Box>
          <IconButton
            aria-label="Close dialog"
            onClick={onClose}
            sx={{
              color: "text.secondary",
              "&:hover": {
                color: "text.primary",
                backgroundColor: "action.hover",
              },
            }}
          >
            <Close />
          </IconButton>
        </DialogTitle>

        {/* Content */}
        <DialogContent
          id="order-detail-dialog-description"
          sx={{
            p: { xs: 2, sm: 3 },
            overflowY: "auto",
          }}
        >
          {/* Status Badge */}
          <Box sx={{ mb: 3, display: "flex", alignItems: "center", gap: 2 }}>
            <OrderStatusBadge status={order.status} size="medium" />
            {canUpdate && (
              <Button
                size="small"
                startIcon={<Edit />}
                onClick={handleUpdateClick}
                variant="outlined"
                color="primary"
              >
                Update Status
              </Button>
            )}
            {canCancel && (
              <Button
                size="small"
                startIcon={<Cancel />}
                onClick={handleCancelClick}
                variant="outlined"
                color="error"
              >
                Cancel Order
              </Button>
            )}
          </Box>

          <Divider sx={{ mb: 3 }} />

          {/* Order Items */}
          <OrderItemsSection items={order.items || []} />

          {/* Two Column Layout for Additional Info */}
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
              gap: 3,
            }}
          >
            {/* Left Column */}
            <Stack spacing={3}>
              <OrderPartyInfoCard
                party={otherParty}
                partyType={isBuyer ? "Seller" : "Buyer"}
              />
              <OrderAddressCard address={order.deliveryAddress} />
            </Stack>

            {/* Right Column */}
            <Stack spacing={3}>
              <OrderSummaryCard orderSummary={orderSummary} order={order} />
              <OrderPaymentDeliveryCard order={order} />
            </Stack>
          </Box>

          {/* Order Timeline */}
          <OrderTimelineSection
            statusHistory={order.statusHistory}
            currentStatus={order.status}
          />
        </DialogContent>

        {/* Footer Actions */}
        <DialogActions
          sx={{
            p: { xs: 2, sm: 3 },
            borderTop: 1,
            borderColor: "divider",
            gap: 1,
          }}
        >
          <Button onClick={onClose} variant="outlined" color="inherit">
            Close
          </Button>
        </DialogActions>
      </Dialog>

      {/* Update Status Confirmation Dialog */}
      <ConfirmDialog
        open={updateConfirm}
        onClose={() => setUpdateConfirm(false)}
        onConfirm={handleConfirmUpdate}
        title="Update Order Status"
        content={`Are you sure you want to update the status of order ${order.orderNumber}?`}
        confirmText="Update Status"
        confirmColor="primary"
      />
    </>
  );
}

export default OrderDetailModal;
