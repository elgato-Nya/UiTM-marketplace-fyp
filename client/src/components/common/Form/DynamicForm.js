import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  Box,
  Typography,
  Button,
  CircularProgress,
  Stepper,
  Step,
  StepLabel,
  StepContent,
} from "@mui/material";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";

import { useTheme } from "../../../hooks/useTheme";
import { useSnackbar } from "../../../hooks/useSnackbar";
import DynamicFormField from "./DynamicFormField";
import ErrorAlert from "../Alert/ErrorAlert";
import { parseError, mapServerErrorsToForm } from "../../../utils/errorUtils";

/**
 * DynamicForm Component
 *
 * PURPOSE: Flexible form component supporting both controlled and uncontrolled modes
 *
 * MODES:
 * - Uncontrolled (default): Form manages its own state internally
 * - Controlled: Parent manages state via values + onChange props
 *
 * CONTROLLED MODE:
 * Pass `values` and `onChange` props to enable controlled mode.
 * This allows form state to persist when the component remounts (e.g., tab navigation)
 */
function DynamicForm({
  config,
  validationSchema,
  onSubmit,
  onCancel,
  isLoading = false,
  error = null,
  defaultValues = {},
  resetOnSuccess = false,
  customContent = null, // Custom content to render before submit button
  showErrorAlert = true, // Show ErrorAlert component for server errors
  mapServerErrors = true, // Map server validation errors to form fields
  // Controlled mode props
  values = null, // External form values (enables controlled mode)
  onChange = null, // Callback when form values change
  hideSubmitButton = false, // Hide submit button (useful when using external submit)
}) {
  const { theme } = useTheme();
  const { showSnackbar } = useSnackbar();
  const [activeStep, setActiveStep] = useState(0);
  const [passwordVisibility, setPasswordVisibility] = useState({});

  // Determine if controlled mode is enabled
  const isControlled = values !== null && onChange !== null;

  // Merge default values with external values for controlled mode
  const mergedDefaultValues = isControlled
    ? { ...config.defaultValues, ...defaultValues, ...values }
    : { ...config.defaultValues, ...defaultValues };

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
    trigger,
    watch,
    reset,
    setError,
    setValue,
    getValues,
  } = useForm({
    resolver: validationSchema ? yupResolver(validationSchema) : undefined,
    defaultValues: mergedDefaultValues,
    mode: "onChange",
  });

  const watchedValues = watch();
  const isMultiStep = config.steps && config.steps.length > 1;

  // Track previous values to prevent infinite loops
  const prevValuesRef = useRef(values);
  const isInternalUpdate = useRef(false);

  // Sync external values to form (controlled mode)
  useEffect(() => {
    if (!isControlled) return;

    // Compare with previous values to prevent unnecessary resets
    const prevValues = prevValuesRef.current;
    if (prevValues === values) return;

    // Check if values actually changed (deep comparison for key fields)
    const hasChanged = Object.keys(values || {}).some(
      (key) => values[key] !== prevValues?.[key]
    );

    if (hasChanged && !isInternalUpdate.current) {
      // Reset form with new values while preserving other state
      Object.keys(values).forEach((key) => {
        if (values[key] !== getValues(key)) {
          setValue(key, values[key], { shouldValidate: false });
        }
      });
    }

    prevValuesRef.current = values;
  }, [values, isControlled, setValue, getValues]);

  // Notify parent of form changes (controlled mode)
  const notifyChange = useCallback(
    (newValues) => {
      if (isControlled && onChange) {
        isInternalUpdate.current = true;
        onChange(newValues);
        // Reset flag after a tick to allow next external update
        setTimeout(() => {
          isInternalUpdate.current = false;
        }, 0);
      }
    },
    [isControlled, onChange]
  );

  // Watch for form changes and notify parent
  useEffect(() => {
    if (!isControlled) return;

    // Debounce to avoid excessive updates
    const timeoutId = setTimeout(() => {
      notifyChange(watchedValues);
    }, 50);

    return () => clearTimeout(timeoutId);
  }, [watchedValues, isControlled, notifyChange]);

  // Reset form and stepper ONLY on successful submission (no error) if resetOnSuccess is true
  // This ensures form state is maintained when 4xx errors occur
  useEffect(() => {
    if (resetOnSuccess && !isLoading && !error) {
      reset();
      setActiveStep(0);
      setPasswordVisibility({});
    }
  }, [resetOnSuccess, isLoading, error, reset]);

  // Map server validation errors to form fields when error changes
  useEffect(() => {
    if (error && mapServerErrors) {
      const parsedError = parseError(error);
      if (
        parsedError.validationErrors &&
        parsedError.validationErrors.length > 0
      ) {
        mapServerErrorsToForm(parsedError.validationErrors, setError);
      }
    }
  }, [error, mapServerErrors, setError]);

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

    if (!isStepValid) {
      // Get the first error to show in toast
      const stepErrors = fieldsToValidate
        .map((fieldName) => {
          const keys = fieldName.split(".");
          let error = errors;
          for (const key of keys) {
            if (error?.[key]) error = error[key];
            else return null;
          }
          return error?.message;
        })
        .filter(Boolean);

      if (stepErrors.length > 0) {
        showSnackbar(
          stepErrors.length === 1
            ? stepErrors[0]
            : `Please fix ${stepErrors.length} error${stepErrors.length > 1 ? "s" : ""} before continuing`,
          "error"
        );
      }
      return;
    }

    setActiveStep((prev) => prev + 1);
  };

  // Handle previous step
  const handleBackStep = () => {
    setActiveStep((prev) => prev - 1);
  };

  // Handle form submission
  const handleFormSubmit = async (data) => {
    try {
      // Validate all fields before submission
      const isValid = await trigger();

      if (!isValid) {
        // Count total errors
        const countErrors = (obj) => {
          let count = 0;
          for (const key in obj) {
            if (obj[key]?.message) count++;
            else if (typeof obj[key] === "object")
              count += countErrors(obj[key]);
          }
          return count;
        };

        const errorCount = countErrors(errors);
        showSnackbar(
          `Please fix ${errorCount} validation error${errorCount > 1 ? "s" : ""} before submitting`,
          "error"
        );
        return;
      }

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
      <Box sx={{ mt: 2, backgroundColor: "transparent" }}>
        {step.description && (
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ my: { xs: 1, md: 1.5 } }}
          >
            {step.description}
          </Typography>
        )}

        {fields.map(renderField)}

        {/* Step Navigation - hidden when hideSubmitButton is true */}
        {!hideSubmitButton && (
          <Box sx={{ mb: 2, mt: 3 }}>
            <Box
              sx={{
                display: "flex",
                gap: 1.5,
                flexWrap: "wrap",
                justifyContent: "flex-start",
              }}
            >
              <Button
                disabled={stepIndex === 0 || isLoading || isSubmitting}
                onClick={handleBackStep}
                variant="outlined"
                size="medium"
                sx={{
                  minWidth: { xs: 90, sm: 100 },
                  px: { xs: 2, sm: 2.5 },
                }}
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
                    minWidth: { xs: 140, sm: 160 },
                    px: { xs: 3, sm: 4 },
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
                      minWidth: { xs: 90, sm: 100 },
                      px: { xs: 3, sm: 3.5 },
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
                        sx={{
                          ml: "auto",
                          minWidth: { xs: 120, sm: 140 },
                          px: 2,
                        }}
                      >
                        Jump to Save →
                      </Button>
                    )}
                </>
              )}
            </Box>
          </Box>
        )}
      </Box>
    );
  };

  return (
    <Box sx={{ width: "100%", maxWidth: config.maxWidth || 750, mx: "auto" }}>
      {/* Form Header */}
      {config.title && (
        <Box sx={{ textAlign: "center", mb: 0, mt: { xs: 2, md: 3 } }}>
          <Typography
            variant="h4"
            component="h1"
            sx={{
              fontWeight: "bold",
              color: theme.palette.text.primary,
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

      {/* Error Alert - Enhanced with ErrorAlert component */}
      {error && showErrorAlert && (
        <ErrorAlert error={error} sx={{ mb: 3, mt: 2 }} compact={false} />
      )}

      {/* Form Content */}
      <Box sx={{ mx: { xs: 1, md: 4 } }}>
        {isMultiStep ? (
          // Multi-step form
          <Stepper
            activeStep={activeStep}
            orientation="vertical"
            sx={{
              backgroundColor: "transparent",
              // Target all MUI internal elements that could add backgrounds
              "& .MuiStep-root": {
                backgroundColor: "transparent",
              },
              "& .MuiStepContent-root": {
                borderColor: theme.palette.divider,
                backgroundColor: "transparent",
              },
              "& .MuiCollapse-root": {
                backgroundColor: "transparent",
              },
              "& .MuiCollapse-wrapper": {
                backgroundColor: "transparent",
              },
              "& .MuiCollapse-wrapperInner": {
                backgroundColor: "transparent",
              },
            }}
          >
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

            {/* Custom content slot (e.g., forgot password link) */}
            {customContent && <Box>{customContent}</Box>}

            {/* Submit button section - can be hidden for external submit control */}
            {!hideSubmitButton && (
              <Box
                sx={{
                  display: "flex",
                  gap: 2,
                  mt: 3,
                  justifyContent: "flex-start",
                }}
              >
                {onCancel && (
                  <Button
                    variant="outlined"
                    size="medium"
                    onClick={onCancel}
                    disabled={isLoading || isSubmitting}
                    sx={{
                      minWidth: { xs: 90, sm: 110 },
                      px: { xs: 2, sm: 2.5 },
                    }}
                  >
                    {config.cancelButton?.text || "Cancel"}
                  </Button>
                )}
                <Button
                  type="submit"
                  variant="contained"
                  size="medium"
                  fullWidth
                  disabled={isLoading || isSubmitting}
                  sx={{
                    mx: { xs: 3, md: 4 },
                    minWidth: { xs: 140, sm: 160 },
                    py: 1.5,
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
            )}
          </Box>
        )}
      </Box>
    </Box>
  );
}

export default DynamicForm;
