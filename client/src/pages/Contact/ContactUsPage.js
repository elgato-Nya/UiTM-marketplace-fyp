import React, { useState } from "react";
import {
  Container,
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Grid,
  CircularProgress,
  Divider,
} from "@mui/material";
import { Send } from "@mui/icons-material";
import { useSnackbar } from "../../hooks/useSnackbar";
import { useAuth } from "../../features/auth/hooks/useAuth";
import api from "../../services/api/index";
import ContactTypeSelector from "../../components/Contact/ContactTypeSelector";
import ImageUploadField from "../../components/Contact/ImageUploadField";
import ContactInfoCard from "../../components/Contact/ContactInfoCard";
import FormAlerts from "../../components/Contact/FormAlerts";
import ContactFormFields from "../../components/Contact/ContactFormFields";
import BugDetailsSection from "../../components/Contact/BugDetailsSection";
import CollaborationDetailsSection from "../../components/Contact/CollaborationDetailsSection";
import { contactValidator } from "../../utils/validators/contactValidator";

/**
 * Contact Us Page
 *
 * PURPOSE: Allow users to submit bug reports, enquiries, feedback, and collaboration requests
 * FEATURES:
 * - Multiple submission types with dynamic forms
 * - Guest and authenticated user support
 * - Image upload for bugs and feedback (with validation)
 * - Pre-filled information for logged-in users
 * - Proper validation using contactValidator
 * - Responsive design with reusable components
 */

