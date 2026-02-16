import { useEffect, useMemo, useCallback, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
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
import { createListingFormConfig } from "../../config/forms/listingForm";
import { useCreateListingMutation } from "../../features/listing/api/listingApi";
import BackButton from "../../components/common/Navigation/BackButton";
import ErrorAlert from "../../components/common/Alert/ErrorAlert";
import { useSnackbarContext as useSnackbar } from "../../contexts/SnackbarContext";
import { ROUTES } from "../../constants/routes";
import VariantManager from "../../features/listing/components/VariantManager";
import QuoteSettings from "../../features/listing/components/QuoteSettings";
import useListingForm from "../../features/listing/hooks/useListingForm";
import ListingFormLayout from "../../components/listing/ListingFormLayout";

const CreateListingPage = () => {
  const navigate = useNavigate();
  const { success: showSuccess, error: showError } = useSnackbar();

  // Centralized form state hook
  const {
    formData,
    handleFormChange,
    images,
    addImages,
    removeImageByUrl,
    variants,
    setVariants,
    addVariant,
    updateVariant,
    removeVariant,
    variantsEnabled,
    enableVariants,
    disableVariants,
    quoteSettings,
    updateQuoteSettings,
    isService,
    isDirty,
    getSubmitData,
    getValidationErrors,
    saveDraft,
    loadDraft,
    clearDraft,
    hasDraft,
    lastSaved,
  } = useListingForm({
    mode: "create",
    draftKey: "listing_draft_create",
  });

  // Confirmation dialog state for disabling variants
  const [showDisableDialog, setShowDisableDialog] = useState(false);
  // Restore draft dialog state
  const [showRestoreDialog, setShowRestoreDialog] = useState(false);
  const [draftChecked, setDraftChecked] = useState(false);

  const [createListing, { isLoading, error, isSuccess }] =
    useCreateListingMutation();

  // Check for existing draft on mount
  useEffect(() => {
    if (!draftChecked && hasDraft()) {
      setShowRestoreDialog(true);
      setDraftChecked(true);
    }
  }, [draftChecked, hasDraft]);

  // Auto-save every 30 seconds when form is dirty
  useEffect(() => {
    if (!isDirty) return;

    const autoSaveInterval = setInterval(() => {
      saveDraft();
    }, 30000); // 30 seconds

    return () => clearInterval(autoSaveInterval);
  }, [isDirty, saveDraft]);

  useEffect(() => {
    if (isSuccess) {
      clearDraft();
      showSuccess("Listing created successfully!");
      setTimeout(() => {
        navigate(ROUTES.MERCHANT.LISTINGS.MY_LISTINGS, { replace: true });
      }, 500);
    }
  }, [isSuccess, navigate, showSuccess, clearDraft]);

  // Restore draft handlers
  const handleRestoreDraft = useCallback(() => {
    loadDraft();
    setShowRestoreDialog(false);
    showSuccess("Draft restored successfully");
  }, [loadDraft, showSuccess]);

  const handleDiscardDraft = useCallback(() => {
    clearDraft();
    setShowRestoreDialog(false);
  }, [clearDraft]);

  const handleImageUploadComplete = useCallback(
    (result) => {
      const uploadedImages = result.data?.images || result.images || [];
      const imageUrls = uploadedImages.map((img) => img.main.url);
      addImages(imageUrls);
    },
    [addImages],
  );

  const handleDeleteImage = useCallback(
    (url) => {
      removeImageByUrl(url);
    },
    [removeImageByUrl],
  );

  // Variant handlers
  const handleAddVariant = useCallback(
    async (variantData) => {
      addVariant(variantData);
      return { success: true };
    },
    [addVariant],
  );

  const handleUpdateVariant = useCallback(
    async (variantId, variantData) => {
      updateVariant(variantId, variantData);
      return { success: true };
    },
    [updateVariant],
  );

  const handleDeleteVariant = useCallback(
    async (variantId) => {
      removeVariant(variantId);
      return { success: true };
    },
    [removeVariant],
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

  const handleSaveDraft = useCallback(() => {
    saveDraft();
    showSuccess("Draft saved locally");
  }, [saveDraft, showSuccess]);

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

      const listingData = getSubmitData();

      await createListing(listingData).unwrap();
    } catch (err) {
      console.error("Failed to create listing:", err);

      let errorMessage = "Failed to create listing";

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
  }, [getValidationErrors, getSubmitData, createListing, showError]);

  // Memoize form config - now uses single-step fields array
  const formConfigWithoutImages = useMemo(
    () => ({
      ...createListingFormConfig,
      title: null,
      subtitle: null,
      // Use top-level fields (single-step form)
      fields: (createListingFormConfig.fields || []).filter(
        (field) => field.name !== "images",
      ),
      // Clear steps to ensure single-step rendering
      steps: [],
    }),
    [],
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
  const isImagesComplete = images.length > 0;

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
                fallback="Failed to create listing. Please try again."
                sx={{ mb: 3 }}
              />
            )}
            <DynamicForm
              config={formConfigWithoutImages}
              onSubmit={handleSubmit}
              isLoading={isLoading}
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
        badge: `${images.length}`,
        isComplete: isImagesComplete,
        defaultExpanded: false,
        content: (
          <>
            <ListingImageUpload
              listingId="temp"
              existingImages={images}
              onUploadComplete={handleImageUploadComplete}
              onDeleteExisting={handleDeleteImage}
              maxImages={10}
            />
            {images.length === 0 && (
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
                  Please upload at least one image before creating your listing.
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
                    disabled={isLoading}
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
                defaultPrice={parseFloat(formData.price) || 0}
                defaultStock={parseInt(formData.stock) || 0}
                isLoading={false}
                disabled={isLoading}
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
            disabled={isLoading}
            isLoading={isLoading}
          />
        ),
      });
    }

    return baseSections;
  }, [
    formConfigWithoutImages,
    formData,
    handleFormChange,
    images,
    variants,
    variantsEnabled,
    quoteSettings,
    isService,
    isLoading,
    isDetailsComplete,
    isImagesComplete,
    error,
    handleSubmit,
    handleImageUploadComplete,
    handleDeleteImage,
    handleAddVariant,
    handleUpdateVariant,
    handleDeleteVariant,
    handleVariantToggle,
    setVariants,
    updateQuoteSettings,
  ]);

  return (
    <>
      <ListingFormLayout
        title="Create New Listing"
        subtitle="Add a new product or service to your store"
        sections={sections}
        onSaveDraft={handleSaveDraft}
        onPublish={handleSubmit}
        isLoading={isLoading}
        showDraftButton
        publishLabel="Create Listing"
        lastSaved={lastSaved}
      >
        <BackButton to={ROUTES.MERCHANT.LISTINGS.MY_LISTINGS} sx={{ mb: 2 }} />
      </ListingFormLayout>

      {/* Restore Draft Dialog */}
      <Dialog
        open={showRestoreDialog}
        aria-labelledby="restore-draft-dialog-title"
      >
        <DialogTitle id="restore-draft-dialog-title">
          Restore Previous Draft?
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            You have an unsaved draft from a previous session. Would you like to
            restore it or start fresh?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDiscardDraft} color="inherit">
            Start Fresh
          </Button>
          <Button
            onClick={handleRestoreDraft}
            color="primary"
            variant="contained"
          >
            Restore Draft
          </Button>
        </DialogActions>
      </Dialog>

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

export default CreateListingPage;
