import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Button,
  Alert,
  CircularProgress,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Paper,
} from "@mui/material";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";

import { useTheme } from "../../../hooks/useTheme";
import DynamicFormField from "./DynamicFormField";

function DynamicForm({
  config,
  validationSchema,
  onSubmit,
  onCancel,
  isLoading = false,
  error = null,
  defaultValues = {},
  resetOnSuccess = false,
}) {
  const { theme } = useTheme();
  const [activeStep, setActiveStep] = useState(0);
  const [passwordVisibility, setPasswordVisibility] = useState({});

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
    trigger,
    watch,
    setValue,
    reset,
  } = useForm({
    resolver: validationSchema ? yupResolver(validationSchema) : undefined,
    defaultValues: { ...config.defaultValues, ...defaultValues },
    mode: "onChange",
  });

  const watchedValues = watch();
  const isMultiStep = config.steps && config.steps.length > 1;

  // Reset form and stepper on successful submission if resetOnSuccess is true
  useEffect(() => {
    if (resetOnSuccess && isLoading && !error) {
      reset();
      setActiveStep(0);
      setPasswordVisibility({});
    }
  }, [resetOnSuccess, isLoading, error, reset]);

  // Handle password visibility toggle
  const handleTogglePassword = (fieldname) => {
    setPasswordVisibility((prev) => ({
      ...prev,
      [fieldname]: !prev[fieldname],
    }));
  };

  // Check if field should be shown based on conditional logic
  const shouldShowField = (field) => {
    if (!field.showIf) return true;
    return field.showIf(watchedValues);
  };

  // Get field names for validation
  const getFieldNamesForStep = (stepIndex) => {
    if (!isMultiStep) {
      return config.fields?.map((field) => field.name) || [];
    }

    return config.steps[stepIndex]?.fields?.map((field) => field.name) || [];
  };

  const getCurrentFields = () => {
    return (config.fields || []).filter(shouldShowField);
  };

  // Handle next step
  const handleNextStep = async () => {
    const fieldsToValidate = getFieldNamesForStep(activeStep);
    const isStepValid = await trigger(fieldsToValidate);

    if (isStepValid) {
      setActiveStep((prev) => prev + 1);
    }
  };

  // Handle previous step
  const handleBackStep = () => {
    setActiveStep((prev) => prev - 1);
  };

  // Handle form submission
  const handleFormSubmit = async (data) => {
    try {
      await onSubmit(data);
    } catch (error) {
      console.error("Form submission error:", error);
    }
  };

  // Render field with dynamic props
  const renderField = (field) => {
    // Destructure to separate DOM props from custom props
    const { dynamicOptions, showIf, ...fieldProps } = field;

    const finalFieldProps = {
      ...fieldProps,
      control,
      errors,
      disabled: fieldProps.disabled || isLoading || isSubmitting,
    };

    // Handle password fields
    if (field.type === "password") {
      finalFieldProps.showPassword = passwordVisibility[field.name] || false;
      finalFieldProps.onTogglePassword = () => handleTogglePassword(field.name);
    }

    // Handle dynamic options for select fields
    if (dynamicOptions) {
      finalFieldProps.options = dynamicOptions(watchedValues);
    }

    return <DynamicFormField key={field.name} {...finalFieldProps} />;
  };

  // Render step content
  const renderStepContent = (stepIndex) => {
    const step = config.steps[stepIndex];
    const fields = step.fields.filter(shouldShowField);

    return (
      <Box sx={{ mt: 2 }}>
        {step.description && (
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            {step.description}
          </Typography>
        )}

        {fields.map(renderField)}

        {/* Step Navigation */}
        <Box sx={{ mt: 3, mb: 2 }}>
          <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
            <Button
              disabled={stepIndex === 0 || isLoading || isSubmitting}
              onClick={handleBackStep}
              variant="outlined"
              size="medium"
            >
              Back
            </Button>

            {stepIndex === config.steps.length - 1 ? (
              <Button
                onClick={handleSubmit(handleFormSubmit)}
                variant="contained"
                disabled={isLoading || isSubmitting}
                size="medium"
                sx={{
                  bgcolor: theme.palette.primary.main,
                  "&:hover": { bgcolor: theme.palette.primary.dark },
                }}
              >
                {isLoading || isSubmitting ? (
                  <>
                    <CircularProgress size={20} sx={{ mr: 1 }} />
                    {config.submitText || "Submitting..."}
                  </>
                ) : (
                  config.submitText || "Submit"
                )}
              </Button>
            ) : (
              <>
                <Button
                  onClick={handleNextStep}
                  variant="contained"
                  size="medium"
                  sx={{
                    bgcolor: theme.palette.primary.main,
                    "&:hover": { bgcolor: theme.palette.primary.dark },
                  }}
                >
                  Next
                </Button>

                {/* Quick Jump to Final Step for Edit Mode */}
                {config.allowQuickSave &&
                  stepIndex < config.steps.length - 1 && (
                    <Button
                      onClick={() => setActiveStep(config.steps.length - 1)}
                      variant="outlined"
                      size="medium"
                      color="secondary"
                      sx={{ ml: "auto" }}
                    >
                      Jump to Save →
                    </Button>
                  )}
              </>
            )}
          </Box>
        </Box>
      </Box>
    );
  };

  return (
    <Box sx={{ width: "100%", maxWidth: config.maxWidth || 750, mx: "auto" }}>
      {/* Form Header */}
      {config.title && (
        <Box sx={{ textAlign: "center", mb: 4 }}>
          <Typography
            variant="h4"
            component="h1"
            sx={{
              fontWeight: "bold",
              color: theme.palette.primary.main,
              mb: 1,
            }}
          >
            {config.title}
          </Typography>
          {config.subtitle && (
            <Typography variant="body1" color="text.secondary">
              {config.subtitle}
            </Typography>
          )}
        </Box>
      )}

      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Form Content */}
      <Paper elevation={0} sx={{ p: 3 }}>
        {isMultiStep ? (
          // Multi-step form
          <Stepper activeStep={activeStep} orientation="vertical">
            {config.steps.map((step, index) => (
              <Step key={step.label || step.title || `Step ${index + 1}`}>
                <StepLabel>
                  <Typography variant="subtitle1" fontWeight="medium">
                    {step.label || step.title || `Step ${index + 1}`}
                  </Typography>
                  {step.subtitle && (
                    <Typography variant="caption" color="text.secondary">
                      {step.subtitle}
                    </Typography>
                  )}
                </StepLabel>
                <StepContent>{renderStepContent(index)}</StepContent>
              </Step>
            ))}
          </Stepper>
        ) : (
          // Single-step form
          <Box
            component="form"
            onSubmit={handleSubmit(handleFormSubmit)}
            noValidate
          >
            {getCurrentFields().map(renderField)}

            <Box sx={{ display: "flex", gap: 2, mt: 2 }}>
              {onCancel && (
                <Button
                  variant="outlined"
                  size="large"
                  onClick={onCancel}
                  disabled={isLoading || isSubmitting}
                  sx={{ py: 1.5, flex: 1 }}
                >
                  {config.cancelButton?.text || "Cancel"}
                </Button>
              )}
              <Button
                type="submit"
                variant="contained"
                size="large"
                disabled={isLoading || isSubmitting}
                sx={{
                  py: 1.5,
                  flex: 1,
                  bgcolor: theme.palette.primary.main,
                  "&:hover": { bgcolor: theme.palette.primary.dark },
                }}
              >
                {isLoading || isSubmitting ? (
                  <>
                    <CircularProgress size={20} sx={{ mr: 1 }} />
                    {config.submitButton?.loadingText || "Submitting..."}
                  </>
                ) : (
                  config.submitButton?.text || "Submit"
                )}
              </Button>
            </Box>
          </Box>
        )}
      </Paper>
    </Box>
  );
}

export default DynamicForm;
