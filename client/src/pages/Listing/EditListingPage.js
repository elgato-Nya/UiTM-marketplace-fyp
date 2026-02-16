import { useEffect, useState, useCallback, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Box,
  Container,
  CircularProgress,
  FormControlLabel,
  Switch,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
  Tooltip,
} from "@mui/material";
import {
  Image as ImageIcon,
  Info as InfoIcon,
  Inventory as InventoryIcon,
  Settings as SettingsIcon,
  HelpOutline as HelpIcon,
} from "@mui/icons-material";

import DynamicForm from "../../components/common/Form/DynamicForm";
import ListingImageUpload from "../../components/common/ImageUpload/ListingImageUpload";
import { editListingFormConfig } from "../../config/forms/listingForm";
import {
  useGetListingByIdQuery,
  useUpdateListingMutation,
} from "../../features/listing/api/listingApi";
import BackButton from "../../components/common/Navigation/BackButton";
import ErrorAlert from "../../components/common/Alert/ErrorAlert";
import { useSnackbarContext as useSnackbar } from "../../contexts/SnackbarContext";
import { ROUTES } from "../../constants/routes";
import VariantManager from "../../features/listing/components/VariantManager";
import QuoteSettings from "../../features/listing/components/QuoteSettings";
import listingService from "../../features/listing/service/listingService";
import useListingForm from "../../features/listing/hooks/useListingForm";
import ListingFormLayout from "../../components/listing/ListingFormLayout";

