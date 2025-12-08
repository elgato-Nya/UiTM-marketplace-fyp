import { useState, useCallback } from "react";
import { useSnackbar } from "../../../hooks/useSnackbar";
import adminUserService from "../../../services/admin/userService";

/**
 * useUserActions Custom Hook
 *
 * PURPOSE: Handle individual user actions with proper state management
 * FEATURES:
 * - Suspend/activate users
 * - Update user roles
 * - Verify user email manually
 * - Reset user password
 * - Bulk operations support
 * - Optimistic updates
 * - Error handling and rollback
 *
 * PATTERN: Specialized action hook similar to mutation hooks
 */
const useUserActions = () => {
  const { showSnackbar } = useSnackbar();

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastAction, setLastAction] = useState(null);

  /**
   * Suspend a user
   * @param {string} userId - User ID
   * @param {string} reason - Suspension reason (required)
   * @param {Function} onSuccess - Success callback
   */
  const suspendUser = useCallback(
    async (userId, reason, onSuccess) => {
      if (!reason || reason.trim().length < 10) {
        showSnackbar(
          "Suspension reason must be at least 10 characters",
          "warning"
        );
        return { success: false };
      }

      try {
        setIsLoading(true);
        setError(null);

        await adminUserService.updateUserStatus(userId, true, reason);

        setLastAction({ type: "suspend", userId, timestamp: new Date() });
        showSnackbar("User suspended successfully", "success");

        if (onSuccess) onSuccess();
        return { success: true };
      } catch (err) {
        const errorMessage =
          err.response?.data?.message || "Failed to suspend user";
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
   * Activate a user (unsuspend)
   * @param {string} userId - User ID
   * @param {Function} onSuccess - Success callback
   */
  const activateUser = useCallback(
    async (userId, onSuccess) => {
      try {
        setIsLoading(true);
        setError(null);

        await adminUserService.updateUserStatus(userId, false, "");

        setLastAction({ type: "activate", userId, timestamp: new Date() });
        showSnackbar("User activated successfully", "success");

        if (onSuccess) onSuccess();
        return { success: true };
      } catch (err) {
        const errorMessage =
          err.response?.data?.message || "Failed to activate user";
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
   * Update user roles
   * @param {string} userId - User ID
   * @param {string[]} roles - Array of roles (consumer/merchant/admin)
   * @param {Function} onSuccess - Success callback
   */
  const updateRoles = useCallback(
    async (userId, roles, onSuccess) => {
      if (!roles || roles.length === 0) {
        showSnackbar("Please select at least one role", "warning");
        return { success: false };
      }

      // Validate roles
      const validRoles = ["consumer", "merchant", "admin"];
      const invalidRoles = roles.filter((role) => !validRoles.includes(role));
      if (invalidRoles.length > 0) {
        showSnackbar("Invalid roles selected", "warning");
        return { success: false };
      }

      try {
        setIsLoading(true);
        setError(null);

        await adminUserService.updateUserRoles(userId, roles);

        setLastAction({
          type: "updateRoles",
          userId,
          roles,
          timestamp: new Date(),
        });
        showSnackbar("User roles updated successfully", "success");

        if (onSuccess) onSuccess();
        return { success: true };
      } catch (err) {
        const errorMessage =
          err.response?.data?.message || "Failed to update user roles";
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
   * Verify user email manually
   * @param {string} userId - User ID
   * @param {Function} onSuccess - Success callback
   */
  const verifyEmail = useCallback(
    async (userId, onSuccess) => {
      try {
        setIsLoading(true);
        setError(null);

        await adminUserService.verifyUserEmail(userId);

        setLastAction({ type: "verify", userId, timestamp: new Date() });
        showSnackbar("User email verified successfully", "success");

        if (onSuccess) onSuccess();
        return { success: true };
      } catch (err) {
        const errorMessage =
          err.response?.data?.message || "Failed to verify user email";
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
   * Reset user password
   * @param {string} userId - User ID
   * @param {Function} onSuccess - Success callback with temp password
   */
  const resetPassword = useCallback(
    async (userId, onSuccess) => {
      try {
        setIsLoading(true);
        setError(null);

        const response = await adminUserService.resetUserPassword(userId);

        setLastAction({
          type: "resetPassword",
          userId,
          timestamp: new Date(),
        });

        // Show temp password in a more permanent way
        const tempPassword = response.tempPassword;
        showSnackbar(
          `Password reset successful. Temp password: ${tempPassword}`,
          "success",
          10000 // Show for 10 seconds
        );

        if (onSuccess) onSuccess(tempPassword);
        return { success: true, tempPassword };
      } catch (err) {
        const errorMessage =
          err.response?.data?.message || "Failed to reset user password";
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
   * Perform bulk operation on multiple users
   * @param {string[]} userIds - Array of user IDs (max 50)
   * @param {string} action - Action to perform (suspend/activate/verify)
   * @param {string} reason - Reason (required for suspend)
   * @param {Function} onSuccess - Success callback with results
   */
  const bulkOperation = useCallback(
    async (userIds, action, reason = "", onSuccess) => {
      // Validate user IDs
      if (!userIds || userIds.length === 0) {
        showSnackbar("Please select at least one user", "warning");
        return { success: false };
      }

      if (userIds.length > 50) {
        showSnackbar(
          "Cannot perform bulk operations on more than 50 users at once",
          "warning"
        );
        return { success: false };
      }

      // Validate reason for suspend
      if (action === "suspend" && (!reason || reason.trim().length < 10)) {
        showSnackbar(
          "Suspension reason must be at least 10 characters",
          "warning"
        );
        return { success: false };
      }

      try {
        setIsLoading(true);
        setError(null);

        const response = await adminUserService.bulkUpdateUsers({
          userIds,
          action,
          reason,
        });

        const { successful, failed, results } = response;

        setLastAction({
          type: "bulk",
          action,
          userCount: userIds.length,
          timestamp: new Date(),
        });

        // Show appropriate message based on results
        if (failed > 0) {
          showSnackbar(
            `Bulk operation completed. ${successful} succeeded, ${failed} failed.`,
            "warning"
          );
        } else {
          showSnackbar(
            `Bulk operation completed successfully. ${successful} users updated.`,
            "success"
          );
        }

        if (onSuccess) onSuccess(response);
        return { success: true, results: response };
      } catch (err) {
        const errorMessage =
          err.response?.data?.message || "Bulk operation failed";
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

  /**
   * Clear last action
   */
  const clearLastAction = useCallback(() => {
    setLastAction(null);
  }, []);

  return {
    // State
    isLoading,
    error,
    lastAction,

    // Actions
    suspendUser,
    activateUser,
    updateRoles,
    verifyEmail,
    resetPassword,
    bulkOperation,

    // Utilities
    clearError,
    clearLastAction,
  };
};

export default useUserActions;
