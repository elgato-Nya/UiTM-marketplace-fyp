import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Container,
  Typography,
  Button,
  CircularProgress,
  Tabs,
  Tab,
} from "@mui/material";
import { Add as AddIcon } from "@mui/icons-material";

import { useTheme } from "../../hooks/useTheme";
import useListings from "../../features/listing/hooks/useListings";
import useListingActions from "../../features/listing/hooks/useListingActions";
import ListingGrid from "../../features/listing/components/ListingGrid";
import { ConfirmDeleteDialog } from "../../components/common/Dialog";
import { ErrorAlert } from "../../components/common/Alert";
import { ROUTES } from "../../constants/routes";

const MyListingsPage = () => {
  const { theme } = useTheme();
  const navigate = useNavigate();
  const [tabValue, setTabValue] = useState(0);
  const [deleteDialog, setDeleteDialog] = useState({
    open: false,
    listingId: null,
    listingName: "",
  });

  const {
    listings,
    pagination,
    isLoading,
    filters,
    error,
    updateFilters,
    handlePageChange,
    handleLimitChange,
  } = useListings({ autoFetch: true, myListings: true });

  const {
    handleDeleteListing,
    handleToggleAvailability,
    goToCreateListing,
    goToEditListing,
    clearMessages,
  } = useListingActions();

  // Filter listings based on tab selection
  const filteredListings = listings.filter((listing) => {
    if (tabValue === 0) return true; // All
    if (tabValue === 1) return listing.isAvailable; // Available
    if (tabValue === 2) return !listing.isAvailable; // Unavailable
    return true;
  });

  useEffect(() => {
    clearMessages();
  }, []);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleDeleteClick = (listingId) => {
    const listing = listings.find((l) => l._id === listingId);
    setDeleteDialog({
      open: true,
      listingId,
      listingName: listing?.name || "this listing",
    });
  };

  const handleDeleteConfirm = async () => {
    const success = await handleDeleteListing(deleteDialog.listingId, true); // true = permanent
    if (success) {
      setDeleteDialog({ open: false, listingId: null, listingName: "" });
    }
  };

  const handleToggleClick = async (listingId) => {
    await handleToggleAvailability(listingId || deleteDialog.listingId);
  };

  const handleCreateClick = () => {
    navigate(ROUTES.MERCHANT.LISTINGS.CREATE);
  };

  const handleEditClick = (listingId) => {
    navigate(ROUTES.MERCHANT.LISTINGS.EDIT(listingId));
  };

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Header */}
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={4}
      >
        <Box>
          <Typography variant="h4" component="h1" alignItems="center" mb={4}>
            My Listings
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Manage your product and service listings here.
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleCreateClick}
          size="large"
        >
          Create Listing
        </Button>
      </Box>

      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 3 }}>
        <Tabs value={tabValue} onChange={handleTabChange}>
          <Tab label="All Listings" />
          <Tab label="Available" />
          <Tab label="Unavailable" />
        </Tabs>
      </Box>

      {/* Error Alert */}
      <ErrorAlert
        error={error}
        show={!!error}
        fallback="Failed to load your listings. Please try again."
      />

      {/* Loading State */}
      {isLoading && (
        <Box display="flex" justifyContent="center" py={8}>
          <CircularProgress />
        </Box>
      )}

      {/* Listings Grid */}
      {!isLoading && (
        <ListingGrid
          listings={filteredListings}
          pagination={pagination}
          onPageChange={handlePageChange}
          onLimitChange={handleLimitChange}
          onEdit={handleEditClick}
          onDelete={handleDeleteClick}
          onToggle={handleToggleClick}
          showActions
          emptyMessage="You haven't created any listings yet. Click 'Create Listing' to get started!"
        />
      )}

      {/** Delete Confirmation Dialog */}
      <ConfirmDeleteDialog
        open={deleteDialog.open}
        onClose={() =>
          setDeleteDialog({ open: false, listingId: null, listingName: "" })
        }
        onDelete={handleDeleteConfirm}
        onToggle={handleToggleClick}
        itemName={deleteDialog.listingName}
        title="Delete Listing"
        toggleLabel="Mark Unavailable"
        warningMessage="All listing data, images, and associated information will be permanently deleted from the database."
      />
    </Container>
  );
};

export default MyListingsPage;
