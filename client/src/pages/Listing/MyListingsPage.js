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
import {
  useGetMyListingsQuery,
  useDeleteListingMutation,
  useToggleAvailabilityMutation,
} from "../../features/listing/api/listingApi";
import ListingGrid from "../../features/listing/components/ListingGrid";
import ConfirmDeleteDialog from "../../components/common/Dialog/ConfirmDeleteDialog";
import ErrorAlert from "../../components/common/Alert/ErrorAlert";
import { ROUTES } from "../../constants/routes";
import { useSnackbarContext as useSnackbar } from "../../contexts/SnackbarContext";

const MyListingsPage = () => {
  const { theme } = useTheme();
  const navigate = useNavigate();
  const { success, error: showError } = useSnackbar();
  const [tabValue, setTabValue] = useState(0);
  const [deleteDialog, setDeleteDialog] = useState({
    open: false,
    listingId: null,
    listingName: "",
  });

  // RTK Query hooks - automatic caching!
  const {
    data: listingsData,
    isLoading,
    error,
    refetch,
  } = useGetMyListingsQuery({
    includeUnavailable: true,
  });

  const [deleteListing, { isLoading: isDeleting }] = useDeleteListingMutation();
  const [toggleAvailability, { isLoading: isToggling }] =
    useToggleAvailabilityMutation();

  const listings = listingsData?.listings || [];
  const pagination = listingsData?.pagination || {};

  // Filter listings based on tab selection
  const filteredListings = listings.filter((listing) => {
    if (tabValue === 0) return true; // All
    if (tabValue === 1) return listing.isAvailable; // Available
    if (tabValue === 2) return !listing.isAvailable; // Unavailable
    return true;
  });

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
    try {
      await deleteListing({
        id: deleteDialog.listingId,
        permanent: true,
      }).unwrap();
      success("Listing permanently deleted");
      setDeleteDialog({ open: false, listingId: null, listingName: "" });
      refetch();
    } catch (err) {
      showError(err?.data?.message || "Failed to delete listing");
    }
  };

  const handleToggleClick = async (listingId) => {
    try {
      await toggleAvailability(listingId || deleteDialog.listingId).unwrap();
      success("Listing availability updated");
      setDeleteDialog({ open: false, listingId: null, listingName: "" });
      refetch();
    } catch (err) {
      showError(err?.data?.message || "Failed to update listing");
    }
  };

  const handleCreateClick = () => {
    navigate(ROUTES.MERCHANT.LISTINGS.CREATE);
  };

  const handleEditClick = (listingId) => {
    navigate(ROUTES.MERCHANT.LISTINGS.EDIT(listingId));
  };

  return (
    <Container disableGutters maxWidth="xl">
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
          onPageChange={() => {}}
          onLimitChange={() => {}}
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
        isLoading={isDeleting || isToggling}
      />
    </Container>
  );
};

export default MyListingsPage;
