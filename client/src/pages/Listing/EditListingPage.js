import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Box,
  Container,
  Button,
  CircularProgress,
  Paper,
  Typography,
} from "@mui/material";

import { useTheme } from "../../hooks/useTheme";
import DynamicForm from "../../components/common/Form/DynamicForm";
import { ListingImageUpload } from "../../components/common/ImageUpload";
import { editListingFormConfig } from "../../config/forms/listingForm";
import {
  useGetListingByIdQuery,
  useUpdateListingMutation,
} from "../../features/listing/api/listingApi";
import { BackButton } from "../../components/common/Navigation";
import {
  ErrorAlert,
  SuccessAlert,
  InfoAlert,
} from "../../components/common/Alert";
import { useSnackbarContext as useSnackbar } from "../../contexts/SnackbarContext";
import { ROUTES } from "../../constants/routes";

const EditListingPage = () => {
  const { listingId } = useParams();
  const navigate = useNavigate();
  const { success: showSuccess, error: showError } = useSnackbar();
  const [existingImages, setExistingImages] = useState([]);
  const [newlyUploadedImages, setNewlyUploadedImages] = useState([]);

  // Fetch listing data
  const {
    data: currentListing,
    isLoading: fetchLoading,
    error: fetchError,
  } = useGetListingByIdQuery(listingId, {
    skip: !listingId,
  });

  // Update listing mutation
  const [updateListing, { isLoading: updateLoading, error, isSuccess }] =
    useUpdateListingMutation();

  useEffect(() => {
    if (currentListing?.listing?.images) {
      setExistingImages(currentListing.listing.images);
    }
  }, [currentListing]);

  useEffect(() => {
    if (isSuccess) {
      showSuccess("Listing updated successfully!");
      // Redirect to My Listings - RTK Query will auto-refetch
      setTimeout(() => {
        navigate(ROUTES.MERCHANT.LISTINGS.MY_LISTINGS, { replace: true });
      }, 500);
    }
  }, [isSuccess, navigate, showSuccess]);

  useEffect(() => {
    return () => {
      setExistingImages([]);
      setNewlyUploadedImages([]);
    };
  }, []);

  const handleImageUploadComplete = (result) => {
    // result is { success, data: { images, count }, message }
    const images = result.data?.images || result.images || [];
    const imageUrls = images.map((img) => img.main.url);
    setNewlyUploadedImages((prev) => [...prev, ...imageUrls]);
  };

  const handleDeleteExistingImage = (url) => {
    setExistingImages((prev) => prev.filter((img) => img !== url));
  };

  const handleDeleteNewImage = (url) => {
    setNewlyUploadedImages((prev) => prev.filter((img) => img !== url));
  };

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

  if (!currentListing?.listing) {
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

  const listing = currentListing.listing;

  const handleSubmit = async (formData) => {
    try {
      const listingData = { ...formData };

      // Merge existing images with newly uploaded images
      listingData.images = [...existingImages, ...newlyUploadedImages];

      // Validate that at least one image exists
      if (!listingData.images || listingData.images.length === 0) {
        showError("Listing must have at least one image");
        return;
      }

      // Convert isFree listing price to 0
      if (listingData.isFree) {
        listingData.price = 0;
      }

      // Handle stock for products only
      if (listingData.type === "product") {
        listingData.stock = parseInt(listingData.stock) || 0;
      } else {
        delete listingData.stock;
      }

      // Ensure price is a number
      listingData.price = parseFloat(listingData.price) || 0;

      // Update listing - RTK Query will auto-invalidate cache
      await updateListing({ id: listingId, ...listingData }).unwrap();
    } catch (error) {
      console.error("Failed to update listing:", error);

      // Enhanced error message handling
      let errorMessage = "Failed to update listing";

      if (error?.data?.message) {
        errorMessage = error.data.message;
      } else if (error?.data?.errors && Array.isArray(error.data.errors)) {
        // Handle validation errors array
        errorMessage = error.data.errors
          .map((err) => err.msg || err.message)
          .join(". ");
      } else if (error?.message) {
        errorMessage = error.message;
      }

      showError(errorMessage);
    }
  };

  // Prepare default values from current listing (without images)
  const formConfig = {
    ...editListingFormConfig,
    title: null, // Remove title since we show it above
    subtitle: null, // Remove subtitle since we show it above
    allowQuickSave: true, // Enable quick jump to save button
    defaultValues: {
      type: listing.type,
      name: listing.name,
      description: listing.description,
      category: listing.category,
      price: listing.price,
      stock: listing.stock || 0,
      isFree: listing.isFree,
      isAvailable: listing.isAvailable,
    },
    // Remove images field from form config
    steps: editListingFormConfig.steps
      .map((step) => ({
        ...step,
        fields: step.fields.filter((field) => field.name !== "images"),
      }))
      .filter((step) => step.fields.length > 0), // Remove empty steps
  };

  // Calculate all images for display
  const allImages = [...existingImages, ...newlyUploadedImages];

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      {/** Professional Back Button */}
      <BackButton label="Back to Listing" sx={{ mb: 3 }} />

      {/* Page Header Section */}
      <Box component="header" sx={{ mb: 4 }}>
        <Typography
          variant="h4"
          component="h1"
          gutterBottom
          color="primary"
          sx={{ fontWeight: 600 }}
        >
          Edit Listing
        </Typography>
        <Typography variant="body1" color="text.secondary" component="p">
          Update your listing details and images
        </Typography>
      </Box>

      {/** Alert Messages Section */}
      <Box
        component="section"
        aria-live="polite"
        aria-atomic="true"
        sx={{ mb: 3 }}
      >
        <ErrorAlert
          error={error}
          show={!!error}
          fallback="Failed to update listing. Please try again."
        />
      </Box>

      {/* Image Upload Section */}
      <Paper elevation={2} sx={{ p: 3, mb: 4 }}>
        <Typography
          variant="h6"
          sx={{ mb: 1, fontWeight: "medium" }}
          color="primary"
        >
          Listing Images
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Manage your listing images. You can keep existing images, delete them,
          or upload new ones (up to 10 total).
        </Typography>
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ mb: 3, display: "block" }}
        >
          Current images: {allImages.length} / 10
        </Typography>
        <ListingImageUpload
          listingId={listingId}
          existingImages={existingImages}
          newlyUploadedImages={newlyUploadedImages}
          onUploadComplete={handleImageUploadComplete}
          onDeleteExisting={handleDeleteExistingImage}
          onDeleteNew={handleDeleteNewImage}
          maxImages={10}
        />
      </Paper>

      {/** Edit Listing Form */}
      <DynamicForm
        config={formConfig}
        onSubmit={handleSubmit}
        isLoading={updateLoading}
      />
    </Container>
  );
};

export default EditListingPage;
