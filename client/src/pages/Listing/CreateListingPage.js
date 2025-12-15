import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Box, Typography, Container, Button, Paper } from "@mui/material";

import DynamicForm from "../../components/common/Form/DynamicForm";
import { ListingImageUpload } from "../../components/common/ImageUpload";
import { createListingFormConfig } from "../../config/forms/listingForm";
import { useCreateListingMutation } from "../../features/listing/api/listingApi";
import { useAuth } from "../../features/auth/hooks/useAuth";
import { useImageUpload } from "../../hooks/useImageUpload";
import { BackButton } from "../../components/common/Navigation";
import {
  ErrorAlert,
  SuccessAlert,
  InfoAlert,
} from "../../components/common/Alert";
import { useSnackbarContext as useSnackbar } from "../../contexts/SnackbarContext";
import { ROUTES } from "../../constants/routes";

const CreateListingPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { success: showSuccess, error: showError } = useSnackbar();
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [existingImageUrls, setExistingImageUrls] = useState([]);
  const [createListing, { isLoading, error, isSuccess }] =
    useCreateListingMutation();
  const { uploadListing, isUploading, uploadProgress } = useImageUpload();

  useEffect(() => {
    if (isSuccess) {
      showSuccess("Listing created successfully!");
      // Redirect to My Listings - RTK Query will auto-refetch
      setTimeout(() => {
        navigate(ROUTES.MERCHANT.LISTINGS.MY_LISTINGS, { replace: true });
      }, 500);
    }
  }, [isSuccess, navigate, showSuccess]);

  // Cleanup on unmount only
  useEffect(() => {
    return () => {
      setSelectedFiles([]);
      setExistingImageUrls([]);
    };
  }, []);

  const handleFilesSelected = (files) => {
    setSelectedFiles(files);
  };

  const handleImageUploadComplete = (result) => {
    // result is { success, data: { images, count }, message }
    const images = result.data?.images || result.images || [];
    const imageUrls = images.map((img) => img.main.url);
    setExistingImageUrls((prev) => [...prev, ...imageUrls]);
    // Clear selected files after successful upload
    setSelectedFiles([]);
  };

  const handleSubmit = async (data) => {
    try {
      const listingData = { ...data };

      // Use already uploaded images
      listingData.images = existingImageUrls;

      if (listingData.isFree) {
        listingData.price = 0;
      }

      // Convert stock to number or remove for services
      if (listingData.type === "product") {
        listingData.stock = parseInt(listingData.stock) || 0;
      } else {
        delete listingData.stock;
      }

      // Convert price to number
      listingData.price = parseFloat(listingData.price) || 0;

      // Create listing - RTK Query will auto-invalidate cache
      await createListing(listingData).unwrap();
    } catch (error) {
      console.error("Failed to create listing:", error);
      showError(error?.data?.message || "Failed to create listing");
    }
  };

  // Remove images field from form config
  const formConfigWithoutImages = {
    ...createListingFormConfig,
    steps: createListingFormConfig.steps
      .map((step) => ({
        ...step,
        fields: step.fields.filter((field) => field.name !== "images"),
      }))
      .filter((step) => step.fields.length > 0), // Remove empty steps
  };

  return (
    <Container
      maxWidth="md"
      sx={{ py: 4 }}
      component="article"
      aria-labelledby="page-title"
    >
      {/** Professional Back Button */}
      <BackButton sx={{ mb: 3 }} />

      {/* Page Header Section */}
      <Box component="header" sx={{ mb: 4 }}>
        <Typography
          id="page-title"
          variant="h4"
          component="h1"
          gutterBottom
          color="primary"
          sx={{ fontWeight: 600 }}
        >
          Create New Listing
        </Typography>
        <Typography variant="body1" color="text.secondary" component="p">
          Add exciting products or services to your store
        </Typography>
      </Box>

      {/* Alert Messages Section */}
      <Box
        component="section"
        aria-live="polite"
        aria-atomic="true"
        sx={{ mb: 3 }}
      >
        <ErrorAlert
          error={error}
          show={!!error}
          fallback="Failed to create listing. Please try again."
        />
        {isUploading && (
          <InfoAlert
            message={`Uploading images: ${uploadProgress}%`}
            show={uploadProgress > 0 && uploadProgress < 100}
          />
        )}
      </Box>

      {/* Main Form Container */}
      <Paper elevation={2} sx={{ p: 3, mb: 4 }}>
        {/* Image Upload Section */}
        <Typography
          variant="h6"
          sx={{ mb: 1, fontWeight: "medium" }}
          color="primary"
        >
          Listing Images
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Select images for your listing. Images will be uploaded when you
          create the listing. You can upload up to 10 images.
        </Typography>
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ mb: 3, display: "block" }}
        >
          Current images: {existingImageUrls.length} / 10
        </Typography>
        <ListingImageUpload
          listingId="temp"
          existingImages={existingImageUrls}
          onUploadComplete={handleImageUploadComplete}
          onDeleteExisting={(url) => {
            setExistingImageUrls((prev) => prev.filter((img) => img !== url));
          }}
          maxImages={10}
        />
      </Paper>

      {/* Form Fields */}
      <DynamicForm
        config={{
          ...formConfigWithoutImages,
          title: null,
          subtitle: null,
        }}
        onSubmit={handleSubmit}
        isLoading={isLoading || isUploading}
      />
    </Container>
  );
};

export default CreateListingPage;
