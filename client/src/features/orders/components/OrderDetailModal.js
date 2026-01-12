import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  Box,
  Typography,
  Button,
  IconButton,
  Chip,
  Divider,
  Stack,
  useMediaQuery,
  Slide,
  Avatar,
  alpha,
} from "@mui/material";
import {
  Close,
  LocalShipping,
  Payment,
  Person,
  LocationOn,
  Phone,
  Email,
  ContentCopy,
  CheckCircle,
  Schedule,
  Receipt,
  ShoppingBag,
} from "@mui/icons-material";
import { useTheme } from "../../../hooks/useTheme";
import OrderStatusBadge from "./OrderStatusBadge";
import ConfirmDialog from "../../../components/common/Dialog/ConfirmDialog";
import {
  formatOrderDate,
  calculateOrderSummary,
  canCancelOrder,
  canUpdateStatus,
  formatCurrency,
  getDeliveryMethodLabel,
  getPaymentMethodLabel,
} from "../utils/orderHelper";

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

/**
 * OrderDetailModal - Enterprise-grade order details dialog
 * Clean, minimalist design optimized for both desktop and mobile
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
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const isSmall = useMediaQuery(theme.breakpoints.down("sm"));
  const [updateConfirm, setUpdateConfirm] = useState(false);
  const [copiedField, setCopiedField] = useState(null);

  if (!order) return null;

  const isBuyer = userRole === "buyer";
  const otherParty = isBuyer ? order.seller : order.buyer;
  const canCancel = canCancelOrder(order, userRole);
  const canUpdate = canUpdateStatus(order, userRole);
  const orderSummary = calculateOrderSummary(order);

  const handleCopyToClipboard = (text, field) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleCancelClick = () => {
    if (onCancel) onCancel(order);
  };

  const handleUpdateClick = () => setUpdateConfirm(true);

  const handleConfirmUpdate = () => {
    setUpdateConfirm(false);
    if (onUpdateStatus) onUpdateStatus(order);
    onClose();
  };

  const getPaymentStatusColor = (status) => {
    const colors = {
      paid: "success",
      pending: "warning",
      failed: "error",
      refunded: "info",
    };
    return colors[status] || "default";
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
        PaperProps={{
          sx: {
            borderRadius: isMobile ? 0 : 3,
            maxHeight: isMobile ? "100vh" : "90vh",
            m: isMobile ? 0 : 2,
          },
        }}
      >
        {/* Header */}
        <Box
          sx={{
            position: "sticky",
            top: 0,
            zIndex: 10,
            bgcolor: "background.paper",
            borderBottom: 1,
            borderColor: "divider",
          }}
        >
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              p: { xs: 2, sm: 2.5 },
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
              <Receipt sx={{ color: "primary.main", fontSize: 28 }} />
              <Box>
                <Typography
                  variant="h6"
                  fontWeight={700}
                  sx={{ fontSize: { xs: "1rem", sm: "1.15rem" } }}
                >
                  {order.orderNumber}
                </Typography>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ display: "flex", alignItems: "center", gap: 0.5 }}
                >
                  <Schedule sx={{ fontSize: 14 }} />
                  {formatOrderDate(order.createdAt, "PPp")}
                </Typography>
              </Box>
            </Box>
            <IconButton
              onClick={onClose}
              size="small"
              sx={{
                bgcolor: alpha(theme.palette.text.primary, 0.04),
                "&:hover": { bgcolor: alpha(theme.palette.text.primary, 0.08) },
              }}
            >
              <Close fontSize="small" />
            </IconButton>
          </Box>

          {/* Status Bar */}
          <Box
            sx={{
              px: { xs: 2, sm: 2.5 },
              pb: 2,
              display: "flex",
              alignItems: "center",
              flexWrap: "wrap",
              gap: 1,
            }}
          >
            <OrderStatusBadge status={order.status} size="small" />
            <Chip
              size="small"
              icon={<Payment sx={{ fontSize: "16px !important" }} />}
              label={order.paymentStatus}
              color={getPaymentStatusColor(order.paymentStatus)}
              variant="outlined"
              sx={{ textTransform: "capitalize", fontWeight: 500 }}
            />
          </Box>
        </Box>

        {/* Content */}
        <DialogContent
          sx={{ p: 0, bgcolor: alpha(theme.palette.divider, 0.02) }}
        >
          <Box sx={{ p: { xs: 2, sm: 2.5 } }}>
            {/* Order Items */}
            <SectionCard title="Items" icon={<ShoppingBag />} theme={theme}>
              <Stack spacing={0} divider={<Divider />}>
                {order.items?.map((item, idx) => (
                  <Box
                    key={idx}
                    sx={{
                      display: "flex",
                      gap: 2,
                      py: 1.5,
                      alignItems: "center",
                    }}
                  >
                    <Avatar
                      src={item.images?.[0]}
                      variant="rounded"
                      sx={{
                        width: { xs: 56, sm: 64 },
                        height: { xs: 56, sm: 64 },
                        bgcolor: "grey.100",
                        flexShrink: 0,
                      }}
                    >
                      {item.name?.[0]}
                    </Avatar>
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography
                        variant="body2"
                        fontWeight={600}
                        noWrap
                        sx={{ mb: 0.25 }}
                      >
                        {item.name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {formatCurrency(item.price)} × {item.quantity}
                      </Typography>
                      {item.variantSnapshot && (
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          display="block"
                        >
                          {item.variantSnapshot.name}
                        </Typography>
                      )}
                    </Box>
                    <Typography
                      variant="body2"
                      fontWeight={600}
                      sx={{ flexShrink: 0 }}
                    >
                      {formatCurrency(item.price * item.quantity)}
                    </Typography>
                  </Box>
                ))}
              </Stack>
            </SectionCard>

            {/* Two Column Layout */}
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
                gap: 2,
                mt: 2,
              }}
            >
              {/* Left Column */}
              <Stack spacing={2}>
                {/* Contact Info */}
                <SectionCard
                  title={isBuyer ? "Seller" : "Buyer"}
                  icon={<Person />}
                  theme={theme}
                >
                  <Stack spacing={1.5}>
                    <Box
                      sx={{ display: "flex", alignItems: "center", gap: 1.5 }}
                    >
                      <Avatar
                        sx={{
                          width: 40,
                          height: 40,
                          bgcolor: "primary.main",
                          fontSize: 16,
                        }}
                      >
                        {(otherParty?.name ||
                          otherParty?.username)?.[0]?.toUpperCase()}
                      </Avatar>
                      <Box>
                        <Typography variant="body2" fontWeight={600}>
                          {otherParty?.name || otherParty?.username}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {isBuyer ? "Merchant" : "Customer"}
                        </Typography>
                      </Box>
                    </Box>
                    <InfoRow
                      icon={<Email sx={{ fontSize: 16 }} />}
                      label={otherParty?.email}
                      copyable
                      onCopy={() =>
                        handleCopyToClipboard(otherParty?.email, "email")
                      }
                      copied={copiedField === "email"}
                    />
                    {otherParty?.phone && (
                      <InfoRow
                        icon={<Phone sx={{ fontSize: 16 }} />}
                        label={otherParty?.phone}
                        copyable
                        onCopy={() =>
                          handleCopyToClipboard(otherParty?.phone, "phone")
                        }
                        copied={copiedField === "phone"}
                      />
                    )}
                  </Stack>
                </SectionCard>

                {/* Delivery Address */}
                {order.deliveryAddress && (
                  <SectionCard
                    title="Delivery"
                    icon={<LocationOn />}
                    theme={theme}
                  >
                    <Stack spacing={1}>
                      <Box
                        sx={{ display: "flex", alignItems: "center", gap: 1 }}
                      >
                        <LocalShipping
                          sx={{ fontSize: 18, color: "text.secondary" }}
                        />
                        <Typography variant="body2" fontWeight={500}>
                          {getDeliveryMethodLabel(order.deliveryMethod)}
                        </Typography>
                      </Box>
                      <Divider sx={{ my: 0.5 }} />
                      <Typography variant="body2" fontWeight={600}>
                        {order.deliveryAddress.recipientName}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {order.deliveryAddress.recipientPhone}
                      </Typography>
                      <AddressDisplay address={order.deliveryAddress} />
                    </Stack>
                  </SectionCard>
                )}
              </Stack>

              {/* Right Column */}
              <Stack spacing={2}>
                {/* Payment Summary */}
                <SectionCard title="Summary" icon={<Receipt />} theme={theme}>
                  <Stack spacing={1}>
                    <SummaryRow
                      label="Subtotal"
                      value={orderSummary?.subtotal}
                    />
                    <SummaryRow
                      label="Delivery"
                      value={order.shippingFee || order.deliveryFee}
                    />
                    {order.totalDiscount > 0 && (
                      <SummaryRow
                        label="Discount"
                        value={-order.totalDiscount}
                        isDiscount
                      />
                    )}
                    <Divider sx={{ my: 1 }} />
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <Typography variant="body2" fontWeight={700}>
                        Total
                      </Typography>
                      <Typography
                        variant="h6"
                        color="primary.main"
                        fontWeight={700}
                      >
                        {formatCurrency(order.totalAmount)}
                      </Typography>
                    </Box>
                  </Stack>
                </SectionCard>

                {/* Payment Details */}
                <SectionCard title="Payment" icon={<Payment />} theme={theme}>
                  <Stack spacing={1.5}>
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <Typography variant="caption" color="text.secondary">
                        Method
                      </Typography>
                      <Typography variant="body2" fontWeight={500}>
                        {getPaymentMethodLabel(order.paymentMethod)}
                      </Typography>
                    </Box>
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <Typography variant="caption" color="text.secondary">
                        Status
                      </Typography>
                      <Chip
                        size="small"
                        label={order.paymentStatus}
                        color={getPaymentStatusColor(order.paymentStatus)}
                        sx={{
                          textTransform: "capitalize",
                          fontWeight: 600,
                          height: 24,
                        }}
                      />
                    </Box>
                    {order.paymentDetails?.transactionId && (
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                        }}
                      >
                        <Typography variant="caption" color="text.secondary">
                          Transaction
                        </Typography>
                        <Typography
                          variant="caption"
                          sx={{ fontFamily: "monospace", fontSize: 11 }}
                        >
                          {order.paymentDetails.transactionId.slice(0, 16)}...
                        </Typography>
                      </Box>
                    )}
                    {order.paymentDetails?.paidAt && (
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                        }}
                      >
                        <Typography variant="caption" color="text.secondary">
                          Paid At
                        </Typography>
                        <Typography variant="caption">
                          {formatOrderDate(order.paymentDetails.paidAt, "PPp")}
                        </Typography>
                      </Box>
                    )}
                  </Stack>
                </SectionCard>
              </Stack>
            </Box>

            {/* Timeline */}
            {order.statusHistory?.length > 0 && (
              <Box sx={{ mt: 2 }}>
                <SectionCard title="Timeline" icon={<Schedule />} theme={theme}>
                  <Stack spacing={0}>
                    {order.statusHistory.map((entry, idx) => (
                      <TimelineEntry
                        key={idx}
                        entry={entry}
                        isLast={idx === order.statusHistory.length - 1}
                        isCurrent={entry.status === order.status}
                        theme={theme}
                      />
                    ))}
                  </Stack>
                </SectionCard>
              </Box>
            )}
          </Box>
        </DialogContent>

        {/* Footer Actions */}
        <Box
          sx={{
            position: "sticky",
            bottom: 0,
            bgcolor: "background.paper",
            borderTop: 1,
            borderColor: "divider",
            p: { xs: 2, sm: 2.5 },
            display: "flex",
            gap: 1.5,
            flexDirection: { xs: "column", sm: "row" },
            justifyContent: "flex-end",
          }}
        >
          {canCancel && (
            <Button
              variant="outlined"
              color="error"
              onClick={handleCancelClick}
              size={isSmall ? "medium" : "large"}
              fullWidth={isSmall}
            >
              Cancel Order
            </Button>
          )}
          {canUpdate && (
            <Button
              variant="contained"
              color="primary"
              onClick={handleUpdateClick}
              size={isSmall ? "medium" : "large"}
              fullWidth={isSmall}
            >
              Update Status
            </Button>
          )}
          <Button
            variant="outlined"
            onClick={onClose}
            size={isSmall ? "medium" : "large"}
            fullWidth={isSmall}
            sx={{ order: { xs: -1, sm: 0 } }}
          >
            Close
          </Button>
        </Box>
      </Dialog>

      <ConfirmDialog
        open={updateConfirm}
        onClose={() => setUpdateConfirm(false)}
        onConfirm={handleConfirmUpdate}
        title="Update Order Status"
        content={`Update status for order ${order.orderNumber}?`}
        confirmText="Update"
        confirmColor="primary"
      />
    </>
  );
}

