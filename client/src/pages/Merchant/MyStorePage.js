import React, { useEffect, useState } from "react";
import {
  Container,
  Box,
  Typography,
  Card,
  CardContent,
  TextField,
  Button,
  Alert,
  Divider,
  Grid,
  Fade,
  useMediaQuery,
  Skeleton,
} from "@mui/material";
import { Save, Store, Info } from "@mui/icons-material";
import { useTheme } from "../../hooks/useTheme";
import { useSnackbar } from "../../hooks/useSnackbar";
import { useMerchant } from "../../features/merchant/hooks/useMerchant";
import ShopStatusBadge from "../../features/merchant/components/ShopStatusBadge";
import ShopBrandingUploader from "../../features/merchant/components/ShopBrandingUploader";

/**
 * MyStorePage Component
 *
 * PURPOSE: Merchant shop management dashboard
 * ROUTE: /merchant/store
 * FEATURES:
 * - Auto-create shop from user profile
 * - Edit shop details (name, description, slug)
 * - Upload logo and banner
 * - View shop statistics
 * - Soft verification status display
 */

function MyStorePage() {
  const { theme } = useTheme();
  const { showSnackbar } = useSnackbar();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const {
    shop,
    isLoading,
    isUpdating,
    error,
    success,
    isNewShop,
    loadMyShop,
    updateMyShop,
    clearErrorMessage,
    clearSuccessMessage,
  } = useMerchant();

  // Form state
  const [formData, setFormData] = useState({
    shopName: "",
    shopSlug: "",
    shopDescription: "",
    businessRegistrationNumber: "",
    taxId: "",
    shopLogo: "",
    shopBanner: "",
  });

  const [hasChanges, setHasChanges] = useState(false);

  // Load shop on mount
  useEffect(() => {
    loadMyShop();
  }, []);

  // Populate form when shop loads
  useEffect(() => {
    if (shop) {
      console.log("Shop data loaded:", shop); // Debug
      console.log("Shop logo:", shop.shopLogo); // Debug
      console.log("Shop banner:", shop.shopBanner); // Debug
      setFormData({
        shopName: shop.shopName || "",
        shopSlug: shop.shopSlug || "",
        shopDescription: shop.shopDescription || "",
        businessRegistrationNumber: shop.businessRegistrationNumber || "",
        taxId: shop.taxId || "",
        shopLogo: shop.shopLogo || "",
        shopBanner: shop.shopBanner || "",
      });
    }
  }, [shop]);

  // Show notifications
  useEffect(() => {
    if (error) {
      showSnackbar(error.message || "An error occurred", "error");
      clearErrorMessage();
    }
  }, [error]);

  useEffect(() => {
    if (success) {
      showSnackbar(success.message || "Shop updated successfully", "success");
      clearSuccessMessage();
      setHasChanges(false);
    }
  }, [success]);

  // Handle form changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setHasChanges(true);

    // Auto-generate slug from shop name
    if (name === "shopName") {
      const slug = value
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-")
        .replace(/^-|-$/g, "");

      setFormData((prev) => ({
        ...prev,
        shopSlug: slug,
      }));
    }
  };

  // Handle save - saves everything including images
  const handleSave = async () => {
    try {
      await updateMyShop(formData);
    } catch (err) {
      // Error handled by useEffect
    }
  };

  // Handle logo upload complete - just update form state
  const handleLogoUploadComplete = (result) => {
    console.log("Logo uploaded to S3:", result.url);
    setFormData((prev) => ({
      ...prev,
      shopLogo: result.url,
    }));
    setHasChanges(true);
    showSnackbar(
      "Logo ready! Click 'Save Changes' to update your shop",
      "info"
    );
  };

  // Handle logo remove - just update form state
  const handleLogoRemove = () => {
    setFormData((prev) => ({
      ...prev,
      shopLogo: "",
    }));
    setHasChanges(true);
  };

  // Handle banner upload complete - just update form state
  const handleBannerUploadComplete = (result) => {
    console.log("Banner uploaded to S3:", result.url);
    setFormData((prev) => ({
      ...prev,
      shopBanner: result.url,
    }));
    setHasChanges(true);
    showSnackbar(
      "Banner ready! Click 'Save Changes' to update your shop",
      "info"
    );
  };

  // Handle banner remove - just update form state
  const handleBannerRemove = () => {
    setFormData((prev) => ({
      ...prev,
      shopBanner: "",
    }));
    setHasChanges(true);
  };

  // Loading skeleton
  if (isLoading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Skeleton variant="text" width={200} height={40} sx={{ mb: 2 }} />
        <Skeleton variant="rectangular" height={200} sx={{ mb: 3 }} />
        <Skeleton variant="rectangular" height={400} />
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Fade in timeout={500}>
        <Box>
          {/* Header */}
          <Box sx={{ mb: 4 }}>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                flexWrap: "wrap",
                gap: 2,
                mb: 1,
              }}
            >
              <Store
                sx={{ fontSize: 32, color: theme.palette.secondary.main }}
              />
              <Typography variant="h4" component="h1" sx={{ fontWeight: 600 }}>
                My Shop
              </Typography>
              {shop && (
                <ShopStatusBadge
                  verificationStatus={shop.verificationStatus}
                  shopStatus={shop.shopStatus}
                />
              )}
            </Box>
            <Typography variant="body1" color="text.secondary">
              Manage your shop profile, branding, and information
            </Typography>
          </Box>

          {/* New Shop Welcome */}
          {isNewShop && (
            <Alert severity="success" icon={<Info />} sx={{ mb: 3 }}>
              <Typography variant="body2">
                <strong>Welcome to your new shop!</strong> We've created your
                shop using your profile information. You can customize it below.
              </Typography>
            </Alert>
          )}

          {/* Verification Status Info */}
          {shop?.verificationStatus === "unverified" && (
            <Alert severity="info" sx={{ mb: 3 }}>
              <Typography variant="body2">
                Your shop is currently <strong>unverified</strong>. Your shop is
                active and visible to buyers, but it will be reviewed by our
                team. Once verified, you'll receive a verification badge.
              </Typography>
            </Alert>
          )}

          {/* Suspended Alert */}
          {shop?.shopStatus === "suspended" && (
            <Alert severity="error" sx={{ mb: 3 }}>
              <Typography variant="body2">
                <strong>Your shop is suspended.</strong> Please contact support
                for more information.
              </Typography>
            </Alert>
          )}

          <Grid container spacing={3}>
            {/* Left Column (Desktop) / Top Section (Mobile) - Branding */}
            <Grid size={{ xs: 12, md: 5 }} order={{ xs: 1, md: 1 }}>
              <Card>
                <CardContent>
                  <Typography
                    variant="h6"
                    gutterBottom
                    sx={{ fontWeight: 600, mb: 3 }}
                  >
                    Shop Branding
                  </Typography>

                  {/* Logo Uploader */}
                  <ShopBrandingUploader
                    type="logo"
                    currentImage={formData.shopLogo}
                    onUploadComplete={handleLogoUploadComplete}
                    onRemove={handleLogoRemove}
                  />

                  <Divider sx={{ my: 3 }} />

                  {/* Banner Uploader */}
                  <ShopBrandingUploader
                    type="banner"
                    currentImage={formData.shopBanner}
                    onUploadComplete={handleBannerUploadComplete}
                    onRemove={handleBannerRemove}
                  />
                </CardContent>
              </Card>
            </Grid>

            {/* Right Column (Desktop) / Bottom Section (Mobile) - Shop Info */}
            <Grid size={{ xs: 12, md: 7 }} order={{ xs: 2, md: 2 }}>
              <Card>
                <CardContent>
                  <Typography
                    variant="h6"
                    gutterBottom
                    sx={{ fontWeight: 600, mb: 3 }}
                  >
                    Shop Information
                  </Typography>

                  <Box component="form" noValidate>
                    {/* Shop Name */}
                    <TextField
                      fullWidth
                      label="Shop Name"
                      name="shopName"
                      value={formData.shopName}
                      onChange={handleChange}
                      required
                      sx={{ mb: 3 }}
                      helperText="This is your shop's display name"
                      inputProps={{ "aria-label": "Shop name" }}
                    />

                    {/* Shop Slug */}
                    <TextField
                      fullWidth
                      label="Shop URL (Slug)"
                      name="shopSlug"
                      value={formData.shopSlug}
                      onChange={handleChange}
                      required
                      sx={{ mb: 3 }}
                      helperText={`Your shop will be at: /merchants/${formData.shopSlug || "your-slug"}`}
                      inputProps={{ "aria-label": "Shop URL slug" }}
                    />

                    {/* Shop Description */}
                    <TextField
                      fullWidth
                      label="Shop Description"
                      name="shopDescription"
                      value={formData.shopDescription}
                      onChange={handleChange}
                      multiline
                      rows={4}
                      sx={{ mb: 3 }}
                      helperText="Tell buyers about your shop (max 500 characters)"
                      inputProps={{
                        maxLength: 500,
                        "aria-label": "Shop description",
                      }}
                    />

                    <Divider sx={{ my: 3 }} />

                    <Typography
                      variant="subtitle1"
                      gutterBottom
                      sx={{ fontWeight: 600, mb: 2 }}
                    >
                      Business Details (Optional)
                    </Typography>

                    {/* Business Registration Number */}
                    <TextField
                      fullWidth
                      label="Business Registration Number"
                      name="businessRegistrationNumber"
                      value={formData.businessRegistrationNumber}
                      onChange={handleChange}
                      sx={{ mb: 3 }}
                      helperText="Your business registration number (if applicable)"
                      inputProps={{
                        "aria-label": "Business registration number",
                      }}
                    />

                    {/* Tax ID */}
                    <TextField
                      fullWidth
                      label="Tax ID"
                      name="taxId"
                      value={formData.taxId}
                      onChange={handleChange}
                      sx={{ mb: 3 }}
                      helperText="Your tax identification number (if applicable)"
                      inputProps={{ "aria-label": "Tax ID" }}
                    />
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Save Button - Full Width at Bottom */}
          <Box sx={{ mt: 3 }}>
            <Card>
              <CardContent>
                <Button
                  variant="contained"
                  size="large"
                  startIcon={<Save />}
                  onClick={handleSave}
                  disabled={!hasChanges || isUpdating}
                  fullWidth
                  aria-label="Save all shop changes"
                  sx={{ py: 1.5 }}
                >
                  {isUpdating ? "Saving..." : "Save All Changes"}
                </Button>

                {hasChanges && (
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ display: "block", textAlign: "center", mt: 1 }}
                  >
                    You have unsaved changes
                  </Typography>
                )}
              </CardContent>
            </Card>

            {/* Info about Analytics */}
            <Alert severity="info" sx={{ mt: 2 }}>
              <Typography variant="body2">
                View detailed shop metrics and analytics in the{" "}
                <strong>Analytics Dashboard</strong>
              </Typography>
            </Alert>
          </Box>
        </Box>
      </Fade>
    </Container>
  );
}

export default MyStorePage;
