import { useState, useCallback } from "react";
import authService from "../../auth/service/authService";
import { useSnackbar } from "../../../hooks/useSnackbar";

/**
 * useMerchantVerification Hook
 *
 * PURPOSE: Handle merchant verification workflow
 * FEATURES:
 * - Submit UiTM email for verification
 * - Verify email with token
 * - Update business email
 * - Error handling and loading states
 */

export function useMerchantVerification() {
  const { showSnackbar } = useSnackbar();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [verificationStatus, setVerificationStatus] = useState(null);

  /**
   * Submit UiTM email for merchant verification
   */
  const submitVerification = useCallback(
    async (verificationEmail) => {
      setIsLoading(true);
      setError(null);

      try {
        const response =
          await authService.submitMerchantVerification(verificationEmail);

        if (response.success) {
          setVerificationStatus(response.data.status);
          showSnackbar(
            response.data.message ||
              "Verification email sent! Check your UiTM inbox.",
            "success"
          );
          return { success: true, data: response.data };
        } else {
          throw new Error(response.message || "Failed to submit verification");
        }
      } catch (err) {
        const errorMessage =
          err.response?.data?.message ||
          err.message ||
          "Failed to submit verification";
        setError(errorMessage);
        showSnackbar(errorMessage, "error");
        return { success: false, error: errorMessage };
      } finally {
        setIsLoading(false);
      }
    },
    [showSnackbar]
  );

  /**
   * Verify merchant email with token
   */
  const verifyEmail = useCallback(
    async (token) => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await authService.verifyMerchantEmail(token);

        if (response.success) {
          setVerificationStatus("verified");
          showSnackbar(
            response.data.message ||
              "Merchant status verified successfully! 🎉",
            "success"
          );
          return { success: true, data: response.data };
        } else {
          throw new Error(response.message || "Verification failed");
        }
      } catch (err) {
        const errorMessage =
          err.response?.data?.message || err.message || "Verification failed";
        setError(errorMessage);
        showSnackbar(errorMessage, "error");
        return { success: false, error: errorMessage };
      } finally {
        setIsLoading(false);
      }
    },
    [showSnackbar]
  );

  /**
   * Update business contact email
   */
  const updateBusinessEmail = useCallback(
    async (businessEmail) => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await authService.updateBusinessEmail(businessEmail);

        if (response.success) {
          showSnackbar("Business email updated successfully", "success");
          return { success: true, data: response.data };
        } else {
          throw new Error(
            response.message || "Failed to update business email"
          );
        }
      } catch (err) {
        const errorMessage =
          err.response?.data?.message ||
          err.message ||
          "Failed to update business email";
        setError(errorMessage);
        showSnackbar(errorMessage, "error");
        return { success: false, error: errorMessage };
      } finally {
        setIsLoading(false);
      }
    },
    [showSnackbar]
  );

  /**
   * Clear error state
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    isLoading,
    error,
    verificationStatus,
    submitVerification,
    verifyEmail,
    updateBusinessEmail,
    clearError,
  };
}