// Sub-components
const SectionCard = ({ title, icon, children, theme }) => (
  <Box
    sx={{
      bgcolor: "background.paper",
      borderRadius: 2,
      border: 1,
      borderColor: "divider",
      overflow: "hidden",
    }}
  >
    <Box
      sx={{
        px: 2,
        py: 1.5,
        bgcolor: alpha(theme.palette.divider, 0.03),
        borderBottom: 1,
        borderColor: "divider",
        display: "flex",
        alignItems: "center",
        gap: 1,
      }}
    >
      {React.cloneElement(icon, {
        sx: { fontSize: 18, color: "primary.main" },
      })}
      <Typography variant="subtitle2" fontWeight={600}>
        {title}
      </Typography>
    </Box>
    <Box sx={{ p: 2 }}>{children}</Box>
  </Box>
);

const InfoRow = ({ icon, label, copyable, onCopy, copied }) => (
  <Box
    sx={{
      display: "flex",
      alignItems: "center",
      gap: 1,
      color: "text.secondary",
    }}
  >
    {icon}
    <Typography variant="body2" sx={{ flex: 1 }}>
      {label}
    </Typography>
    {copyable && (
      <IconButton size="small" onClick={onCopy} sx={{ p: 0.5 }}>
        {copied ? (
          <CheckCircle sx={{ fontSize: 16, color: "success.main" }} />
        ) : (
          <ContentCopy sx={{ fontSize: 14 }} />
        )}
      </IconButton>
    )}
  </Box>
);

