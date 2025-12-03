import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useDispatch } from "react-redux";
import { Box, Container, Typography, Button, Grid, Alert } from "@mui/material";
import {
  DeleteOutline as DeleteIcon,
  ShoppingCart as ShoppingCartIcon,
} from "@mui/icons-material";

import { ROUTES } from "../../constants/routes";
import { useTheme } from "../../hooks/useTheme";
import { useSnackbarContext as useSnackbar } from "../../contexts/SnackbarContext";
import { BackButton, ConfirmDialog, EmptyState } from "../../components/common";
import DynamicSkeleton from "../../components/ui/Skeleton/DynamicSkeleton";
import useCart from "../../features/cart/hook/useCart";
import CartList from "../../features/cart/components/CartList";
import CartSummary from "../../features/cart/components/CartSummary";
import { createSessionFromCart } from "../../features/checkout/store/checkoutSlice";

/**
 * Cart Page
 * Main cart view with items, summary, and actions
 *
 * ACCESSIBILITY:
 * - Uses semantic HTML (section, header)
 * - ARIA labels and live regions for screen readers
 * - Keyboard navigation support
 * - Loading states announced
 *
 * FEATURES:
 * - Real-time cart updates
 * - Price change indicators
 * - Stock validation
 * - Unavailable item warnings
 * - Move to wishlist
 * - Clear cart with confirmation
 */
