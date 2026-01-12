import React from "react";
import {
  Box,
  ListItem,
  ListItemButton,
  ListItemAvatar,
  ListItemText,
  Avatar,
  IconButton,
  Divider,
  useMediaQuery,
  Tooltip,
  Button,
} from "@mui/material";
import { ChevronRight, Edit, ShoppingBag } from "@mui/icons-material";
import { useTheme } from "../../../hooks/useTheme";
import { canUpdateStatus } from "../utils/orderHelper";

// Import sub-components
import OrderHeaderSection from "./OrderListItem/OrderHeaderSection";
import OrderInfoGrid from "./OrderListItem/OrderInfoGrid";

/**
 * OrderListItem Component
 *
 * PURPOSE: Display order information in a list format with enhanced mobile responsiveness
 * FEATURES:
 * - Semantic HTML with proper ARIA attributes
 * - Mobile-first responsive design
 * - Accessible keyboard navigation
 * - Visual hierarchy with proper spacing
 * - Click to view details
 * - Quick update status action for sellers
 *
 * @param {Object} order - Order data object
 * @param {string} orderRole - 'buyer' or 'seller'
 * @param {function} onViewDetails - Callback when order is clicked
 * @param {function} onUpdateStatus - Optional callback for updating order status (seller)
 */
function OrderListItem({
  order,
  orderRole = "buyer",
  onViewDetails,
  onUpdateStatus,
}) {
  const { theme } = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  if (!order) return null;

  const canUpdate = orderRole === "seller" && canUpdateStatus(order, orderRole);
  const firstItem = order.items?.[0];

  const handleClick = () => {
    if (onViewDetails) {
      onViewDetails(order);
    }
  };

  const handleUpdateClick = (e) => {
    e.stopPropagation();
    if (onUpdateStatus) {
      onUpdateStatus(order);
    }
  };

  const handleViewClick = (e) => {
    e.stopPropagation();
    if (onViewDetails) {
      onViewDetails(order);
    }
  };

  return (
    <>
      <ListItem
        component="article"
        disablePadding
        aria-label={`Order ${order.orderNumber}`}
        sx={{
          "&:hover": {
            backgroundColor: theme.palette.action.hover,
          },
        }}
        secondaryAction={
          !isMobile && (
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              {canUpdate && (
                <Tooltip title="Update Status" arrow>
                  <IconButton
                    edge="end"
                    aria-label="Update order status"
                    onClick={handleUpdateClick}
                    sx={{
                      color: "primary.main",
                      bgcolor: "action.hover",
                      "&:hover": {
                        bgcolor: "primary.light",
                        color: "primary.contrastText",
                      },
                    }}
                  >
                    <Edit fontSize="small" />
                  </IconButton>
                </Tooltip>
              )}
              <Tooltip title="View Details" arrow>
                <IconButton
                  edge="end"
                  aria-label="View order details"
                  onClick={handleViewClick}
                  sx={{
                    color: "text.secondary",
                    "&:hover": {
                      color: "primary.main",
                    },
                  }}
                >
                  <ChevronRight />
                </IconButton>
              </Tooltip>
            </Box>
          )
        }
      >
        <ListItemButton
          onClick={handleClick}
          sx={{
            py: { xs: 1.5, sm: 2 },
            px: { xs: 2, sm: 2.5 },
            display: "flex",
            alignItems: "flex-start",
            gap: { xs: 1.5, sm: 2 },
            "&:focus-visible": {
              outline: `3px solid ${theme.palette.primary.main}`,
              outlineOffset: "-3px",
            },
          }}
          role="button"
          tabIndex={0}
        >
          {/* Order Icon / First Item Image */}
          <ListItemAvatar
            sx={{
              minWidth: { xs: 48, sm: 56 },
              mt: 0.5,
            }}
          >
            {firstItem?.images?.[0] ? (
              <Avatar
                src={firstItem.images[0]}
                alt={firstItem.name}
                variant="rounded"
                sx={{
                  width: { xs: 48, sm: 56 },
                  height: { xs: 48, sm: 56 },
                  bgcolor: "grey.200",
                }}
              />
            ) : (
              <Avatar
                variant="rounded"
                sx={{
                  width: { xs: 48, sm: 56 },
                  height: { xs: 48, sm: 56 },
                  bgcolor: "primary.main",
                  opacity: 0.1,
                }}
              >
                <ShoppingBag
                  sx={{
                    fontSize: { xs: 24, sm: 28 },
                    color: "primary.main",
                  }}
                />
              </Avatar>
            )}
          </ListItemAvatar>

          {/* Order Details */}
          <ListItemText
            sx={{
              flex: 1,
              my: 0,
              mr: { xs: 0, sm: 8, md: 12 },
            }}
            primary={
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  gap: { xs: 1, sm: 1.5 },
                }}
              >
                {/* Order Number & Status Row */}
                <OrderHeaderSection order={order} isMobile={isMobile} />

                {/* Order Info Grid - Responsive Layout */}
                <OrderInfoGrid order={order} orderRole={orderRole} />

                {/* Mobile Actions */}
                {isMobile && canUpdate && (
                  <Box
                    sx={{ mt: 1, pt: 1, borderTop: 1, borderColor: "divider" }}
                  >
                    <Button
                      size="small"
                      variant="outlined"
                      color="primary"
                      startIcon={<Edit fontSize="small" />}
                      onClick={handleUpdateClick}
                      sx={{ fontSize: "0.75rem" }}
                    >
                      Update Status
                    </Button>
                  </Box>
                )}
              </Box>
            }
          />
        </ListItemButton>
      </ListItem>
      <Divider component="li" />
    </>
  );
}

export default OrderListItem;
