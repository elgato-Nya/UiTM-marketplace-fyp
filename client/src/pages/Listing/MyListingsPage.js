import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Add as AddIcon,
  ArchiveOutlined as ArchiveOutlinedIcon,
  Inventory2Outlined as Inventory2OutlinedIcon,
  StorefrontOutlined as StorefrontOutlinedIcon,
  Tune as TuneIcon,
} from "@mui/icons-material";
import {
  Alert,
  Box,
  Button,
  Container,
  Grid,
  Stack,
  Typography,
} from "@mui/material";

import ErrorAlert from "../../components/common/Alert/ErrorAlert";
import ConfirmDeleteDialog from "../../components/common/Dialog/ConfirmDeleteDialog";
import EmptyState from "../../components/common/EmptyState";
import TabsComponent from "../../components/common/Tabs/TabsComponent";
import ListingCardSkeleton from "../../components/ui/Skeleton/ListingCardSkeleton";
import { useSnackbarContext as useSnackbar } from "../../contexts/SnackbarContext";
import {
  useDeleteListingMutation,
  useGetMyListingsQuery,
  useToggleAvailabilityMutation,
} from "../../features/listing/api/listingApi";
import MerchantListingCard from "../../features/listing/components/MerchantListingCard";
import { ROUTES } from "../../constants/routes";
import { useTheme } from "../../hooks/useTheme";

const TAB_VALUES = {
  ACTIVE: "active",
  UNAVAILABLE: "unavailable",
  ALL: "all",
};

const createStatCards = ({ totalCount, activeCount, unavailableCount, variantCount }) => [
  {
    title: "Total listings",
    value: totalCount,
    description: "Everything currently visible in your dashboard.",
    icon: <StorefrontOutlinedIcon color="primary" />,
  },
  {
    title: "Active",
    value: activeCount,
    description: "Available for buyers right now.",
    icon: <Inventory2OutlinedIcon color="success" />,
  },
  {
    title: "Archived or unavailable",
    value: unavailableCount,
    description: "Hidden from buyers until restored.",
    icon: <ArchiveOutlinedIcon color="action" />,
  },
  {
    title: "Variant listings",
    value: variantCount,
    description: "Listings managed through options and combined stock.",
    icon: <TuneIcon color="secondary" />,
  },
];