const CartPage = () => {
  const { theme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const { success, error: showErrorSnack, info: showInfoSnack } = useSnackbar();
  const [confirmClearOpen, setConfirmClearOpen] = useState(false);
  const [isCheckingOut, setIsCheckingOut] = useState(false);

  const {
    cart,
    summary,
    isLoading,
    error,
    increaseQuantity,
    decreaseQuantity,
    removeFromCart,
    clearCart,
    moveToWishlist,
    clearCartErrorMessage,
  } = useCart({ autoFetch: true });

  // todo: recheck whether is it true that it did the accessibility announcement
  // Error handling with accessibility announcement
  useEffect(() => {
    if (error) {
      showErrorSnack(error.message || "An error occurred");
      clearCartErrorMessage();
    }
  }, [error, showErrorSnack, clearCartErrorMessage]);

  const handleIncreaseQuantity = async (
    listingId,
    currentQuantity,
    maxStock
  ) => {
    try {
      await increaseQuantity(listingId, currentQuantity, maxStock);
      // Removed success notification for better UX (optimistic update is instant)
    } catch (error) {
      showErrorSnack(error.message || "Failed to increase quantity");
    }
  };

  const handleDecreaseQuantity = async (listingId, currentQuantity) => {
    try {
      await decreaseQuantity(listingId, currentQuantity);
      // Removed success notification for better UX (optimistic update is instant)
    } catch (error) {
      showErrorSnack(error.message || "Failed to decrease quantity");
    }
  };

  const handleRemoveItem = async (listingId) => {
    try {
      await removeFromCart(listingId);
      success("Item removed from cart");
    } catch (error) {
      showErrorSnack(error.message || "Failed to remove item");
    }
  };

  const handleMoveToWishlist = async (listingId) => {
    try {
      await moveToWishlist(listingId);
      success("Item moved to wishlist");
    } catch (error) {
      showErrorSnack(error.message || "Failed to move item to wishlist");
    }
  };

  const handleClearCart = async () => {
    try {
      await clearCart();
      setConfirmClearOpen(false);
      success("Cart cleared");
    } catch (error) {
      showErrorSnack(error.message || "Failed to clear cart");
    }
  };

  const handleCheckout = async () => {
    setIsCheckingOut(true);
    try {
      // Create checkout session from cart
      const result = await dispatch(createSessionFromCart()).unwrap();

      // Navigate to checkout page
      navigate(ROUTES.CHECKOUT.INDEX);
      success("Redirecting to checkout...");
    } catch (error) {
      showErrorSnack(
        error.message || "Failed to start checkout. Please try again."
      );
    } finally {
      setIsCheckingOut(false);
    }
  };

  const handleBrowse = () => {
    navigate(ROUTES.LISTINGS.ALL);
  };

  // Cart state checks
  const hasUnavailableItems =
    cart?.items?.some((item) => !item.listing?.isAvailable) || false;
  const isEmpty = !cart || !cart.items || cart.items.length === 0;

  return (
    <Container
      maxWidth="lg"
      sx={{ py: 4 }}
      component="section"
      aria-labelledby="cart-title"
      role="region"
    >
      {/* Header */}
      <Box
        component="header"
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          mb: 4,
          flexWrap: "wrap",
          gap: 2,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <BackButton ariaLabel="Go back to previous page" />
          <Typography
            id="cart-title"
            variant="h4"
            component="h1"
            sx={{ fontWeight: 700 }}
          >
            Shopping Cart
          </Typography>
        </Box>

        {!isEmpty && (
          <Button
            startIcon={<DeleteIcon />}
            onClick={() => setConfirmClearOpen(true)}
            color="error"
            variant="outlined"
            disabled={isLoading}
            aria-label="Clear all items from cart"
          >
            Clear Cart
          </Button>
        )}
      </Box>

      {/* Loading announcement for screen readers */}
      <div
        role="status"
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
      >
        {isLoading ? "Loading cart..." : "Cart loaded"}
      </div>

      {/* Loading Skeleton */}
      {isLoading && (
        <DynamicSkeleton
          type="page"
          location={location.pathname}
          config={{
            showHeader: false,
            showSidebar: false,
            showFooter: false,
            contentType: "cart",
            animated: true,
          }}
        />
      )}

      {/* Unavailable Items Warning */}
      {hasUnavailableItems && (
        <Alert
          severity="warning"
          sx={{ mb: 3 }}
          role="alert"
          aria-live="assertive"
        >
          Some items in your cart are no longer available. Please remove them to
          proceed with checkout.
        </Alert>
      )}

      {/* Empty State */}
      {isEmpty && !isLoading && (
        <EmptyState
          icon={<ShoppingCartIcon />}
          title="Your cart is empty"
          description="Looks like you haven't added anything to your cart yet. Start shopping to fill it up!"
          actionLabel="Browse Listings"
          onAction={handleBrowse}
          actionVariant="contained"
        />
      )}

      {/* Cart Content */}
      {!isEmpty && !isLoading && (
        <>
          {/* Summary at Top (Mobile only) */}
          <Box
            sx={{
              display: { xs: "block", md: "none" },
              mb: 3,
            }}
          >
            <CartSummary
              summary={summary}
              onCheckout={handleCheckout}
              hasUnavailableItems={hasUnavailableItems}
              isLoading={isLoading || isCheckingOut}
            />
          </Box>

          <Grid container spacing={3}>
            {/* Cart Items */}
            <Grid size={{ xs: 12, md: 8 }}>
              <CartList
                items={cart.items}
                onQuantityIncrease={handleIncreaseQuantity}
                onQuantityDecrease={handleDecreaseQuantity}
                onRemove={handleRemoveItem}
                onMoveToWishlist={handleMoveToWishlist}
                isLoading={isLoading}
              />
            </Grid>

            {/* Summary (Desktop only - sticky sidebar) */}
            <Grid
              item
              size={{ xs: 12, md: 4 }}
              sx={{
                display: { xs: "none", md: "block" },
                position: "sticky",
                top: 70,
                alignSelf: "flex-start",
              }}
            >
              <Box component="aside" aria-label="Order summary">
                <CartSummary
                  summary={summary}
                  onCheckout={handleCheckout}
                  hasUnavailableItems={hasUnavailableItems}
                  isLoading={isLoading || isCheckingOut}
                />
              </Box>
            </Grid>
          </Grid>
        </>
      )}

      {/* Clear Cart Confirmation */}
      <ConfirmDialog
        open={confirmClearOpen}
        onClose={() => setConfirmClearOpen(false)}
        onConfirm={handleClearCart}
        title="Clear Cart"
        message="Are you sure you want to remove all items from your cart? This action cannot be undone."
        confirmText="Clear Cart"
        confirmColor="error"
      />
    </Container>
  );
};

export default CartPage;