const SummaryRow = ({ label, value, isDiscount }) => (
  <Box sx={{ display: "flex", justifyContent: "space-between" }}>
    <Typography variant="body2" color="text.secondary">
      {label}
    </Typography>
    <Typography
      variant="body2"
      fontWeight={500}
      color={isDiscount ? "success.main" : "text.primary"}
    >
      {isDiscount ? "-" : ""}
      {formatCurrency(Math.abs(value || 0))}
    </Typography>
  </Box>
);

const AddressDisplay = ({ address }) => {
  if (!address) return null;
  const isCampus = address.type === "campus";
  const addr = isCampus ? address.campusAddress : address.personalAddress;
  if (!addr) return null;

  return (
    <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>
      {isCampus ? (
        <>
          {addr.campus}
          <br />
          {addr.building}, Floor {addr.floor}, Room {addr.room}
        </>
      ) : (
        <>
          {addr.addressLine1}
          {addr.addressLine2 && (
            <>
              <br />
              {addr.addressLine2}
            </>
          )}
          <br />
          {addr.city}, {addr.state} {addr.postcode}
        </>
      )}
    </Typography>
  );
};

const TimelineEntry = ({ entry, isLast, isCurrent, theme }) => (
  <Box sx={{ display: "flex", gap: 2 }}>
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        width: 20,
      }}
    >
      <Box
        sx={{
          width: 10,
          height: 10,
          borderRadius: "50%",
          bgcolor: isCurrent ? "primary.main" : "grey.300",
          border: isCurrent ? 2 : 0,
          borderColor: alpha(theme.palette.primary.main, 0.3),
          flexShrink: 0,
          mt: 0.5,
        }}
      />
      {!isLast && (
        <Box sx={{ width: 2, flex: 1, bgcolor: "grey.200", my: 0.5 }} />
      )}
    </Box>
    <Box sx={{ pb: isLast ? 0 : 2, flex: 1 }}>
      <Typography
        variant="body2"
        fontWeight={isCurrent ? 600 : 400}
        color={isCurrent ? "primary.main" : "text.primary"}
        sx={{ textTransform: "capitalize" }}
      >
        {entry.status}
      </Typography>
      <Typography variant="caption" color="text.secondary">
        {formatOrderDate(entry.changedAt, "PPp")}
      </Typography>
      {entry.note && (
        <Typography variant="caption" color="text.secondary" display="block">
          {entry.note}
        </Typography>
      )}
    </Box>
  </Box>
);

export default OrderDetailModal;
