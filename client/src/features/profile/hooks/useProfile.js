import { useSelector, useDispatch } from "react-redux";
import { useCallback } from "react";

import {
  fetchUserProfile,
  updateUserProfile,
  changePassword,
  updateUser,
} from "../store/profileSlice";

export function useProfile() {
  const dispatch = useDispatch();
  // Get profile data from profile slice
  const profileData = useSelector((state) => state.profile?.user || null);
  const profileRoles = useSelector((state) => state.profile?.roles || []);

  // Use profile data if available, otherwise fallback to auth data
  const profile = profileData;
  const roles = profileRoles.length > 0 ? profileRoles : [];
  const isLoading = useSelector((state) => state.profile?.isLoading || false);
  const error = useSelector((state) => state.profile?.error || null);
  const success = useSelector((state) => state.profile?.success || null);

  // Profile related actions
  const loadUserProfile = useCallback(() => {
    // Always fetch to ensure fresh data (important after login/logout)
    dispatch(fetchUserProfile());
  }, [dispatch]);

  const saveUserProfile = useCallback(
    async (profileData) => {
      try {
        // Trigger profile service update first
        const result = await dispatch(updateUserProfile(profileData));

        // If successful, also update user data in auth slice for immediate UI update
        if (result.meta.requestStatus === "fulfilled" && result.payload?.user) {
          dispatch(updateUser(result.payload.user));
        }

        return result;
      } catch (error) {
        throw error;
      }
    },
    [dispatch]
  );

  const handleChangePassword = useCallback(
    (passwords) => {
      dispatch(changePassword(passwords));
    },
    [dispatch]
  );

  return {
    profile,
    user: profile, // Alias for backward compatibility
    roles,
    isLoading,
    error,
    success,
    loadUserProfile,
    saveUserProfile,
    updateProfile: saveUserProfile, // Alias for backward compatibility
    handleChangePassword,
    profileData,
  };
}
