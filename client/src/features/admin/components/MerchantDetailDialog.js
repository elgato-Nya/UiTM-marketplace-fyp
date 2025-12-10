import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Avatar,
  Typography,
  Stack,
  Divider,
  Chip,
  IconButton,
} from "@mui/material";
import {
  Email,
  Store,
  ShoppingBag,
  AttachMoney,
  CalendarToday,
  Close,
} from "@mui/icons-material";
import { format } from "date-fns";
import MerchantStatusBadge from "./MerchantStatusBadge";
import ShopStatusBadge from "./ShopStatusBadge";

/**
 * MerchantDetailDialog Component
 *
 * PURPOSE: Display comprehensive merchant information in a modal dialog
 * FEATURES:
 * - Contact details with UiTM verification indicator
 * - Shop information and description
 * - Business statistics (listings, orders)
 * - Registration date
 * - Action buttons for all merchant statuses (mobile-friendly)
 *
 * ACCESSIBILITY:
 * - Proper dialog semantics
 * - Descriptive ARIA labels
 * - Clear visual hierarchy
 * - Icon + text for all information
 */
const MerchantDetailDialog = ({
  open,
  onClose,
  merchant,
  onApprove,
  onReject,
  onSuspend,
  onReactivate,
}) => {
  if (!merchant) return null;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      aria-labelledby="merchant-detail-dialog-title"
      aria-describedby="merchant-detail-dialog-description"
    >
      <DialogTitle id="merchant-detail-dialog-title">
        <Box sx={{ display: "flex", alignItems: "center", gap: 2, pr: 6 }}>
          <Avatar
            src={merchant.profile?.avatar}
            sx={{ width: 56, height: 56 }}
            alt={`${merchant.profile?.username}'s avatar`}
          >
            {merchant.profile?.username?.[0]?.toUpperCase()}
          </Avatar>
          <Box sx={{ flex: 1 }}>
            <Typography variant="h6" component="h2">
              {merchant.merchantDetails?.shopName}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              @{merchant.profile?.username}
            </Typography>
          </Box>
          <IconButton
            aria-label="close"
            onClick={onClose}
            sx={{
              position: "absolute",
              right: 8,
              top: 8,
              color: (theme) => theme.palette.grey[500],
            }}
          >
            <Close />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent dividers id="merchant-detail-dialog-description">
        <Stack spacing={3}>
          {/* Status Section */}
          <section aria-labelledby="status-heading">
            <Typography
              id="status-heading"
              variant="subtitle2"
              color="text.secondary"
              gutterBottom
            >
              Status
            </Typography>
            <Box sx={{ display: "flex", gap: 1 }}>
              <MerchantStatusBadge
                status={merchant.merchantDetails?.verificationStatus}
              />
              <ShopStatusBadge status={merchant.merchantDetails?.shopStatus} />
            </Box>
          </section>

          <Divider />

          {/* Contact Information Section */}
          <section aria-labelledby="contact-heading">
            <Typography
              id="contact-heading"
              variant="subtitle2"
              color="text.secondary"
              gutterBottom
            >
              Contact Information
            </Typography>
            <Stack spacing={1}>
              <Box
                sx={{ display: "flex", alignItems: "center", gap: 1 }}
                role="group"
                aria-label="Primary email"
              >
                <Email fontSize="small" color="action" aria-hidden="true" />
                <Typography variant="body2">{merchant.email}</Typography>
              </Box>

              {merchant.merchantDetails?.verificationEmail && (
                <Box
                  sx={{ display: "flex", alignItems: "center", gap: 1 }}
                  role="group"
                  aria-label="UiTM verification email"
                >
                  <Email fontSize="small" color="action" aria-hidden="true" />
                  <Typography variant="body2" color="primary">
                    {merchant.merchantDetails.verificationEmail}
                  </Typography>
                  <Chip
                    label="UiTM Verified"
                    color="success"
                    size="small"
                    sx={{ ml: 1 }}
                    aria-label="Verified UiTM student email"
                  />
                </Box>
              )}
            </Stack>
          </section>

          <Divider />

          {/* Shop Information Section */}
          <section aria-labelledby="shop-heading">
            <Typography
              id="shop-heading"
              variant="subtitle2"
              color="text.secondary"
              gutterBottom
            >
              Shop Information
            </Typography>
            <Stack spacing={1}>
              <Box
                sx={{ display: "flex", alignItems: "center", gap: 1 }}
                role="group"
                aria-label="Shop name"
              >
                <Store fontSize="small" color="action" aria-hidden="true" />
                <Typography variant="body2">
                  {merchant.merchantDetails?.shopName}
                </Typography>
              </Box>
              <Typography variant="body2" color="text.secondary">
                {merchant.merchantDetails?.shopDescription ||
                  "No description provided"}
              </Typography>
            </Stack>
          </section>

          <Divider />

          {/* Statistics Section */}
          <section aria-labelledby="stats-heading">
            <Typography
              id="stats-heading"
              variant="subtitle2"
              color="text.secondary"
              gutterBottom
            >
              Business Statistics
            </Typography>
            <Stack spacing={1}>
              <Box
                sx={{ display: "flex", alignItems: "center", gap: 1 }}
                role="group"
                aria-label={`Total listings: ${merchant.stats?.totalListings || 0}`}
              >
                <ShoppingBag
                  fontSize="small"
                  color="action"
                  aria-hidden="true"
                />
                <Typography variant="body2">
                  {merchant.stats?.totalListings || 0} Listings
                </Typography>
              </Box>

              <Box
                sx={{ display: "flex", alignItems: "center", gap: 1 }}
                role="group"
                aria-label={`Completed orders: ${merchant.stats?.completedOrders || 0}`}
              >
                <AttachMoney
                  fontSize="small"
                  color="action"
                  aria-hidden="true"
                />
                <Typography variant="body2">
                  {merchant.stats?.completedOrders || 0} Completed Orders
                </Typography>
              </Box>

              <Box
                sx={{ display: "flex", alignItems: "center", gap: 1 }}
                role="group"
                aria-label={`Registration date: ${format(
                  new Date(merchant.createdAt),
                  "MMMM dd, yyyy"
                )}`}
              >
                <CalendarToday
                  fontSize="small"
                  color="action"
                  aria-hidden="true"
                />
                <Typography variant="body2">
                  Registered{" "}
                  {format(new Date(merchant.createdAt), "MMMM dd, yyyy")}
                </Typography>
              </Box>
            </Stack>
          </section>
        </Stack>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2, gap: 1, flexWrap: "wrap" }}>
        {/* Close button - always visible */}
        <Button onClick={onClose} aria-label="Close dialog">
          Close
        </Button>

        {/* Action buttons based on merchant status */}
        {merchant.merchantDetails?.verificationStatus === "unverified" && (
          <>
            <Button
              variant="outlined"
              color="error"
              onClick={() => {
                onClose();
                onReject(merchant);
              }}
              aria-label="Reject this merchant"
            >
              Reject
            </Button>
            <Button
              variant="contained"
              color="success"
              onClick={() => {
                onClose();
                onApprove(merchant);
              }}
              aria-label="Approve this merchant"
            >
              Approve
            </Button>
          </>
        )}

        {/* Verified merchants can be suspended */}
        {merchant.merchantDetails?.verificationStatus === "verified" &&
          merchant.merchantDetails?.shopStatus !== "suspended" && (
            <Button
              variant="outlined"
              color="error"
              onClick={() => {
                onClose();
                onSuspend?.(merchant);
              }}
              aria-label="Suspend this merchant"
            >
              Suspend
            </Button>
          )}

        {/* Suspended merchants can be reactivated */}
        {merchant.merchantDetails?.shopStatus === "suspended" && (
          <Button
            variant="contained"
            color="success"
            onClick={() => {
              onClose();
              onReactivate?.(merchant);
            }}
            aria-label="Reactivate this merchant"
          >
            Reactivate
          </Button>
        )}

        {/* Rejected merchants can be approved */}
        {merchant.merchantDetails?.verificationStatus === "rejected" && (
          <Button
            variant="contained"
            color="success"
            onClick={() => {
              onClose();
              onApprove(merchant);
            }}
            aria-label="Approve this merchant"
          >
            Approve
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default MerchantDetailDialog;
