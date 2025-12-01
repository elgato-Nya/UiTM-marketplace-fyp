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
import useListings from "../../features/listing/hooks/useListings";
import useListingActions from "../../features/listing/hooks/useListingActions";
import { BackButton } from "../../components/common/Navigation";
import {
  ErrorAlert,
  SuccessAlert,
  InfoAlert,
} from "../../components/common/Alert";

const EditListingPage = () => {
  const { listingId } = useParams();
  const navigate = useNavigate();
  const [existingImages, setExistingImages] = useState([]);
  const [newlyUploadedImages, setNewlyUploadedImages] = useState([]);
  const {
    currentListing,
    isLoading: fetchLoading,
    getListingById,
    clearCurrent,
  } = useListings();
  const {
    isLoading: updateLoading,
    error,
    success,
    uploadProgress,
    handleUpdateListing,
    goToMyListings,
    clearMessages,
  } = useListingActions();

  useEffect(() => {
    clearMessages();
  }, []);

  useEffect(() => {
    if (listingId) {
      getListingById(listingId);
    }
    return () => {
      clearCurrent();
      setExistingImages([]);
      setNewlyUploadedImages([]);
    };
  }, [listingId]);

  useEffect(() => {
    if (currentListing?.images) {
      setExistingImages(currentListing.images);
    }
  }, [currentListing]);

  useEffect(() => {
    if (success) {
      setTimeout(() => {
        goToMyListings();
        clearMessages();
      }, 500);
    }
  }, [success, goToMyListings, clearMessages]);

  const handleImageUploadComplete = (result) => {
    // result is { success, data: { images, count }, message }
    const images = result.data?.images || result.images || [];
    const imageUrls = images.map((img) => img.main.url);
    setNewlyUploadedImages((prev) => [...prev, ...imageUrls]);
  };

  const handleDeleteExistingImage = (url) => {
    setExistingImages((prev) => prev.filter((img) => img !== url));
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

  if (!currentListing) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <ErrorAlert show={true} message="Listing not found." />
        <BackButton sx={{ mt: 2 }} />
      </Container>
    );
  }

  const handleSubmit = async (formData) => {
    const listingData = { ...formData };

    // Merge existing images with newly uploaded images
    listingData.images = [...existingImages, ...newlyUploadedImages];

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

    // Pass null for images param since they're already uploaded/managed
    await handleUpdateListing(listingId, listingData, null);
  };

  // Prepare default values from current listing (without images)
  const formConfig = {
    ...editListingFormConfig,
    title: null, // Remove title since we show it above
    subtitle: null, // Remove subtitle since we show it above
    allowQuickSave: true, // Enable quick jump to save button
    defaultValues: {
      type: currentListing.type,
      name: currentListing.name,
      description: currentListing.description,
      category: currentListing.category,
      price: currentListing.price,
      stock: currentListing.stock || 0,
      isFree: currentListing.isFree,
      isAvailable: currentListing.isAvailable,
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
        <SuccessAlert
          message="Listing updated successfully! Redirecting..."
          show={success}
        />
        <ErrorAlert
          error={error}
          show={!!error}
          fallback="Failed to update listing. Please try again."
        />
        <InfoAlert
          message={`Uploading Images: ${uploadProgress}%`}
          show={uploadProgress > 0 && uploadProgress < 100}
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
          existingImages={allImages}
          onUploadComplete={handleImageUploadComplete}
          onDeleteExisting={handleDeleteExistingImage}
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