const EditListingPage = () => {
  const { listingId } = useParams();
  const navigate = useNavigate();
  const { success: showSuccess, error: showError } = useSnackbar();
  const [variantLoading, setVariantLoading] = useState(false);

  // Fetch listing data
  const {
    data: currentListing,
    isLoading: fetchLoading,
    error: fetchError,
    refetch: refetchListing,
  } = useGetListingByIdQuery(listingId, {
    skip: !listingId,
  });

  // Extract listing for initialData
  const listing = currentListing?.listing || null;

  // Use centralized form state hook with initialData from fetched listing
  const {
    formData,
    handleFormChange,
    images,
    setImages,
    addImages,
    removeImageByUrl,
    variants,
    setVariants,
    variantsEnabled,
    enableVariants,
    disableVariants,
    quoteSettings,
    updateQuoteSettings,
    isService,
    getSubmitData,
    getValidationErrors,
  } = useListingForm({
    mode: "edit",
    initialData: listing,
  });

  // Track newly uploaded images separately for edit mode
  const [newlyUploadedImages, setNewlyUploadedImages] = useState([]);

  // Confirmation dialog state for disabling variants
  const [showDisableDialog, setShowDisableDialog] = useState(false);

  // Update listing mutation
  const [updateListing, { isLoading: updateLoading, error, isSuccess }] =
    useUpdateListingMutation();

  // Sync fetched data to form when listing loads
  useEffect(() => {
    if (listing?.images) {
      setImages(listing.images);
    }
    if (listing?.variants) {
      setVariants(listing.variants);
    }
  }, [listing, setImages, setVariants]);

  useEffect(() => {
    if (isSuccess) {
      showSuccess("Listing updated successfully!");
      setTimeout(() => {
        navigate(ROUTES.MERCHANT.LISTINGS.MY_LISTINGS, { replace: true });
      }, 500);
    }
  }, [isSuccess, navigate, showSuccess]);

  // Variant handlers - use API for edit mode
  const handleAddVariant = useCallback(
    async (variantData) => {
      setVariantLoading(true);
      try {
        const response = await listingService.addVariant(
          listingId,
          variantData,
        );
        if (response.success) {
          showSuccess("Variant added successfully");
          refetchListing();
        }
      } catch (err) {
        showError(err?.response?.data?.message || "Failed to add variant");
        throw err;
      } finally {
        setVariantLoading(false);
      }
    },
    [listingId, showSuccess, showError, refetchListing],
  );

  const handleUpdateVariant = useCallback(
    async (variantId, variantData) => {
      setVariantLoading(true);
      try {
        const response = await listingService.updateVariant(
          listingId,
          variantId,
          variantData,
        );
        if (response.success) {
          showSuccess("Variant updated successfully");
          refetchListing();
        }
      } catch (err) {
        showError(err?.response?.data?.message || "Failed to update variant");
        throw err;
      } finally {
        setVariantLoading(false);
      }
    },
    [listingId, showSuccess, showError, refetchListing],
  );

  const handleDeleteVariant = useCallback(
    async (variantId) => {
      setVariantLoading(true);
      try {
        const response = await listingService.deleteVariant(
          listingId,
          variantId,
        );
        if (response.success) {
          showSuccess("Variant deleted successfully");
          refetchListing();
        }
      } catch (err) {
        showError(err?.response?.data?.message || "Failed to delete variant");
        throw err;
      } finally {
        setVariantLoading(false);
      }
    },
    [listingId, showSuccess, showError, refetchListing],
  );

  // Variant toggle handlers
  const handleVariantToggle = useCallback(
    (event) => {
      if (event.target.checked) {
        enableVariants();
      } else {
        // If there are existing variants, show confirmation
        if (variants.length > 0) {
          setShowDisableDialog(true);
        } else {
          disableVariants(false);
        }
      }
    },
    [enableVariants, disableVariants, variants.length],
  );

  const handleConfirmDisableVariants = useCallback(() => {
    disableVariants(true); // Clear all variants
    setShowDisableDialog(false);
  }, [disableVariants]);

  const handleCancelDisableVariants = useCallback(() => {
    setShowDisableDialog(false);
  }, []);

  const handleImageUploadComplete = (result) => {
    const uploadedImages = result.data?.images || result.images || [];
    const imageUrls = uploadedImages.map((img) => img.main.url);
    setNewlyUploadedImages((prev) => [...prev, ...imageUrls]);
  };

  const handleDeleteExistingImage = (url) => {
    removeImageByUrl(url);
  };

  const handleDeleteNewImage = useCallback((url) => {
    setNewlyUploadedImages((prev) => prev.filter((img) => img !== url));
  }, []);

  // Memoize form config - now uses single-step fields array
  const formConfig = useMemo(
    () => ({
      ...editListingFormConfig,
      title: null,
      subtitle: null,
      allowQuickSave: true,
      // Use top-level fields (single-step form)
      fields: (editListingFormConfig.fields || []).filter(
        (field) => field.name !== "images",
      ),
      // Clear steps to ensure single-step rendering
      steps: [],
    }),
    [],
  );

  const handleSubmit = useCallback(async () => {
    try {
      // Run validation and get explicit error messages
      const validationErrors = getValidationErrors();
      if (validationErrors.length > 0) {
        // Show first 3 errors
        const errorMessages = validationErrors.slice(0, 3).join(". ");
        const moreCount = validationErrors.length - 3;
        const moreText = moreCount > 0 ? ` (+${moreCount} more errors)` : "";
        showError(`${errorMessages}${moreText}`);
        return;
      }

      // Get prepared data from hook
      const listingData = getSubmitData();

      // Merge existing images with newly uploaded images
      listingData.images = [...images, ...newlyUploadedImages];

      await updateListing({ id: listingId, ...listingData }).unwrap();
    } catch (err) {
      console.error("Failed to update listing:", err);

      let errorMessage = "Failed to update listing";

      if (err?.data?.message) {
        errorMessage = err.data.message;
      } else if (err?.data?.errors && Array.isArray(err.data.errors)) {
        errorMessage = err.data.errors
          .map((e) => e.msg || e.message)
          .join(". ");
      } else if (err?.message) {
        errorMessage = err.message;
      }

      showError(errorMessage);
    }
  }, [
    getValidationErrors,
    getSubmitData,
    images,
    newlyUploadedImages,
    listingId,
    updateListing,
    showError,
  ]);

  // Compute all images
  const allImages = useMemo(
    () => [...images, ...newlyUploadedImages],
    [images, newlyUploadedImages],
  );

  // Check if details section is complete
  const isDetailsComplete = useMemo(() => {
    const hasName = !!formData.name;
    const hasType = !!formData.type;
    const hasDescription = !!formData.description;
    const hasCategory = !!formData.category;
    // Price not required if free, quote-only, or has variants
    const hasPriceOrFree =
      formData.isFree ||
      formData.isQuoteOnly ||
      variantsEnabled ||
      (formData.price !== "" && formData.price >= 0);
    const hasStockOrService =
      formData.type === "service" ||
      (formData.stock !== "" && formData.stock >= 0);

    return (
      hasName &&
      hasType &&
      hasDescription &&
      hasCategory &&
      hasPriceOrFree &&
      hasStockOrService
    );
  }, [
    formData.name,
    formData.type,
    formData.description,
    formData.category,
    formData.price,
    formData.isFree,
    formData.isQuoteOnly,
    formData.stock,
    variantsEnabled,
  ]);

  // Check if images section is complete
  const isImagesComplete = allImages.length > 0;

  // Define sections for the layout
  const sections = useMemo(() => {
    const baseSections = [
      {
        id: "details",
        title: "Listing Details",
        description: "Basic information about your product or service",
        icon: <InfoIcon />,
        isComplete: isDetailsComplete,
        defaultExpanded: true,
        content: (
          <>
            {error && (
              <ErrorAlert
                error={error}
                show={!!error}
                fallback="Failed to update listing. Please try again."
                sx={{ mb: 3 }}
              />
            )}
            <DynamicForm
              config={formConfig}
              onSubmit={handleSubmit}
              isLoading={updateLoading}
              values={formData}
              onChange={handleFormChange}
              hideSubmitButton
            />
          </>
        ),
      },
      {
        id: "images",
        title: "Images",
        description: "Upload up to 10 photos. First image will be the cover.",
        icon: <ImageIcon />,
        badge: `${allImages.length}`,
        isComplete: isImagesComplete,
        defaultExpanded: false,
        content: (
          <>
            <ListingImageUpload
              listingId={listingId}
              existingImages={images}
              newlyUploadedImages={newlyUploadedImages}
              onUploadComplete={handleImageUploadComplete}
              onDeleteExisting={handleDeleteExistingImage}
              onDeleteNew={handleDeleteNewImage}
              maxImages={10}
            />
            {allImages.length === 0 && (
              <Box
                sx={{
                  mt: 2,
                  p: 2,
                  borderRadius: 1,
                  bgcolor: (theme) =>
                    theme.palette.mode === "dark"
                      ? "rgba(255, 167, 38, 0.08)"
                      : "rgba(237, 108, 2, 0.08)",
                  border: "1px solid",
                  borderColor: (theme) =>
                    theme.palette.mode === "dark"
                      ? "rgba(255, 167, 38, 0.3)"
                      : "rgba(237, 108, 2, 0.3)",
                  display: "flex",
                  alignItems: "center",
                  gap: 1.5,
                }}
              >
                <ImageIcon
                  sx={{
                    color: (theme) =>
                      theme.palette.mode === "dark"
                        ? "warning.light"
                        : "warning.dark",
                    fontSize: 20,
                  }}
                />
                <Typography
                  variant="body2"
                  sx={{
                    color: (theme) =>
                      theme.palette.mode === "dark"
                        ? "warning.light"
                        : "warning.dark",
                  }}
                >
                  Listing must have at least one image.
                </Typography>
              </Box>
            )}
          </>
        ),
      },
      {
        id: "variants",
        title: "Variants",
        description: "Add options like sizes, colors, or configurations",
        icon: <InventoryIcon />,
        badge:
          variantsEnabled && variants.length > 0
            ? `${variants.length}`
            : undefined,
        // Complete if: variants disabled OR (variants enabled AND has variants)
        isComplete:
          !variantsEnabled || (variantsEnabled && variants.length > 0),
        optional: true,
        defaultExpanded: variantsEnabled,
        content: (
          <Box>
            {/* Variant Toggle */}
            <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
              <FormControlLabel
                control={
                  <Switch
                    checked={variantsEnabled}
                    onChange={handleVariantToggle}
                    disabled={updateLoading}
                    color="primary"
                  />
                }
                label={
                  <Typography variant="body1" fontWeight={500}>
                    Enable {formData.type === "service" ? "service" : "product"}{" "}
                    variants
                  </Typography>
                }
              />
              <Tooltip
                title={
                  formData.type === "service"
                    ? "Variants allow you to offer different service options like duration, packages, or tiers. Each variant can have its own price."
                    : "Variants allow you to offer different options like sizes, colors, or materials. Each variant can have its own price and stock."
                }
                arrow
                placement="right"
              >
                <HelpIcon
                  sx={{ ml: 1, color: "text.secondary", fontSize: 20 }}
                />
              </Tooltip>
            </Box>

            {/* Variant Manager - Only show when enabled */}
            {variantsEnabled ? (
              <VariantManager
                variants={variants}
                listingType={formData.type}
                onAddVariant={handleAddVariant}
                onUpdateVariant={handleUpdateVariant}
                onDeleteVariant={handleDeleteVariant}
                onBulkChange={setVariants}
                isLoading={variantLoading}
                disabled={updateLoading}
                defaultMode="builder"
              />
            ) : (
              <Box
                sx={{
                  mt: 1,
                  p: 2,
                  borderRadius: 1,
                  bgcolor: (theme) =>
                    theme.palette.mode === "dark"
                      ? "rgba(33, 150, 243, 0.08)"
                      : "rgba(2, 136, 209, 0.08)",
                  border: "1px dashed",
                  borderColor: (theme) =>
                    theme.palette.mode === "dark"
                      ? "rgba(33, 150, 243, 0.3)"
                      : "rgba(2, 136, 209, 0.3)",
                  display: "flex",
                  alignItems: "center",
                  gap: 1.5,
                }}
              >
                <InfoIcon
                  sx={{
                    color: (theme) =>
                      theme.palette.mode === "dark"
                        ? "info.light"
                        : "info.dark",
                    fontSize: 20,
                  }}
                />
                <Typography
                  variant="body2"
                  sx={{
                    color: "text.secondary",
                  }}
                >
                  {formData.type === "service"
                    ? "Enable variants to offer different service options (e.g., Basic/Standard/Premium, 1hr/2hr/Full Day)."
                    : "Enable variants to sell products with different options (e.g., Small/Medium/Large, Red/Blue/Green)."}
                </Typography>
              </Box>
            )}
          </Box>
        ),
      },
    ];

    // Add Quote Settings for services
    if (isService) {
      baseSections.push({
        id: "quotes",
        title: "Quote Settings",
        description: "Configure how customers request quotes",
        icon: <SettingsIcon />,
        isComplete: true, // Has defaults
        optional: true,
        defaultExpanded: false,
        content: (
          <QuoteSettings
            settings={quoteSettings}
            onChange={updateQuoteSettings}
            disabled={updateLoading}
            isLoading={updateLoading}
          />
        ),
      });
    }

    return baseSections;
  }, [
    formConfig,
    formData,
    handleFormChange,
    images,
    allImages,
    newlyUploadedImages,
    variants,
    variantsEnabled,
    quoteSettings,
    isService,
    updateLoading,
    variantLoading,
    isDetailsComplete,
    isImagesComplete,
    error,
    listingId,
    handleSubmit,
    handleImageUploadComplete,
    handleDeleteExistingImage,
    handleDeleteNewImage,
    handleAddVariant,
    handleUpdateVariant,
    handleDeleteVariant,
    handleVariantToggle,
    setVariants,
    updateQuoteSettings,
  ]);

  // Loading state
  if (fetchLoading) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          minHeight="60vh"
        >
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  // Error state
  if (!listing) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <ErrorAlert
          show={true}
          error={fetchError}
          fallback="Listing not found."
        />
        <BackButton sx={{ mt: 2 }} />
      </Container>
    );
  }

  return (
    <>
      <ListingFormLayout
        title="Edit Listing"
        subtitle="Update your listing details"
        sections={sections}
        onPublish={handleSubmit}
        isLoading={updateLoading}
        showDraftButton={false}
        publishLabel="Save Changes"
      >
        <BackButton sx={{ mb: 2 }} />
      </ListingFormLayout>

      {/* Confirmation Dialog for Disabling Variants */}
      <Dialog
        open={showDisableDialog}
        onClose={handleCancelDisableVariants}
        aria-labelledby="disable-variants-dialog-title"
      >
        <DialogTitle id="disable-variants-dialog-title">
          Disable Variants?
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            You have {variants.length} variant{variants.length !== 1 ? "s" : ""}{" "}
            configured. Disabling variants will remove all of them. This action
            cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancelDisableVariants} color="inherit">
            Cancel
          </Button>
          <Button
            onClick={handleConfirmDisableVariants}
            color="error"
            variant="contained"
          >
            Disable & Remove
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default EditListingPage;