const MyListingsPage = () => {
  const { theme } = useTheme();
  const navigate = useNavigate();
  const { success, error: showError } = useSnackbar();
  const [tabValue, setTabValue] = useState(TAB_VALUES.ACTIVE);
  const [deleteDialog, setDeleteDialog] = useState({
    open: false,
    listingId: null,
    listingName: "",
  });

  const {
    data: listingsData,
    isLoading,
    isFetching,
    error,
    refetch,
  } = useGetMyListingsQuery({
    includeUnavailable: true,
  });

  const [deleteListing, { isLoading: isDeleting }] = useDeleteListingMutation();
  const [toggleAvailability, { isLoading: isToggling }] =
    useToggleAvailabilityMutation();

  const listings = listingsData?.listings || [];

  const counts = useMemo(() => {
    const activeCount = listings.filter((listing) => listing.isAvailable).length;
    const unavailableCount = listings.length - activeCount;
    const variantCount = listings.filter(
      (listing) => Array.isArray(listing.variants) && listing.variants.length > 0,
    ).length;

    return {
      totalCount: listings.length,
      activeCount,
      unavailableCount,
      variantCount,
    };
  }, [listings]);

  const filteredListings = useMemo(() => {
    if (tabValue === TAB_VALUES.ACTIVE) {
      return listings.filter((listing) => listing.isAvailable);
    }

    if (tabValue === TAB_VALUES.UNAVAILABLE) {
      return listings.filter((listing) => !listing.isAvailable);
    }

    return listings;
  }, [listings, tabValue]);

  const currentTabMeta = useMemo(() => {
    if (tabValue === TAB_VALUES.ACTIVE) {
      return {
        title: "No active listings yet",
        description:
          listings.length === 0
            ? "Create your first listing to start selling on MarKet."
            : "Your active listings will appear here once you restore or publish them.",
        actionLabel: listings.length === 0 ? "Create Listing" : "View all listings",
        onAction:
          listings.length === 0
            ? () => navigate(ROUTES.MERCHANT.LISTINGS.CREATE)
            : () => setTabValue(TAB_VALUES.ALL),
      };
    }

    if (tabValue === TAB_VALUES.UNAVAILABLE) {
      return {
        title: "No archived or unavailable listings",
        description:
          "Listings you archive or mark unavailable stay here until you restore them.",
        actionLabel: "View active listings",
        onAction: () => setTabValue(TAB_VALUES.ACTIVE),
      };
    }

    return {
      title: "No listings yet",
      description: "Create your first listing to start building your catalog.",
      actionLabel: "Create Listing",
      onAction: () => navigate(ROUTES.MERCHANT.LISTINGS.CREATE),
    };
  }, [listings.length, navigate, tabValue]);

  const handleDeleteClick = (listingId) => {
    const listing = listings.find((item) => item._id === listingId);
    setDeleteDialog({
      open: true,
      listingId,
      listingName: listing?.name || "this listing",
    });
  };

  const closeDeleteDialog = () => {
    setDeleteDialog({ open: false, listingId: null, listingName: "" });
  };

  const handleDeleteConfirm = async () => {
    try {
      await deleteListing({
        id: deleteDialog.listingId,
        permanent: false,
      }).unwrap();

      success("Listing removed from your dashboard");
      closeDeleteDialog();
      refetch();
    } catch (err) {
      showError(err?.data?.message || "Failed to delete listing");
    }
  };

  const handleToggleClick = async (listingId) => {
    try {
      await toggleAvailability(listingId || deleteDialog.listingId).unwrap();
      success("Listing availability updated");
      closeDeleteDialog();
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

  const tabs = [
    {
      value: TAB_VALUES.ACTIVE,
      label: "Active",
      shortLabel: "Active",
      description: "Live buyer-visible listings",
      icon: <Inventory2OutlinedIcon />,
      badgeCount: counts.activeCount,
    },
    {
      value: TAB_VALUES.UNAVAILABLE,
      label: "Archived or unavailable",
      shortLabel: "Archived",
      description: "Hidden until restored",
      icon: <ArchiveOutlinedIcon />,
      badgeCount: counts.unavailableCount,
    },
    {
      value: TAB_VALUES.ALL,
      label: "All listings",
      shortLabel: "All",
      description: "Full dashboard inventory",
      icon: <StorefrontOutlinedIcon />,
      badgeCount: counts.totalCount,
    },
  ];

  return (
    <Container maxWidth="xl" sx={{ py: { xs: 2, sm: 3, md: 4 } }}>
      <Stack spacing={{ xs: 2.5, md: 3 }}>
        <Box
          sx={{
            p: { xs: 1.75, sm: 3 },
            borderRadius: 4,
            border: "1px solid",
            borderColor: "divider",
            background:
              theme.palette.mode === "dark"
                ? "linear-gradient(135deg, rgba(144,202,249,0.10), rgba(255,255,255,0.02))"
                : "linear-gradient(135deg, rgba(25,118,210,0.10), rgba(255,255,255,0.92))",
          }}
        >
          <Stack
            direction={{ xs: "column", md: "row" }}
            spacing={2}
            justifyContent="space-between"
            alignItems={{ xs: "stretch", md: "center" }}
          >
            <Box>
              <Typography variant="h4" component="h1" sx={{ fontWeight: 800 }}>
                My Listings
              </Typography>
              <Typography
                variant="body1"
                color="text.secondary"
                sx={{ mt: 1, maxWidth: 860, pr: { md: 2 } }}
              >
                Run your catalog like a seller dashboard. Edit quickly, keep status clear,
                and hide listings from buyers safely when needed.
              </Typography>
            </Box>

            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleCreateClick}
              size="large"
              sx={{ alignSelf: { xs: "stretch", md: "center" } }}
            >
              Create Listing
            </Button>
          </Stack>
        </Box>

        <Grid container spacing={2}>
          {createStatCards(counts).map((card) => (
            <Grid size={{ xs: 6, sm: 6, lg: 3 }} key={card.title}>
              <Box
                sx={{
                  height: "100%",
                  p: { xs: 1.5, sm: 2 },
                  borderRadius: 3,
                  border: "1px solid",
                  borderColor: "divider",
                  bgcolor: "background.paper",
                }}
              >
                <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      {card.title}
                    </Typography>
                    <Typography variant="h4" sx={{ mt: 0.75, fontWeight: 800 }}>
                      {card.value}
                    </Typography>
                  </Box>
                  <Box
                    sx={{
                      p: { xs: 0.85, sm: 1 },
                      borderRadius: 2,
                      bgcolor: "background.default",
                      display: "inline-flex",
                    }}
                  >
                    {card.icon}
                  </Box>
                </Stack>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{
                    mt: 1.25,
                    fontSize: { xs: "0.84rem", sm: "0.95rem" },
                    lineHeight: 1.45,
                  }}
                >
                  {card.description}
                </Typography>
              </Box>
            </Grid>
          ))}
        </Grid>

        <TabsComponent
          value={tabValue}
          onChange={setTabValue}
          tabs={tabs}
          variant="fullWidth"
          showDescriptions
          showBadges
          showIcons
          sx={{
            borderRadius: 3,
            border: "1px solid",
            borderColor: "divider",
            overflow: "hidden",
          }}
          tabSx={{
            minHeight: { xs: 56, sm: 72 },
          }}
        />

        {isFetching && !isLoading && (
          <Alert severity="info" variant="outlined">
            Refreshing your listings…
          </Alert>
        )}

        <ErrorAlert
          error={error}
          show={!!error}
          fallback="Failed to load your listings. Please try again."
        />

        {isLoading ? (
          <Grid container spacing={2}>
            {Array.from({ length: 6 }).map((_, index) => (
              <Grid size={{ xs: 12, md: 6 }} key={`merchant-listing-skeleton-${index}`}>
                <ListingCardSkeleton />
              </Grid>
            ))}
          </Grid>
        ) : filteredListings.length === 0 ? (
          <EmptyState
            icon={<StorefrontOutlinedIcon />}
            title={currentTabMeta.title}
            description={currentTabMeta.description}
            actionLabel={currentTabMeta.actionLabel}
            onAction={currentTabMeta.onAction}
            sx={{
              minHeight: "36vh",
              border: "1px dashed",
              borderColor: "divider",
              borderRadius: 3,
              bgcolor: "background.paper",
            }}
          />
        ) : (
        <Grid container spacing={2}>
          {filteredListings.map((listing) => (
              <Grid size={{ xs: 12, lg: 6 }} key={listing._id}>
                <MerchantListingCard
                  listing={listing}
                  onEdit={handleEditClick}
                  onDelete={handleDeleteClick}
                  onToggle={handleToggleClick}
                />
              </Grid>
            ))}
          </Grid>
        )}
      </Stack>

      <ConfirmDeleteDialog
        open={deleteDialog.open}
        onClose={closeDeleteDialog}
        onDelete={handleDeleteConfirm}
        onToggle={handleToggleClick}
        itemName={deleteDialog.listingName}
        title="Delete Listing"
        toggleLabel="Mark unavailable"
        deleteLabel="Delete listing"
        deletePrompt={
          <>
            Are you sure you want to remove <strong>{deleteDialog.listingName}</strong> from your dashboard?
          </>
        }
        confirmationInstruction={
          <>
            To confirm removing this listing from your dashboard, please type{" "}
            <strong>DELETE</strong> below:
          </>
        }
        warningMessage="This removes the listing from your dashboard and hides it from buyers. Existing orders will remain available for records."
        isLoading={isDeleting || isToggling}
        itemLabel="Listing"
      />
    </Container>
  );
};

export default MyListingsPage;