function ContactUsPage() {
  const { success, error: showError } = useSnackbar();
  const { isAuthenticated, user } = useAuth();
  const [formData, setFormData] = useState({
    type: "enquiry",
    name: isAuthenticated ? user?.profile?.username || "" : "",
    email: isAuthenticated ? user?.email || "" : "",
    phoneNumber: isAuthenticated ? user?.profile?.phoneNumber || "" : "",
    subject: "",
    message: "",
    // Bug-specific fields
    bugSeverity: "medium",
    expectedBehavior: "",
    actualBehavior: "",
    stepsToReproduce: "",
    browser: "",
    deviceType: "desktop",
    // Collaboration-specific fields
    proposalType: "partnership",
    organizationName: "",
    website: "",
  });

  const [images, setImages] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear validation error for this field
    if (validationErrors[name]) {
      setValidationErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleTypeChange = (newType) => {
    setFormData((prev) => ({ ...prev, type: newType }));
    // Clear images if switching away from bug_report/feedback
    if (!["bug_report", "feedback"].includes(newType)) {
      setImages([]);
    }
  };

  const validateForm = () => {
    const errors = {};

    const nameValidation = contactValidator.validateName(formData.name);
    if (!nameValidation.valid) errors.name = nameValidation.error;

    const emailValidation = contactValidator.validateEmail(formData.email);
    if (!emailValidation.valid) errors.email = emailValidation.error;

    if (formData.phoneNumber) {
      const phoneValidation = contactValidator.validatePhoneNumber(
        formData.phoneNumber
      );
      if (!phoneValidation.valid) errors.phoneNumber = phoneValidation.error;
    }

    const subjectValidation = contactValidator.validateSubject(
      formData.subject
    );
    if (!subjectValidation.valid) errors.subject = subjectValidation.error;

    const messageValidation = contactValidator.validateMessage(
      formData.message
    );
    if (!messageValidation.valid) errors.message = messageValidation.error;

    // Bug-specific required validations
    if (formData.type === "bug_report") {
      const expectedBehaviorValidation =
        contactValidator.validateBugDescription(
          formData.expectedBehavior,
          true
        );
      if (!expectedBehaviorValidation.valid)
        errors.expectedBehavior = expectedBehaviorValidation.error;

      const actualBehaviorValidation = contactValidator.validateBugDescription(
        formData.actualBehavior,
        true
      );
      if (!actualBehaviorValidation.valid)
        errors.actualBehavior = actualBehaviorValidation.error;

      // Steps to reproduce is optional
      if (formData.stepsToReproduce) {
        const stepsValidation = contactValidator.validateStepsToReproduce(
          formData.stepsToReproduce,
          false
        );
        if (!stepsValidation.valid)
          errors.stepsToReproduce = stepsValidation.error;
      }
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const uploadImages = async () => {
    if (images.length === 0) return [];

    const formDataUpload = new FormData();
    images.forEach((image) => {
      if (!image.uploaded && image.file) {
        formDataUpload.append("images", image.file);
      }
    });
    formDataUpload.append("type", formData.type);

    const response = await api.post("/contact/upload-images", formDataUpload, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    return response.data.images || [];
  };

  const buildSubmissionData = (uploadedImages) => {
    const baseData = {
      type: formData.type,
      name: formData.name,
      email: formData.email,
      phoneNumber: formData.phoneNumber || undefined, // Don't send empty string
      subject: formData.subject,
      message: formData.message,
    };

    // Add type-specific data
    if (formData.type === "bug_report") {
      baseData.bugDetails = {
        severity: formData.bugSeverity,
        expectedBehavior: formData.expectedBehavior,
        actualBehavior: formData.actualBehavior,
        stepsToReproduce: formData.stepsToReproduce,
        browser: formData.browser,
        deviceType: formData.deviceType,
        screenshots: uploadedImages.map((img) => ({
          url: img.url,
          key: img.key,
          filename: img.filename,
          fileSize: img.fileSize,
        })),
      };
    } else if (formData.type === "feedback") {
      baseData.feedbackDetails = {
        screenshots: uploadedImages.map((img) => ({
          url: img.url,
          key: img.key,
          filename: img.filename,
          fileSize: img.fileSize,
        })),
      };
    } else if (formData.type === "collaboration") {
      baseData.collaborationDetails = {
        proposalType: formData.proposalType,
        organizationName: formData.organizationName,
        website: formData.website,
      };
    }

    return baseData;
  };

  const resetFormData = () => {
    setFormData({
      type: "enquiry",
      name: isAuthenticated ? user?.profile?.username || "" : "",
      email: isAuthenticated ? user?.email || "" : "",
      phoneNumber: isAuthenticated ? user?.profile?.phoneNumber || "" : "",
      subject: "",
      message: "",
      bugSeverity: "medium",
      expectedBehavior: "",
      actualBehavior: "",
      stepsToReproduce: "",
      browser: "",
      deviceType: "desktop",
      proposalType: "partnership",
      organizationName: "",
      website: "",
    });
    setImages([]);
    setValidationErrors({});
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      showError("Please fix the errors before submitting");
      return;
    }

    setIsSubmitting(true);

    try {
      // Upload images first if present
      let uploadedImages = [];
      if (
        images.length > 0 &&
        ["bug_report", "feedback"].includes(formData.type)
      ) {
        uploadedImages = await uploadImages();
      }

      const submissionData = buildSubmissionData(uploadedImages);
      const response = await api.post("/contact/submit", submissionData);

      success(
        response.data.message ||
          "Your submission has been received. We'll get back to you soon!"
      );
      setSubmitSuccess(true);
      resetFormData();

      // Reset success message after 5 seconds
      setTimeout(() => setSubmitSuccess(false), 5000);
    } catch (err) {
      showError(
        err.response?.data?.message ||
          err.message ||
          "Failed to submit. Please try again later."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Container
      component="section"
      maxWidth="lg"
      sx={{ py: 4, px: { xs: 2, sm: 3 } }}
    >
      {/* Header */}
      <Box component="article" sx={{ textAlign: "center", mb: 4 }}>
        <Typography variant="h3" component="h1" sx={{ fontWeight: 700, mb: 2 }}>
          Contact Us
        </Typography>
        <Typography
          variant="h6"
          component="p"
          color="text.secondary"
          sx={{ mb: 3 }}
        >
          We're here to help! Choose how you'd like to reach out
        </Typography>
      </Box>

      <Grid container spacing={{ xs: 2, md: 4 }}>
        {/* Left Side - Contact Info */}
        <Grid component="aside" size={{ xs: 12, md: 4 }}>
          <ContactInfoCard />
        </Grid>

        {/* Right Side - Contact Form */}
        <Grid component="article" size={{ xs: 12, md: 8 }}>
          <Card component="section">
            <CardContent sx={{ p: { xs: 2, sm: 4 } }}>
              <FormAlerts
                submitSuccess={submitSuccess}
                validationErrors={validationErrors}
              />

              <Box component="form" onSubmit={handleSubmit} noValidate>
                {/* Submission Type Selection */}
                <Box component="nav" aria-label="Contact submission types">
                  <ContactTypeSelector
                    selectedType={formData.type}
                    onTypeChange={handleTypeChange}
                  />
                </Box>

                <Divider sx={{ my: 3 }} />

                {/* Contact Information and Message */}
                <ContactFormFields
                  formData={formData}
                  isAuthenticated={isAuthenticated}
                  validationErrors={validationErrors}
                  onChange={handleChange}
                />

                {/* Bug-Specific Fields */}
                {formData.type === "bug_report" && (
                  <BugDetailsSection
                    formData={formData}
                    images={images}
                    isSubmitting={isSubmitting}
                    onChange={handleChange}
                    onImagesChange={setImages}
                    validationErrors={validationErrors}
                  />
                )}

                {/* Feedback Image Upload */}
                {formData.type === "feedback" && (
                  <>
                    <Divider sx={{ my: 3 }} />
                    <Grid container spacing={2}>
                      <Grid size={{ xs: 12 }}>
                        <ImageUploadField
                          images={images}
                          onChange={setImages}
                          maxImages={5}
                          label="Screenshots (Optional)"
                          helperText="Upload images to illustrate your feedback"
                          disabled={isSubmitting}
                        />
                      </Grid>
                    </Grid>
                  </>
                )}

                {/* Collaboration-Specific Fields */}
                {formData.type === "collaboration" && (
                  <CollaborationDetailsSection
                    formData={formData}
                    onChange={handleChange}
                  />
                )}

                {/* Submit Button */}
                <Box sx={{ mt: 4, textAlign: "center" }}>
                  <Button
                    type="submit"
                    variant="contained"
                    size="large"
                    disabled={isSubmitting}
                    startIcon={
                      isSubmitting ? <CircularProgress size={20} /> : <Send />
                    }
                    sx={{ minWidth: 200 }}
                  >
                    {isSubmitting ? "Submitting..." : "Send Message"}
                  </Button>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
}

export default ContactUsPage;
