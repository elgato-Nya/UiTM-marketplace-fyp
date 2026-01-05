import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Container, Box, Typography, Button, Grid, Alert } from "@mui/material";
import {
  DeleteOutline as DeleteIcon,
  Favorite as FavoriteIcon,
} from "@mui/icons-material";

import { ROUTES } from "../../constants/routes";
import { useTheme } from "../../hooks/useTheme";
import { useSnackbarContext as useSnackbar } from "../../contexts/SnackbarContext";
import BackButton from "../../components/common/Navigation/BackButton";
import ConfirmDialog from "../../components/common/Dialog/ConfirmDialog";
import EmptyState from "../../components/common/EmptyState";
import DynamicSkeleton from "../../components/ui/Skeleton/DynamicSkeleton";
import ListingCard from "../../features/listing/components/ListingCard";
import useWishlist from "../../features/wishlist/hook/useWishlist";

/**
 * Wishlist Page
 * Main wishlist view with saved items using InfoCard component
 *
 * ACCESSIBILITY:
 * - Semantic HTML (section, header, article)
 * - ARIA labels and live regions
 * - Keyboard navigation support
 * - Loading states announced
 *
 * FEATURES:
 * - Grid layout using InfoCard
 * - Price change tracking
 * - Availability status
 * - Move to cart
 * - Remove from wishlist
 * - Clear wishlist with confirmation
 */
const WishlistPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { theme } = useTheme();
  const { success, error: showErrorSnack } = useSnackbar();
  const [confirmClearOpen, setConfirmClearOpen] = useState(false);

  const {
    wishlist,
    summary,
    isLoading,
    error,
    removeFromWishlist,
    clearAllWishlist,
    moveToCart,
    clearWishlistErrorMessage,
  } = useWishlist({ autoFetch: true });

  // Error handling with accessibility announcement
  useEffect(() => {
    if (error) {
      showErrorSnack(error.message || "An error occurred");
      clearWishlistErrorMessage();
    }
  }, [error, showErrorSnack, clearWishlistErrorMessage]);

  const handleRemoveItem = async (listingId) => {
    try {
      await removeFromWishlist(listingId);
      success("Item removed from wishlist");
    } catch (err) {
      showErrorSnack(err.message || "Failed to remove item");
    }
  };

  const handleClearWishlist = async () => {
    try {
      await clearAllWishlist();
      setConfirmClearOpen(false);
      success("Wishlist cleared");
    } catch (err) {
      showErrorSnack(err.message || "Failed to clear wishlist");
    }
  };

  const handleBrowse = () => {
    navigate(ROUTES.LISTINGS.ALL);
  };

  const isEmpty = !wishlist || !wishlist.items || wishlist.items.length === 0;

  // Check for unavailable items (for products check stock, for services check only availability)
  const hasUnavailableServices = wishlist?.items?.some((item) => {
    const services = item.listing;
  });
  const hasUnavailableItems =
    wishlist?.items?.some((item) => {
      const listing = item.listing;
      if (!listing?.isAvailable) return true;
      // Only check stock for products, not services
      if (listing?.type === "product" && listing?.stock <= 0) return true;
      return false;
    }) || false;

  return (
    <Container
      maxWidth="lg"
      sx={{ py: 4 }}
      component="section"
      aria-labelledby="wishlist-title"
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
            id="wishlist-title"
            variant="h4"
            component="h1"
            sx={{ fontWeight: 700 }}
          >
            My Wishlist
          </Typography>
          {!isEmpty && (
            <Typography
              variant="body1"
              color="text.secondary"
              aria-label={`${summary.totalItems} items in wishlist`}
            >
              ({summary.totalItems}{" "}
              {summary.totalItems === 1 ? "item" : "items"})
            </Typography>
          )}
        </Box>

        {!isEmpty && (
          <Button
            startIcon={<DeleteIcon />}
            onClick={() => setConfirmClearOpen(true)}
            color="error"
            variant="outlined"
            disabled={isLoading}
            aria-label="Clear all items from wishlist"
          >
            Clear Wishlist
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
        {isLoading ? "Loading wishlist..." : "Wishlist loaded"}
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
            contentType: "wishlist",
            items: 6,
            animated: true,
          }}
        />
      )}

      {/* Unavailable Items Warning */}
      {hasUnavailableItems && !isLoading && (
        <Alert severity="info" sx={{ mb: 3 }} role="alert" aria-live="polite">
          Some items in your wishlist are unavailable or out of stock.
        </Alert>
      )}

      {/* Empty State */}
      {isEmpty && !isLoading && (
        <EmptyState
          icon={<FavoriteIcon />}
          title="Your wishlist is empty"
          description="Save items you love for later! Browse listings and click the heart icon to add items to your wishlist."
          actionLabel="Browse Listings"
          onAction={handleBrowse}
          actionVariant="contained"
        />
      )}

      {/* Wishlist Grid using ListingCard */}
      {!isEmpty && !isLoading && (
        <Grid
          container
          spacing={3}
          component="section"
          aria-label="Wishlist items"
          role="list"
        >
          {wishlist.items.map((item) => {
            const listing = item.listing;
            return (
              <Grid
                item
                size={{ xs: 12, sm: 6, lg: 3 }}
                key={item._id}
                role="listitem"
              >
                <ListingCard listing={listing} isWishlistContext={true} />
              </Grid>
            );
          })}
        </Grid>
      )}

      {/* Clear Wishlist Confirmation */}
      <ConfirmDialog
        open={confirmClearOpen}
        onClose={() => setConfirmClearOpen(false)}
        onConfirm={handleClearWishlist}
        title="Clear Wishlist"
        message="Are you sure you want to remove all items from your wishlist? This action cannot be undone."
        confirmText="Clear Wishlist"
        confirmColor="error"
      />
    </Container>
  );
};

export default WishlistPage;
